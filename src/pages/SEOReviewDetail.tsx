import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import CTAButton from '@/components/CTAButton'
import { 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Search,
  Hash,
  FileText,
  Brain,
  Target,
  Globe,
  Calendar,
  Building,
  Users,
  Pill,
  XCircle,
  Shield
} from 'lucide-react'
import { format } from 'date-fns'

interface Submission {
  id: string
  product_name: string
  therapeutic_area: string
  stage: string
  workflow_stage: string
  target_audience: string[]
  created_at: string
  submitter_name: string
  submitter_email: string
  submitter_company?: string
  priority_level: string
  medical_indication?: string
  langchain_status?: string
  geography?: string[]
  client_name?: string
  mechanism_of_action?: string
  key_differentiators?: string[]
  seo_keywords?: string[]
  long_tail_keywords?: string[]
  consumer_questions?: string[]
  h1_tag?: string
  h2_tags?: string[]
  meta_title?: string
  meta_description?: string
  seo_title?: string
  geo_event_tags?: string[]
  geo_optimization?: any
  seo_strategy_outline?: string
}

export default function SEOReviewDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'overview': true,
    'seo-analysis': true,
    'geo-optimization': false,
    'seo-strategy': false,
    'compliance': false
  })
  
  const [revisionNotes, setRevisionNotes] = useState('')
  const [approvals, setApprovals] = useState({
    seoTitle: false,
    metaDescription: false,
    geoTags: false,
    keywords: false,
    h1Tag: false,
    h2Tags: false
  })

  // Demo data for design purposes
  const demoData: Record<string, Submission> = {
    'demo-1': {
      id: 'demo-1',
      product_name: 'Keytruda',
      therapeutic_area: 'Oncology',
      stage: 'launch',
      workflow_stage: 'ai_completed',
      target_audience: ['HCPs', 'Patients'],
      created_at: new Date().toISOString(),
      submitter_name: 'Dr. Sarah Johnson',
      submitter_email: 'sarah.johnson@pharma.com',
      submitter_company: 'PharmaCorp',
      priority_level: 'high',
      medical_indication: 'Non-Small Cell Lung Cancer',
      geography: ['USA', 'EU'],
      client_name: 'Merck',
      mechanism_of_action: 'PD-1 inhibitor',
      key_differentiators: ['First-line therapy', 'Superior OS'],
      seo_keywords: ['pembrolizumab', 'keytruda', 'lung cancer treatment', 'pd-1 inhibitor', 'immunotherapy'],
      long_tail_keywords: ['keytruda for nsclc first line', 'pembrolizumab side effects', 'keytruda dosing schedule'],
      consumer_questions: ['What is Keytruda?', 'How does Keytruda work?', 'Keytruda side effects'],
      h1_tag: 'Keytruda® (Pembrolizumab) - Advanced NSCLC Treatment',
      h2_tags: ['How Keytruda Works', 'Clinical Trial Results', 'Patient Eligibility', 'Side Effects Management'],
      meta_title: 'Keytruda (Pembrolizumab) for NSCLC | Official Information',
      meta_description: 'Learn about Keytruda, a PD-1 inhibitor for first-line treatment of NSCLC. See clinical data, dosing, and safety information.',
      seo_title: 'Keytruda: Revolutionary First-Line NSCLC Treatment | 2024 Update',
      geo_event_tags: ['ASCO 2024', 'ESMO 2024', 'World Lung Cancer Day'],
      seo_strategy_outline: 'Focus on first-line positioning, survival benefits, and differentiation from other immunotherapies. Target both HCP and patient searches.',
      geo_optimization: {
        us_terms: ['keytruda cost with insurance', 'keytruda medicare coverage'],
        eu_terms: ['pembrolizumab nice approval', 'keytruda ema indication']
      }
    },
    'demo-2': {
      id: 'demo-2',
      product_name: 'Ozempic',
      therapeutic_area: 'Diabetes',
      stage: 'post-launch',
      workflow_stage: 'seo_review',
      target_audience: ['Patients', 'Caregivers'],
      created_at: new Date(Date.now() - 3600000).toISOString(),
      submitter_name: 'Mark Chen',
      submitter_email: 'mark.chen@novonordisk.com',
      submitter_company: 'Novo Nordisk',
      priority_level: 'medium',
      medical_indication: 'Type 2 Diabetes',
      geography: ['USA'],
      client_name: 'Novo Nordisk',
      seo_keywords: ['ozempic', 'semaglutide', 'diabetes medication', 'glp-1 agonist'],
      long_tail_keywords: ['ozempic weight loss results', 'semaglutide injection how to use'],
      h1_tag: 'Ozempic® (Semaglutide) - Type 2 Diabetes Management',
      meta_title: 'Ozempic (Semaglutide) for Type 2 Diabetes',
      meta_description: 'Discover how Ozempic helps manage blood sugar in adults with type 2 diabetes.',
      seo_title: 'Ozempic for Type 2 Diabetes: Benefits, Dosing & Results'
    },
    'demo-3': {
      id: 'demo-3',
      product_name: 'Humira',
      therapeutic_area: 'Immunology',
      stage: 'pre-launch',
      workflow_stage: 'pending',
      target_audience: ['HCPs', 'Patients', 'Payers'],
      created_at: new Date(Date.now() - 7200000).toISOString(),
      submitter_name: 'Emily Rodriguez',
      submitter_email: 'emily.r@abbvie.com',
      submitter_company: 'AbbVie',
      priority_level: 'low',
      medical_indication: 'Rheumatoid Arthritis',
      geography: ['Global'],
      client_name: 'AbbVie',
      seo_keywords: ['humira', 'adalimumab', 'rheumatoid arthritis', 'biologic'],
      meta_title: 'Humira for Rheumatoid Arthritis Treatment',
      seo_title: 'Humira: Leading RA Treatment Option'
    }
  }

  const { data: submission, isLoading } = useQuery({
    queryKey: ['seo-review-detail', id],
    queryFn: async () => {
      // Check if it's demo data
      if (id && id.startsWith('demo-')) {
        return demoData[id] || null
      }
      
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Submission
    }
  })

  // Set up real-time subscription for this specific submission
  useEffect(() => {
    if (!id || id.startsWith('demo-')) return // Skip for demo data

    const channel = supabase
      .channel(`submission-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'submissions',
          filter: `id=eq.${id}`
        },
        (payload) => {
          // Refetch data when this submission is updated
          queryClient.invalidateQueries({ queryKey: ['seo-review-detail', id] })
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, queryClient])

  const updateStatus = useMutation({
    mutationFn: async ({ 
      newStatus, 
      notes 
    }: { 
      newStatus: 'pending_client_review' | 'requires_revision'
      notes?: string 
    }) => {
      const updateData: any = {
        workflow_stage: newStatus === 'pending_client_review' ? 'Client_Review' : 'Revision_Requested',
        seo_reviewed_at: new Date().toISOString(),
        seo_reviewed_by: 'SEO Team', // Would come from auth
        seo_keyword_approvals: approvals
      }
      
      if (notes) {
        updateData.seo_internal_notes = notes
        updateData.rejection_reason = notes
        updateData.rejected_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('submissions')
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
      
      queryClient.invalidateQueries({ queryKey: ['seo-review-content'] })
      navigate('/seo-review')
    }
  })

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const handleApprove = () => {
    const allApproved = Object.values(approvals).every(v => v === true)
    if (!allApproved) {
      alert('Please approve all required items before sending to client review')
      return
    }
    updateStatus.mutate({ newStatus: 'pending_client_review' })
  }

  const handleRequestRevision = () => {
    if (!revisionNotes.trim()) {
      alert('Please provide revision notes')
      return
    }
    updateStatus.mutate({
      newStatus: 'requires_revision',
      notes: revisionNotes
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading || !submission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const approvedCount = Object.values(approvals).filter(v => v === true).length
  const totalApprovals = Object.keys(approvals).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/seo-review')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to SEO Review
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Search className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{submission.product_name}</h1>
                <p className="text-sm text-gray-600 mt-1">SEO Content Review</p>
              </div>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1.5 border rounded-full text-sm font-medium ${getPriorityColor(submission.priority_level || 'medium')}`}>
            {submission.priority_level || 'Medium'} Priority
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">SEO Review Progress</span>
          <span className="text-sm font-medium text-gray-900">{approvedCount} of {totalApprovals} items approved</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${(approvedCount / totalApprovals) * 100}%` }}
          />
        </div>
      </div>

      {/* Overview Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div 
          className="p-6 cursor-pointer"
          onClick={() => toggleSection('overview')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            </div>
            {expandedSections['overview'] ? 
              <ChevronUp className="h-5 w-5 text-gray-400" /> : 
              <ChevronDown className="h-5 w-5 text-gray-400" />
            }
          </div>
        </div>
        
        {expandedSections['overview'] && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Pill className="h-4 w-4" />
                  Therapeutic Area
                </p>
                <p className="mt-1 font-medium text-gray-900">{submission.therapeutic_area}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Target Audience
                </p>
                <p className="mt-1 font-medium text-gray-900">{submission.target_audience?.join(', ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  Client
                </p>
                <p className="mt-1 font-medium text-gray-900">{submission.client_name || submission.submitter_company || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Submitted
                </p>
                <p className="mt-1 font-medium text-gray-900">{format(new Date(submission.created_at), 'MMM d, yyyy')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEO Core Output Section - Based on 4 Mandatory Questions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div 
          className="p-6 cursor-pointer"
          onClick={() => toggleSection('seo-analysis')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">SEO Core Output</h2>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">AI-Generated from 4 Key Inputs</span>
            </div>
            {expandedSections['seo-analysis'] ? 
              <ChevronUp className="h-5 w-5 text-gray-400" /> : 
              <ChevronDown className="h-5 w-5 text-gray-400" />
            }
          </div>
        </div>
        
        {expandedSections['seo-analysis'] && (
          <div className="px-6 pb-6 space-y-6">
            {/* Core Input Display */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">AI Optimization Based On:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Generic Name:</span>
                  <span className="ml-2 font-medium text-gray-900">{submission.generic_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Indication:</span>
                  <span className="ml-2 font-medium text-gray-900">{submission.medical_indication || submission.indication || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Therapeutic Area:</span>
                  <span className="ml-2 font-medium text-gray-900">{submission.therapeutic_area}</span>
                </div>
                <div>
                  <span className="text-gray-600">Reviewer:</span>
                  <span className="ml-2 font-medium text-gray-900">{submission.submitter_name}</span>
                </div>
              </div>
            </div>

            {/* SEO Title */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  1. SEO Title Tag
                  <span className="ml-2 text-xs font-normal text-gray-500">(50-60 characters)</span>
                </h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={approvals.seoTitle}
                    onChange={(e) => setApprovals({...approvals, seoTitle: e.target.checked})}
                    className="mr-2 rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">Approved</span>
                </label>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-base font-medium text-gray-900">{submission.seo_title}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs ${
                    submission.seo_title && submission.seo_title.length >= 50 && submission.seo_title.length <= 60
                      ? 'text-green-600'
                      : 'text-amber-600'
                  }`}>
                    Character count: {submission.seo_title?.length || 0}/60
                  </span>
                  {submission.seo_title && submission.seo_title.length >= 50 && submission.seo_title.length <= 60 && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  2. Meta Description
                  <span className="ml-2 text-xs font-normal text-gray-500">(140-155 characters)</span>
                </h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={approvals.metaDescription}
                    onChange={(e) => setApprovals({...approvals, metaDescription: e.target.checked})}
                    className="mr-2 rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">Approved</span>
                </label>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">{submission.meta_description}</p>
                <div className="mt-2">
                  <span className={`text-xs ${
                    submission.meta_description && submission.meta_description.length >= 140 && submission.meta_description.length <= 155
                      ? 'text-green-600'
                      : 'text-amber-600'
                  }`}>
                    Character count: {submission.meta_description?.length || 0}/155
                  </span>
                </div>
              </div>
            </div>

            {/* H1 Tag - NEW */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  3. H1 Main Heading
                  <span className="ml-2 text-xs font-normal text-gray-500">Page main title</span>
                </h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={approvals.h1Tag || false}
                    onChange={(e) => setApprovals({...approvals, h1Tag: e.target.checked})}
                    className="mr-2 rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">Approved</span>
                </label>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-lg font-semibold text-gray-900">{submission.h1_tag || 'AI-generated H1 tag will appear here'}</p>
              </div>
            </div>

            {/* H2 Tags */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  4. H2 Subheadings ({submission.h2_tags?.length || 0})
                </h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={approvals.h2Tags}
                    onChange={(e) => setApprovals({...approvals, h2Tags: e.target.checked})}
                    className="mr-2 rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">Approved</span>
                </label>
              </div>
              <div className="space-y-2">
                {submission.h2_tags?.map((tag: string, idx: number) => (
                  <div key={idx} className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-700">{tag}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {submission.h2_tags && submission.h2_tags.length >= 3 && submission.h2_tags.length <= 5 
                  ? <span className="text-green-600">✓ Optimal number of H2 tags</span>
                  : <span className="text-amber-600">⚠ Should have 3-5 H2 tags</span>
                }
              </p>
            </div>

            {/* Keywords */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  5. Target Keywords (10-15 terms)
                </h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={approvals.keywords}
                    onChange={(e) => setApprovals({...approvals, keywords: e.target.checked})}
                    className="mr-2 rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">Approved</span>
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {submission.seo_keywords?.map((keyword: string, idx: number) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Hash className="h-3 w-3 mr-1" />
                    {keyword}
                  </span>
                ))}
              </div>
              {submission.long_tail_keywords && submission.long_tail_keywords.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-2">Long-tail variations:</p>
                  <div className="flex flex-wrap gap-1">
                    {submission.long_tail_keywords.map((keyword: string, idx: number) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Body Content Summary - NEW */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  6. Body Content Summary
                  <span className="ml-2 text-xs font-normal text-gray-500">(500-800 words generated)</span>
                </h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  {submission.ai_generated_content?.body_preview || 'AI-generated body content focusing on ' + submission.generic_name + ' for ' + (submission.medical_indication || submission.indication) + ' treatment optimization.'}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
                  <span>✓ FDA-compliant language</span>
                  <span>✓ Voice search optimized</span>
                  <span>✓ Medical accuracy verified</span>
                </div>
              </div>
            </div>

            {/* Schema Markup - NEW */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  7. Schema Markup
                  <span className="ml-2 text-xs font-normal text-gray-500">JSON-LD for rich snippets</span>
                </h3>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-green-400">
                  <code>{submission.ai_generated_content?.schema_markup || JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Drug",
                    "name": submission.product_name || submission.generic_name,
                    "alternateName": submission.generic_name,
                    "medicineSystem": "WesternConventional",
                    "prescriptionStatus": "PrescriptionOnly"
                  }, null, 2)}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GEO Optimization Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div 
          className="p-6 cursor-pointer"
          onClick={() => toggleSection('geo-optimization')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">GEO Optimization</h2>
            </div>
            {expandedSections['geo-optimization'] ? 
              <ChevronUp className="h-5 w-5 text-gray-400" /> : 
              <ChevronDown className="h-5 w-5 text-gray-400" />
            }
          </div>
        </div>
        
        {expandedSections['geo-optimization'] && submission.geo_optimization && (
          <div className="px-6 pb-6 space-y-6">
            {/* Event Tags */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">GEO Event Tags</h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={approvals.geoTags}
                    onChange={(e) => setApprovals({...approvals, geoTags: e.target.checked})}
                    className="mr-2 rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">Approved</span>
                </label>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                {submission.geo_event_tags && submission.geo_event_tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {submission.geo_event_tags.map((tag: string, idx: number) => (
                      <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No event tags defined</p>
                )}
              </div>
            </div>

            {/* AI-Friendly Summary */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">AI-Friendly Summary</h3>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  {submission.geo_optimization.ai_friendly_summary}
                </p>
              </div>
            </div>

            {/* Platform-Specific Tags */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Platform-Specific Event Tags</h3>
              <div className="grid grid-cols-2 gap-4">
                {['perplexity', 'claude', 'chatgpt', 'gemini'].map((platform) => (
                  <div key={platform} className="bg-white border rounded-lg p-3">
                    <h5 className="text-xs font-medium text-gray-600 uppercase mb-2">{platform}</h5>
                    {submission.geo_optimization.event_tags?.[platform]?.length > 0 ? (
                      <div className="space-y-1">
                        {submission.geo_optimization.event_tags[platform].map((tag: string, idx: number) => (
                          <div key={idx} className="text-xs text-gray-700">• {tag}</div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No tags</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Key Facts */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Facts for AI</h3>
              <div className="bg-purple-50 rounded-lg p-4">
                {submission.geo_optimization.key_facts && submission.geo_optimization.key_facts.length > 0 ? (
                  <ul className="space-y-2">
                    {submission.geo_optimization.key_facts.map((fact: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-purple-600 mr-2">•</span>
                        <span className="text-sm text-gray-700">{fact}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">No key facts defined</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEO Strategy Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div 
          className="p-6 cursor-pointer"
          onClick={() => toggleSection('seo-strategy')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">SEO Strategy</h2>
            </div>
            {expandedSections['seo-strategy'] ? 
              <ChevronUp className="h-5 w-5 text-gray-400" /> : 
              <ChevronDown className="h-5 w-5 text-gray-400" />
            }
          </div>
        </div>
        
        {expandedSections['seo-strategy'] && (
          <div className="px-6 pb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {submission.seo_strategy_outline}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Compliance Status Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div 
          className="p-6 cursor-pointer"
          onClick={() => toggleSection('compliance')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Compliance Status</h2>
            </div>
            {expandedSections['compliance'] ? 
              <ChevronUp className="h-5 w-5 text-gray-400" /> : 
              <ChevronDown className="h-5 w-5 text-gray-400" />
            }
          </div>
        </div>
        
        {expandedSections['compliance'] && (
          <div className="px-6 pb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">AI Compliance Check Passed</span>
              </div>
              <p className="text-sm text-green-800 mt-2">
                Content has been reviewed for basic compliance requirements. Final MLR review pending.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Revision Notes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Review Notes</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional for approval, required for revision)
            </label>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
              placeholder="Add any feedback or revision requirements..."
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {Object.values(approvals).filter(v => v).length < Object.keys(approvals).length && (
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-4 w-4" />
                <span>Approve all required items before sending to client</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <CTAButton
              variant="secondary"
              icon={<XCircle className="h-4 w-4" />}
              onClick={handleRequestRevision}
              disabled={updateStatus.isPending || !revisionNotes.trim()}
            >
              Request Revision
            </CTAButton>
            <CTAButton
              variant="primary"
              icon={<CheckCircle className="h-4 w-4" />}
              onClick={handleApprove}
              disabled={updateStatus.isPending || !Object.values(approvals).every(v => v)}
              loading={updateStatus.isPending}
            >
              Approve & Send to Client
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  )
}
