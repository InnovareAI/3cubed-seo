import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import CTAButton from '@/components/CTAButton'
import ComprehensiveApprovalForm from '@/components/ComprehensiveApprovalForm'
import FieldApprovalControl, { FieldApproval } from '@/components/FieldApprovalControl'
import IndividualKeywordApproval, { KeywordApprovalData } from '@/components/IndividualKeywordApproval'
import ComplianceStatusVisual from '@/components/ComplianceStatusVisual'
import { ApprovalFormSections } from '@/types/approval.types'
import { exportToCSV, exportToPDF } from '@/utils/exportUtils'
import GEOScoreBreakdownComponent from '@/components/GEOScoreBreakdown'
import { calculateGEOScore } from '@/utils/geoScoring'
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
  Shield,
  Download,
  FileDown
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
  
  const [showApprovalForm, setShowApprovalForm] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'compliance': true,
    'overview': true,
    'seo-analysis': !showApprovalForm,
    'geo-optimization': false,
    'seo-strategy': false
  })
  
  const [revisionNotes, setRevisionNotes] = useState('')
  const [fieldApprovals, setFieldApprovals] = useState<Record<string, FieldApproval>>({})
  const [keywordApprovals, setKeywordApprovals] = useState<Record<number, KeywordApprovalData>>({})
  const [h2Approvals, setH2Approvals] = useState<Record<number, FieldApproval>>({})
  
  // For backward compatibility
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
      stage: 'Market Launch',
      development_stage: 'Market Launch',
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
      stage: 'Market Launch',
      development_stage: 'Market Launch',
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
      stage: 'Phase III',
      development_stage: 'Phase III',
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
      
      try {
        const data = await api.getSubmission(id!)
        return data as Submission
      } catch (error) {
        console.error('Failed to fetch submission:', error)
        throw error
      }
    }
  })

  // TODO: Implement real-time updates with Railway WebSocket
  // For now, we'll rely on manual refresh or polling
  
  // Commented out Supabase real-time subscription
  /*
  useEffect(() => {
    if (!id || id.startsWith('demo-')) return // Skip for demo data

    // Removed Supabase real-time subscription
    // Will implement Railway WebSocket or polling later
  }, [id, queryClient])
  */

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

      try {
        await api.updateSubmission(id!, updateData)
      } catch (error) {
        console.error('Failed to update submission:', error)
        throw error
      }
      
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

  const handleApprove = (approvalData?: any) => {
    if (!showApprovalForm) {
      const allApproved = Object.values(approvals).every(v => v === true)
      if (!allApproved) {
        alert('Please approve all required items before sending to client review')
        return
      }
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

  const handleFieldApproval = (fieldId: string, approval: FieldApproval) => {
    setFieldApprovals(prev => ({
      ...prev,
      [fieldId]: approval
    }));
    
    // Update legacy approvals for compatibility
    const legacyMap: Record<string, keyof typeof approvals> = {
      'seo_title': 'seoTitle',
      'meta_description': 'metaDescription',
      'geo_tags': 'geoTags',
      'keywords': 'keywords',
      'h1_tag': 'h1Tag',
      'h2_tags': 'h2Tags'
    };
    
    if (legacyMap[fieldId]) {
      setApprovals(prev => ({
        ...prev,
        [legacyMap[fieldId]]: approval.status === 'approved'
      }));
    }
  };

  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV({
      submission,
      approvals: fieldApprovals,
      timestamp
    });
  };

  const handleExportPDF = async () => {
    const timestamp = new Date().toISOString().split('T')[0];
    await exportToPDF({
      submission,
      approvals: fieldApprovals,
      timestamp
    }, 'seo-review-content');
  };

  const approvedCount = Object.values(fieldApprovals).filter(v => v.status === 'approved').length
  const totalApprovals = Math.max(Object.keys(fieldApprovals).length, 6) // At least 6 fields

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="seo-review-content">
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
          <div className="flex items-center gap-3">
            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <FileDown className="h-4 w-4" />
                CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                PDF
              </button>
            </div>
            <span className={`inline-flex items-center px-3 py-1.5 border rounded-full text-sm font-medium ${getPriorityColor(submission.priority_level || 'medium')}`}>
              {submission.priority_level || 'Medium'} Priority
            </span>
          </div>
        </div>
      </div>

      {/* Compliance Status Section - MOVED TO TOP */}
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
            <ComplianceStatusVisual 
              submission={submission} 
              fieldApprovals={fieldApprovals}
            />
          </div>
        )}
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

      {/* SEO/GEO Strategy Section - MOVED TO TOP */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div 
          className="p-6 cursor-pointer"
          onClick={() => toggleSection('seo-strategy')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">SEO/GEO Strategy</h2>
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
            {/* Core Input Display - 4 Mandatory Product Questions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">AI Optimization Based On The 4 Mandatory Product Questions:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">1. Development Stage:</span>
                  <span className="ml-2 font-medium text-gray-900">{submission.development_stage || submission.stage || 'Phase III'}</span>
                </div>
                <div>
                  <span className="text-gray-600">2. Product Name:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {(submission.development_stage === 'Market Launch') 
                      ? (submission.product_name || 'Brand name required')
                      : (submission.generic_name || 'Generic name required')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">3. Indication:</span>
                  <span className="ml-2 font-medium text-gray-900">{submission.medical_indication || submission.indication || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">4. Therapeutic Area:</span>
                  <span className="ml-2 font-medium text-gray-900">{submission.therapeutic_area}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> {(submission.development_stage === 'Market Launch') 
                    ? 'Market Launch phase uses brand name for optimization'
                    : 'Phase III/Market Shaping uses generic name for optimization'}
                </p>
              </div>
            </div>

            {/* SEO Title */}
            <FieldApprovalControl
              fieldName="1. SEO Title Tag"
              fieldValue={submission.seo_title || ''}
              fieldId="seo_title"
              characterLimit={60}
              onApprovalChange={handleFieldApproval}
              initialApproval={fieldApprovals['seo_title']}
            />

            {/* Meta Description */}
            <FieldApprovalControl
              fieldName="2. Meta Description"
              fieldValue={submission.meta_description || ''}
              fieldId="meta_description"
              characterLimit={155}
              onApprovalChange={handleFieldApproval}
              initialApproval={fieldApprovals['meta_description']}
            />

            {/* H1 Tag */}
            <FieldApprovalControl
              fieldName="3. H1 Main Heading"
              fieldValue={submission.h1_tag || 'AI-generated H1 tag will appear here'}
              fieldId="h1_tag"
              onApprovalChange={handleFieldApproval}
              initialApproval={fieldApprovals['h1_tag']}
            />

            {/* H2 Tags - Individual Approval */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                4. H2 Subheadings ({submission.h2_tags?.length || 0})
              </h3>
              <div className="space-y-3">
                {submission.h2_tags?.map((tag: string, idx: number) => (
                  <FieldApprovalControl
                    key={`h2-${idx}`}
                    fieldName={`H2 #${idx + 1}`}
                    fieldValue={tag}
                    fieldId={`h2_tag_${idx}`}
                    onApprovalChange={(fieldId, approval) => {
                      setH2Approvals(prev => ({
                        ...prev,
                        [idx]: approval
                      }));
                    }}
                    initialApproval={h2Approvals[idx]}
                  />
                ))}
              </div>
            </div>

            {/* Keywords */}
            <FieldApprovalControl
              fieldName="5. Target Keywords (10-15 terms)"
              fieldValue={[
                ...(submission.seo_keywords || []),
                ...(submission.long_tail_keywords || [])
              ]}
              fieldId="keywords"
              onApprovalChange={handleFieldApproval}
              initialApproval={fieldApprovals['keywords']}
            />

            {/* Body Content Summary */}
            <FieldApprovalControl
              fieldName="6. Body Content Summary"
              fieldValue={submission.ai_generated_content?.body_preview || 'AI-generated body content focusing on ' + submission.generic_name + ' for ' + (submission.medical_indication || submission.indication) + ' treatment optimization.'}
              fieldId="body_content"
              characterLimit={800}
              onApprovalChange={handleFieldApproval}
              initialApproval={fieldApprovals['body_content']}
            />

            {/* Schema Markup */}
            <FieldApprovalControl
              fieldName="7. Schema Markup (JSON-LD)"
              fieldValue={submission.ai_generated_content?.schema_markup || JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Drug",
                "name": submission.product_name || submission.generic_name,
                "alternateName": submission.generic_name,
                "medicineSystem": "WesternConventional",
                "prescriptionStatus": "PrescriptionOnly"
              }, null, 2)}
              fieldId="schema_markup"
              onApprovalChange={handleFieldApproval}
              initialApproval={fieldApprovals['schema_markup']}
            />
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
            <FieldApprovalControl
              fieldName="GEO Event Tags"
              fieldValue={submission.geo_event_tags || []}
              fieldId="geo_tags"
              onApprovalChange={handleFieldApproval}
              initialApproval={fieldApprovals['geo_tags']}
            />

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

      {/* Toggle Strategy & Tactics Form Button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Strategy & Tactics Approval</h2>
            <p className="text-sm text-gray-600 mt-1">Review and approve SEO/GEO strategy and implementation tactics</p>
          </div>
          <CTAButton
            variant={showApprovalForm ? "secondary" : "primary"}
            onClick={() => setShowApprovalForm(!showApprovalForm)}
          >
            {showApprovalForm ? 'Hide Strategy Form' : 'Show Strategy Form'}
          </CTAButton>
        </div>
      </div>

      {/* Comprehensive Approval Form */}
      {showApprovalForm && (
        <div className="mb-6">
          <ComprehensiveApprovalForm 
            submission={submission}
            onSubmit={(approvals: ApprovalFormSections) => {
              console.log('Approvals submitted:', approvals)
              // Handle submission to Supabase
              handleApprove()
            }}
          />
        </div>
      )}

      {/* Original Action Buttons */}
      {!showApprovalForm && (
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
      )}
    </div>
  )
}
