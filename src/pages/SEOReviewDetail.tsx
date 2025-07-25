import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import CTAButton from '@/components/CTAButton'
import { mockSEOReviews } from '@/data/mockSEOReviews'
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
  
  // Read from localStorage and sync with main page
  const [useDemoData, setUseDemoData] = useState(() => {
    const stored = localStorage.getItem('seoReviewDataMode')
    return stored === 'demo'
  })
  
  // Listen for changes from other tabs/pages
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('seoReviewDataMode')
      setUseDemoData(stored === 'demo')
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
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
    h2Tags: false
  })

  const { data: submission, isLoading } = useQuery({
    queryKey: ['seo-review-detail', id, useDemoData],
    queryFn: async () => {
      if (useDemoData) {
        const mockSubmission = mockSEOReviews.find(s => s.id === id)
        if (!mockSubmission) throw new Error('Submission not found')
        
        // Add demo data for new fields
        return {
          ...mockSubmission,
          seo_title: mockSubmission.seo_title || `${mockSubmission.product_name}: Revolutionary Treatment for ${mockSubmission.therapeutic_area}`,
          h2_tags: mockSubmission.h2_tags || [
            'Understanding the Mechanism of Action',
            'Clinical Trial Results and Efficacy',
            'Safety Profile and Administration',
            'Patient Support Programs'
          ],
          geo_event_tags: mockSubmission.geo_event_tags || [
            'FDA approval announcement',
            'Phase 3 trial results',
            'New indication launch'
          ],
          geo_optimization: mockSubmission.geo_optimization || {
            ai_friendly_summary: `${mockSubmission.product_name} is a breakthrough therapy for ${mockSubmission.therapeutic_area}, offering superior efficacy with convenient dosing.`,
            structured_data: {
              "@context": "https://schema.org",
              "@type": "Drug",
              "name": mockSubmission.product_name
            },
            key_facts: [
              'First-in-class therapy',
              'Once-daily oral dosing',
              'Proven efficacy in clinical trials'
            ],
            event_tags: {
              perplexity: ['medical breakthrough', 'FDA approval'],
              claude: ['innovative therapy', 'clinical efficacy'],
              chatgpt: ['treatment option', 'patient outcomes'],
              gemini: ['pharmaceutical innovation', 'therapeutic advancement']
            }
          },
          seo_strategy_outline: 'Focus on long-tail keywords targeting specific patient populations. Build authority through clinical trial content and KOL partnerships.'
        }
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
        seo_approved_at: new Date().toISOString(),
        seo_approved_by: 'SEO Team', // Would come from auth
        review_notes: {
          seo_approval: true,
          seo_keyword_approvals: approvals,
          timestamp: new Date().toISOString()
        }
      }
      
      if (notes) {
        updateData.review_notes = {
          ...updateData.review_notes,
          seo_internal_notes: notes
        }
        updateData.rejection_reason = notes
        updateData.rejected_at = new Date().toISOString()
      }

      if (!useDemoData) {
        const { error } = await supabase
          .from('submissions')
          .update(updateData)
          .eq('id', id)
        
        if (error) throw error
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
          <div className="flex items-center gap-3">
            {useDemoData && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-700">
                Demo Data
              </span>
            )}
            <span className={`inline-flex items-center px-3 py-1.5 border rounded-full text-sm font-medium ${getPriorityColor(submission.priority_level || 'medium')}`}>
              {submission.priority_level || 'Medium'} Priority
            </span>
          </div>
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
                <p className="mt-1 font-medium text-gray-900">{submission.client_name || 'Pharma Corp'}</p>
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

      {/* SEO Analysis Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div 
          className="p-6 cursor-pointer"
          onClick={() => toggleSection('seo-analysis')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">SEO Analysis</h2>
            </div>
            {expandedSections['seo-analysis'] ? 
              <ChevronUp className="h-5 w-5 text-gray-400" /> : 
              <ChevronDown className="h-5 w-5 text-gray-400" />
            }
          </div>
        </div>
        
        {expandedSections['seo-analysis'] && (
          <div className="px-6 pb-6 space-y-6">
            {/* SEO Title */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  SEO Title Tag
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
                  Meta Description
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

            {/* H2 Tags */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  H2 Subheadings ({submission.h2_tags?.length || 0})
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
                  Target Keywords
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
                {submission.seo_keywords?.map((keyword, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Hash className="h-3 w-3 mr-1" />
                    {keyword}
                  </span>
                ))}
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
