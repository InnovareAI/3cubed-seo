import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { mockSEOReviews } from '../data/mockSEOReviews'
import CTAButton from '../components/CTAButton'
import { 
  ArrowLeft,
  Target,
  AlertCircle,
  CheckCircle,
  Search,
  Globe,
  Building,
  Users,
  ChevronDown,
  ChevronUp,
  Brain,
  Eye,
  FileText,
  TrendingUp,
  Lightbulb,
  MessageSquare,
  Link,
  Code
} from 'lucide-react'
import { format } from 'date-fns'

interface Submission {
  id: string
  compliance_id: string
  product_name: string
  therapeutic_area: string
  stage: string
  workflow_stage: string
  target_audience?: string[]
  created_at: string
  submitter_name: string
  submitter_email: string
  priority_level: string
  medical_indication?: string
  client_name?: string
  mechanism_of_action?: string
  key_differentiators?: string[]
  seo_keywords?: string[]
  long_tail_keywords?: string[]
  consumer_questions?: string[]
  h1_tag?: string
  meta_title?: string
  meta_description?: string
  geography?: string[]
  geo_event_tags?: string[]
  geo_optimization?: {
    ai_friendly_summary: string
    structured_data: any
    key_facts: string[]
    ai_citations?: string
  }
  seo_strategy?: {
    content_architecture: string[]
    technical_seo: string[]
    content_strategy: string[]
    link_building: string[]
    geo_optimization: string[]
  }
  ai_output?: any
}

export default function SEOReviewPageDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [useDummyData] = useState(true)
  
  // Add debug logging
  console.log('SEOReviewPageDetail - ID from params:', id)
  console.log('Mock SEO Reviews:', mockSEOReviews)
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'overview': true,
    'seo-analysis': true,
    'geo-optimization': true,
    'seo-strategy': false,
    'compliance': false
  })

  // Approval states
  const [approvals, setApprovals] = useState({
    titleApproved: false,
    metaDescriptionApproved: false,
    geoTagsApproved: false,
    keywordsApproved: {} as Record<string, boolean>
  })
  const [seoNotes, setSeoNotes] = useState('')

  const { data: submission, isLoading, error } = useQuery({
    queryKey: ['seo-review-detail', id],
    queryFn: async () => {
      console.log('Fetching submission for ID:', id)
      
      if (useDummyData) {
        const mockSubmission = mockSEOReviews.find(s => s.id === id)
        console.log('Found mock submission:', mockSubmission)
        if (!mockSubmission) {
          console.error('No mock submission found for ID:', id)
          throw new Error('Submission not found')
        }
        return mockSubmission
      }
      
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      return data as Submission
    }
  })

  // Update submission status
  const updateStatus = useMutation({
    mutationFn: async ({ 
      newStatus, 
      notes 
    }: { 
      newStatus: 'pending_client_review' | 'requires_revision'
      notes?: string 
    }) => {
      const { error: reviewError } = await supabase
        .from('seo_reviews')
        .insert({
          submission_id: id,
          reviewer_name: 'Current User', // TODO: Get from auth
          reviewer_email: 'user@example.com', // TODO: Get from auth
          status: newStatus === 'pending_client_review' ? 'approved' : 'revision_requested',
          keyword_approvals: approvals.keywordsApproved,
          internal_notes: notes,
          seo_title_approved: approvals.titleApproved,
          meta_description_approved: approvals.metaDescriptionApproved,
          content_approved: newStatus === 'pending_client_review'
        })

      if (reviewError && !useDummyData) throw reviewError

      const { data, error } = await supabase
        .from('submissions')
        .update({
          workflow_stage: newStatus === 'pending_client_review' ? 'client_review' : 'revision',
          seo_reviewed_at: new Date().toISOString(),
          seo_reviewed_by: 'Current User', // TODO: Get from auth
          seo_keyword_approvals: approvals.keywordsApproved,
          seo_internal_notes: notes
        })
        .eq('id', id)
        .select()
        .single()

      if (error && !useDummyData) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-review-content'] })
      queryClient.invalidateQueries({ queryKey: ['processing-queue'] })
      navigate('/seo-review')
    },
    onError: (error) => {
      alert('Failed to update status: ' + error.message)
    }
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleKeywordApproval = (keyword: string) => {
    setApprovals(prev => ({
      ...prev,
      keywordsApproved: {
        ...prev.keywordsApproved,
        [keyword]: !prev.keywordsApproved[keyword]
      }
    }))
  }

  const handleApprove = () => {
    updateStatus.mutate({
      newStatus: 'pending_client_review',
      notes: seoNotes
    })
  }

  const handleRequestRevision = () => {
    if (!seoNotes.trim()) {
      alert('Please provide revision notes')
      return
    }

    updateStatus.mutate({
      newStatus: 'requires_revision',
      notes: seoNotes
    })
  }

  // Error state
  if (error) {
    console.error('Query error:', error)
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Submission</h2>
          <p className="text-red-600">{error.message}</p>
          <button
            onClick={() => navigate('/seo-review')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Back to SEO Review
          </button>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // No submission found
  if (!submission) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Submission Not Found</h2>
          <p className="text-yellow-600">The requested submission could not be found.</p>
          <button
            onClick={() => navigate('/seo-review')}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Back to SEO Review
          </button>
        </div>
      </div>
    )
  }

  const allApproved = approvals.titleApproved && approvals.metaDescriptionApproved && approvals.geoTagsApproved

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/seo-review')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{submission.product_name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {submission.stage} • {submission.therapeutic_area} • {'compliance_id' in submission ? submission.compliance_id : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CTAButton variant="secondary" icon={<Eye className="h-4 w-4" />}>
                Preview Content
              </CTAButton>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('overview')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
              <p className="text-sm text-gray-500">Product and submission details</p>
            </div>
          </div>
          {expandedSections.overview ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        
        {expandedSections.overview && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Product</p>
                <p className="mt-1 text-sm text-gray-900">{submission.product_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Stage</p>
                <p className="mt-1 text-sm text-gray-900">{submission.stage}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Priority</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                  ${submission.priority_level === 'High' ? 'bg-red-100 text-red-800' : 
                    submission.priority_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {submission.priority_level}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Submitted</p>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(submission.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{submission.client_name || 'Pharma Corp'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {Array.isArray(submission.target_audience) 
                    ? submission.target_audience.join(', ') 
                    : 'Healthcare Professionals'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {submission.geography?.join(', ') || 'Global'}
                </span>
              </div>
            </div>

            {submission.medical_indication && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-medium">Medical Indication:</span> {submission.medical_indication}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEO Analysis Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('seo-analysis')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Search className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">SEO Analysis</h2>
              <p className="text-sm text-gray-500">Keywords, meta tags, and search optimization</p>
            </div>
          </div>
          {expandedSections['seo-analysis'] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        
        {expandedSections['seo-analysis'] && (
          <div className="p-6 space-y-6">
            {/* SEO Title Tag */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                SEO Title Tag
                <span className="ml-2 text-xs font-normal text-gray-400">
                  (50-60 characters)
                </span>
              </h3>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-base font-medium text-gray-900">
                  {submission.meta_title || 'No title tag set'}
                </p>
                <div className="mt-1 flex items-center justify-between">
                <span className={`text-xs ${
                submission?.meta_title && submission.meta_title.length >= 50 && submission.meta_title.length <= 60
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    Character count: {submission.meta_title?.length || 0}/60
                  </span>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={approvals.titleApproved}
                      onChange={(e) => setApprovals(prev => ({ ...prev, titleApproved: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Approved</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Meta Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Meta Description
                <span className="ml-2 text-xs font-normal text-gray-400">
                  (140-155 characters)
                </span>
              </h3>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  {submission.meta_description || 'No meta description set'}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs ${
                    submission.meta_description && submission.meta_description.length >= 140 && submission.meta_description.length <= 155
                      ? 'text-green-600'
                      : 'text-amber-600'
                  }`}>
                    Character count: {submission.meta_description?.length || 0}/155
                  </span>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={approvals.metaDescriptionApproved}
                      onChange={(e) => setApprovals(prev => ({ ...prev, metaDescriptionApproved: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">Approved</span>
                  </label>
                </div>
              </div>
            </div>

            {/* H1 Tag */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">H1 Tag</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900">{submission.h1_tag || 'No H1 tag set'}</p>
              </div>
            </div>

            {/* Keywords */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Target Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {submission.seo_keywords?.map((keyword: string, idx: number) => (
                  <div key={idx} className="flex items-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Target className="h-3 w-3 mr-1" />
                      {keyword}
                    </span>
                    <input
                      type="checkbox"
                      checked={approvals.keywordsApproved[keyword] || false}
                      onChange={() => handleKeywordApproval(keyword)}
                      className="ml-2"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Long-tail Keywords */}
            {submission.long_tail_keywords && submission.long_tail_keywords.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Long-tail Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {submission.long_tail_keywords.map((keyword: string, idx: number) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Consumer Questions */}
            {submission.consumer_questions && submission.consumer_questions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Consumer Questions Addressed</h3>
                <ul className="space-y-2">
                  {submission.consumer_questions.map((question: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span className="text-sm text-gray-700">{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* GEO Optimization Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('geo-optimization')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">GEO Optimization</h2>
              <p className="text-sm text-gray-500">AI and generative engine optimization</p>
            </div>
          </div>
          {expandedSections['geo-optimization'] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        
        {expandedSections['geo-optimization'] && (
          <div className="p-6 space-y-6">
            {/* Event Tags */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">GEO Event Tags</h3>
              <div className="bg-gray-50 rounded-lg p-4">
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
                <label className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    checked={approvals.geoTagsApproved}
                    onChange={(e) => setApprovals(prev => ({ ...prev, geoTagsApproved: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Event tags approved</span>
                </label>
              </div>
            </div>

            {/* AI-Friendly Summary */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">AI-Friendly Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  {submission.geo_optimization?.ai_friendly_summary || 'No AI summary generated'}
                </p>
              </div>
            </div>

            {/* Structured Data */}
            {submission.geo_optimization?.structured_data && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Structured Data</h3>
                <div className="bg-white border rounded-lg p-4">
                  <dl className="space-y-2">
                    {Object.entries(submission.geo_optimization.structured_data).map(([key, value]) => (
                      <div key={key} className="flex">
                        <dt className="text-sm font-medium text-gray-600 w-1/3">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                        </dt>
                        <dd className="text-sm text-gray-900 w-2/3">{String(value) || 'Not specified'}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            {/* Key Facts */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Key Facts for AI</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {submission.geo_optimization?.key_facts && submission.geo_optimization.key_facts.length > 0 ? (
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
      {submission.seo_strategy && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div
            className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSection('seo-strategy')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">SEO Strategy</h2>
                <p className="text-sm text-gray-500">Comprehensive content and optimization strategy</p>
              </div>
            </div>
            {expandedSections['seo-strategy'] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
          
          {expandedSections['seo-strategy'] && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Content Architecture */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Content Architecture</h3>
                  </div>
                  <ul className="space-y-2">
                    {submission.seo_strategy.content_architecture.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-amber-500 mr-2 mt-0.5">•</span>
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Technical SEO */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Technical SEO</h3>
                  </div>
                  <ul className="space-y-2">
                    {submission.seo_strategy.technical_seo.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-amber-500 mr-2 mt-0.5">•</span>
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Content Strategy */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Content Strategy</h3>
                  </div>
                  <ul className="space-y-2">
                    {submission.seo_strategy.content_strategy.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-amber-500 mr-2 mt-0.5">•</span>
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Link Building */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Link className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Link Building</h3>
                  </div>
                  <ul className="space-y-2">
                    {submission.seo_strategy.link_building.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-amber-500 mr-2 mt-0.5">•</span>
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compliance Check Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('compliance')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Compliance Status</h2>
              <p className="text-sm text-gray-500">AI-generated compliance checks</p>
            </div>
          </div>
          {expandedSections.compliance ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        
        {expandedSections.compliance && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              {('ai_output' in submission && submission.ai_output?.compliance_status === 'compliant') ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-600">Compliant</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-600 capitalize">
                    {('ai_output' in submission && submission.ai_output?.compliance_status) || 'Pending Review'}
                  </span>
                </>
              )}
            </div>

            {('ai_output' in submission && submission.ai_output?.compliance_flags && submission.ai_output.compliance_flags.length > 0) && (
              <div className="space-y-2">
                {submission.ai_output.compliance_flags.map((flag: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 bg-yellow-50 rounded-lg p-3">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-gray-700">{flag}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Notes Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">SEO Review Notes</h3>
        <textarea
          value={seoNotes}
          onChange={(e) => setSeoNotes(e.target.value)}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          placeholder="Add any notes, feedback, or requirements..."
        />
      </div>

      {/* Approval Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Approval Checklist</h3>
        <div className="space-y-2">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={approvals.titleApproved}
              onChange={(e) => setApprovals(prev => ({ ...prev, titleApproved: e.target.checked }))}
              className="mr-2"
            />
            <span className={approvals.titleApproved ? 'text-green-600' : ''}>SEO Title Tag approved</span>
          </label>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={approvals.metaDescriptionApproved}
              onChange={(e) => setApprovals(prev => ({ ...prev, metaDescriptionApproved: e.target.checked }))}
              className="mr-2"
            />
            <span className={approvals.metaDescriptionApproved ? 'text-green-600' : ''}>Meta Description approved</span>
          </label>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={approvals.geoTagsApproved}
              onChange={(e) => setApprovals(prev => ({ ...prev, geoTagsApproved: e.target.checked }))}
              className="mr-2"
            />
            <span className={approvals.geoTagsApproved ? 'text-green-600' : ''}>GEO Event Tags approved</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center bg-gray-50 rounded-lg p-6">
        <CTAButton
          variant="secondary"
          icon={<MessageSquare className="h-4 w-4" />}
          onClick={handleRequestRevision}
          disabled={updateStatus.isPending}
        >
          Request Revision
        </CTAButton>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {allApproved ? (
              <span className="text-green-600 font-medium">All items approved ✓</span>
            ) : (
              'Please approve all required items before proceeding'
            )}
          </span>
          <CTAButton
            variant="success"
            icon={<CheckCircle className="h-4 w-4" />}
            onClick={handleApprove}
            disabled={updateStatus.isPending || !allApproved}
            loading={updateStatus.isPending}
          >
            Approve & Send to Client
          </CTAButton>
        </div>
      </div>
    </div>
  )
}
