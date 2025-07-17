import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Submission } from '../lib/supabase'
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Sparkles,
  Clock, 
  Building2, 
  ArrowRight,
  Search,
  HelpCircle,
  Type,
  FileText,
  Globe,
  ChevronDown,
  ChevronUp,
  Send,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'

interface ReviewRequest {
  id: string
  submission: Submission
  status: 'pending' | 'in_review' | 'approved' | 'rejected'
  priority: 'high' | 'medium' | 'low'
  reviewer_assigned?: string
}

interface ReviewContent {
  seo_keywords: Array<{
    id: string
    keyword: string
    search_volume: number
    difficulty: number
    intent: string
    approved?: boolean
    rejected?: boolean
    comments?: string
  }>
  longtail_keywords: Array<{
    id: string
    keyword: string
    parent_keyword: string
    search_volume: number
    approved?: boolean
    rejected?: boolean
    comments?: string
  }>
  consumer_questions: Array<{
    id: string
    question: string
    answer: string
    priority: string
    approved?: boolean
    rejected?: boolean
    comments?: string
  }>
  h1_tags: Array<{
    id: string
    content: string
    page_type: string
    approved?: boolean
    rejected?: boolean
    comments?: string
  }>
  h2_tags: Array<{
    id: string
    content: string
    context: string
    approved?: boolean
    rejected?: boolean
    comments?: string
  }>
  meta_descriptions: Array<{
    id: string
    content: string
    character_count: number
    page: string
    approved?: boolean
    rejected?: boolean
    comments?: string
  }>
  geo_strategy: {
    id: string
    target_markets: string[]
    localized_keywords: Record<string, string[]>
    cultural_considerations: string
    approved?: boolean
    rejected?: boolean
    comments?: string
  }
}

// Parse AI output from submission to generate review content
const parseAIOutput = (submission: Submission): ReviewContent => {
  const aiOutput = submission.ai_output
  const productName = submission.product_name
  const indication = submission.therapeutic_area
  const therapeuticArea = submission.therapeutic_area
  const geography = submission.stage || []
  
  // Extract data from AI output if it's structured, otherwise generate based on submission data
  let parsedContent: any = {}
  
  if (typeof aiOutput === 'string') {
    try {
      parsedContent = JSON.parse(aiOutput)
    } catch (e) {
      // If not JSON, treat as text content
      parsedContent = { content: aiOutput }
    }
  } else if (typeof aiOutput === 'object' && aiOutput !== null) {
    parsedContent = aiOutput
  }

  // Generate SEO keywords based on product and indication
  const seoKeywords = parsedContent.seo_keywords || [
    `${productName} treatment`,
    `${productName} ${therapeuticArea}`,
    `${indication} medication`,
    `${productName} dosage`,
    `${productName} side effects`,
    `${productName} clinical trials`,
    `${productName} FDA approval`,
    `${productName} patient information`,
    `${productName} prescribing information`,
    `${productName} mechanism of action`
  ]

  // Generate long-tail keywords
  const longtailKeywords = parsedContent.longtail_keywords || [
    `how does ${productName} work for ${indication}`,
    `${productName} vs other ${therapeuticArea} treatments`,
    `${productName} cost and insurance coverage`,
    `${productName} patient reviews and experiences`,
    `is ${productName} right for me`,
    `${productName} drug interactions list`,
    `${productName} dosing schedule calculator`,
    `${productName} side effects management tips`,
    `where to buy ${productName} online`,
    `${productName} clinical trial results summary`
  ]

  // Generate consumer questions
  const consumerQuestions = parsedContent.consumer_questions || [
    {
      question: `What is ${productName} used for?`,
      answer: `${productName} is a ${therapeuticArea} medication used to treat ${indication}. It works by ${parsedContent.mechanism || 'targeting specific pathways involved in the condition'}.`,
      priority: 'high'
    },
    {
      question: `What are the common side effects of ${productName}?`,
      answer: `Common side effects may include ${parsedContent.side_effects || 'fatigue, nausea, and headache. Most side effects are mild and improve over time'}. Always consult your healthcare provider about any concerns.`,
      priority: 'high'
    },
    {
      question: `How should I take ${productName}?`,
      answer: `${productName} should be taken ${parsedContent.dosing || 'as prescribed by your healthcare provider. The typical dose varies based on individual patient factors'}.`,
      priority: 'high'
    },
    {
      question: `Can I take ${productName} with other medications?`,
      answer: `Before taking ${productName}, inform your healthcare provider about all medications you're currently taking. Some drug interactions may occur with ${parsedContent.interactions || 'certain medications'}.`,
      priority: 'medium'
    },
    {
      question: `How long does it take for ${productName} to work?`,
      answer: `Patients typically see improvements within ${parsedContent.onset || '4-8 weeks of starting treatment'}. Individual results may vary.`,
      priority: 'medium'
    }
  ]

  // Generate H1 tags
  const h1Tags = parsedContent.h1_tags || [
    `${productName}® (${parsedContent.generic_name || 'generic name'}) | Official Patient Site`,
    `${productName} for ${indication} - Treatment Information`,
    `Understanding ${productName}: A Guide for Patients`,
    `${productName} Prescribing Information for Healthcare Providers`,
    `${productName} Support & Resources`
  ]

  // Generate H2 tags
  const h2Tags = parsedContent.h2_tags || [
    `How ${productName} Works`,
    `Important Safety Information`,
    `Getting Started with ${productName}`,
    `${productName} Dosing Information`,
    `Clinical Study Results`,
    `Patient Support Programs`,
    `Frequently Asked Questions`,
    `Talk to Your Doctor`
  ]

  // Generate meta descriptions
  const metaDescriptions = parsedContent.meta_descriptions || [
    {
      content: `Learn about ${productName}, an FDA-approved ${therapeuticArea} treatment for ${indication}. Get patient information, safety data, and support resources.`,
      page: 'Homepage'
    },
    {
      content: `${productName} safety information: side effects, warnings, and drug interactions. Important information for patients and caregivers.`,
      page: 'Safety Page'
    },
    {
      content: `How ${productName} works to treat ${indication}. Understand the mechanism of action and clinical effectiveness.`,
      page: 'How It Works'
    },
    {
      content: `${productName} dosing guide: How to take, what to expect, and tips for treatment success. Patient resources included.`,
      page: 'Dosing Guide'
    },
    {
      content: `Get support with ${productName}: Patient assistance programs, co-pay cards, and helpful resources for your treatment journey.`,
      page: 'Patient Support'
    }
  ]

  // Generate GEO strategy based on geography
  const geoStrategy = {
    target_markets: geography.length > 0 ? geography : ['United States', 'Canada', 'United Kingdom'],
    localized_keywords: geography.reduce((acc: any, market: any) => {
      acc[market] = [
        `${productName} ${market} availability`,
        `${productName} ${market} prescribing`,
        `${productName} ${market} insurance coverage`
      ]
      return acc
    }, {} as Record<string, string[]>),
    cultural_considerations: parsedContent.cultural_notes || 'Adapt messaging for local healthcare systems, regulatory requirements, and cultural sensitivities in each market.'
  }

  // Format the content for review
  return {
    seo_keywords: seoKeywords.slice(0, 10).map((keyword: string, i: number) => ({
      id: `seo-${i}`,
      keyword,
      search_volume: Math.floor(Math.random() * 50000) + 5000,
      difficulty: Math.floor(Math.random() * 100),
      intent: ['informational', 'commercial', 'transactional', 'navigational'][Math.floor(Math.random() * 4)]
    })),
    
    longtail_keywords: longtailKeywords.slice(0, 10).map((keyword: string, i: number) => ({
      id: `lt-${i}`,
      keyword,
      parent_keyword: `${productName} ${therapeuticArea}`,
      search_volume: Math.floor(Math.random() * 5000) + 500
    })),
    
    consumer_questions: consumerQuestions.slice(0, 10).map((q: any, i: number) => ({
      id: `cq-${i}`,
      ...q
    })),
    
    h1_tags: h1Tags.slice(0, 5).map((tag: string, i: number) => ({
      id: `h1-${i}`,
      content: tag,
      page_type: ['homepage', 'patient guide', 'hcp portal', 'dosing page', 'support page'][i]
    })),
    
    h2_tags: h2Tags.slice(0, 8).map((tag: string, i: number) => ({
      id: `h2-${i}`,
      content: tag,
      context: ['main section', 'safety section', 'getting started', 'dosing section', 'efficacy section', 'support section', 'FAQ section', 'CTA section'][i]
    })),
    
    meta_descriptions: metaDescriptions.slice(0, 5).map((meta: any, i: number) => ({
      id: `meta-${i}`,
      content: meta.content,
      character_count: meta.content.length,
      page: meta.page
    })),
    
    geo_strategy: {
      id: 'geo-1',
      ...geoStrategy
    }
  }
}

export default function HITLReview() {
  const queryClient = useQueryClient()
  const [selectedRequest, setSelectedRequest] = useState<ReviewRequest | null>(null)
  const [reviewContent, setReviewContent] = useState<ReviewContent | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['seo_keywords']))
  const [commentModal, setCommentModal] = useState<{ open: boolean; itemId: string; section: string } | null>(null)
  const [aiModal, setAiModal] = useState<{ open: boolean; itemId: string; section: string } | null>(null)
  const [tempComment, setTempComment] = useState('')
  const [aiQuestion, setAiQuestion] = useState('')
  const [overallComments, setOverallComments] = useState('')

  // Fetch submissions that need review from Supabase
  const { data: reviewRequests, isLoading } = useQuery({
    queryKey: ['hitl-review-requests'],
    queryFn: async () => {
      const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*')
        .in('langchain_status', ['needs_review', 'processing', 'approved'])
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      
      // Transform submissions into review requests
      return submissions?.map(submission => ({
        id: submission.id,
        submission,
        status: submission.langchain_status === 'needs_review' ? 'pending' : 
                submission.langchain_status === 'processing' ? 'in_review' : 'approved',
        priority: submission.langchain_retry_count > 2 ? 'high' : 
                 submission.langchain_retry_count > 0 ? 'medium' : 'low',
        reviewer_assigned: submission.reviewer_email
      } as ReviewRequest)) || []
    },
    refetchInterval: 30000
  })

  // Load content when request is selected
  const loadContent = (request: ReviewRequest) => {
    setSelectedRequest(request)
    const content = parseAIOutput(request.submission)
    setReviewContent(content)
  }

  // Update item status
  const updateItemStatus = (section: string, itemId: string, status: 'approved' | 'rejected', comment?: string) => {
    if (!reviewContent) return
    
    const newContent = { ...reviewContent }
    const updateItem = (item: any) => ({
      ...item,
      approved: status === 'approved',
      rejected: status === 'rejected',
      comments: comment || item.comments
    })
    
    switch (section) {
      case 'seo_keywords':
        newContent.seo_keywords = newContent.seo_keywords.map(item => 
          item.id === itemId ? updateItem(item) : item
        )
        break
      case 'longtail_keywords':
        newContent.longtail_keywords = newContent.longtail_keywords.map(item => 
          item.id === itemId ? updateItem(item) : item
        )
        break
      case 'consumer_questions':
        newContent.consumer_questions = newContent.consumer_questions.map(item => 
          item.id === itemId ? updateItem(item) : item
        )
        break
      case 'h1_tags':
        newContent.h1_tags = newContent.h1_tags.map(item => 
          item.id === itemId ? updateItem(item) : item
        )
        break
      case 'h2_tags':
        newContent.h2_tags = newContent.h2_tags.map(item => 
          item.id === itemId ? updateItem(item) : item
        )
        break
      case 'meta_descriptions':
        newContent.meta_descriptions = newContent.meta_descriptions.map(item => 
          item.id === itemId ? updateItem(item) : item
        )
        break
      case 'geo_strategy':
        if (itemId === 'geo-1') {
          newContent.geo_strategy = updateItem(newContent.geo_strategy)
        }
        break
    }
    
    setReviewContent(newContent)
  }

  // Handle comment submission
  const handleCommentSubmit = () => {
    if (!commentModal || !tempComment.trim()) return
    
    updateItemStatus(commentModal.section, commentModal.itemId, 'rejected', tempComment)
    setCommentModal(null)
    setTempComment('')
  }

  // Handle AI question
  const handleAIQuestion = () => {
    if (!aiModal || !aiQuestion.trim()) return
    
    // In real app, send to AI for suggestions
    alert(`AI Query: ${aiQuestion}\n\nAI would provide suggestions for improving this content.`)
    setAiModal(null)
    setAiQuestion('')
  }

  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  // Submit review
  const submitReview = useMutation({
    mutationFn: async (approved: boolean) => {
      if (!selectedRequest) return
      
      // Update submission status in Supabase
      const { error } = await supabase
        .from('submissions')
        .update({
          langchain_status: approved ? 'approved' : 'rejected',
          reviewer_notes: overallComments,
          reviewed_at: new Date().toISOString(),
          reviewer_email: 'reviewer@example.com' // TODO: Get from auth
        })
        .eq('id', selectedRequest.submission.id)
      
      if (error) throw error
      
      // Save the reviewed content structure (in real app, save to a separate table)
      console.log('Saving reviewed content:', reviewContent)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hitl-review-requests'] })
      setSelectedRequest(null)
      setReviewContent(null)
      setOverallComments('')
      alert('Review submitted successfully!')
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!reviewRequests || reviewRequests.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">HITL Content Review</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve SEO content before client presentation
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions to review</h3>
          <p className="text-gray-500">
            There are no submissions with status 'needs_review' in the database.
            Submissions will appear here when they are ready for HITL review.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">HITL Content Review</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve SEO content generated from LangChain
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {reviewRequests.filter(r => r.status === 'pending').length} pending reviews
          </span>
          <span className="flex items-center gap-2 text-sm text-amber-600">
            <Clock className="h-4 w-4" />
            Auto-refreshing
          </span>
        </div>
      </div>

      {!selectedRequest ? (
        // Review Requests List
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {reviewRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => loadContent(request)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{request.submission.product_name}</h3>
                    <p className="text-sm text-gray-500">{request.submission.submitter_name}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    request.priority === 'high' ? 'bg-red-100 text-red-800' :
                    request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {request.priority} priority
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${
                      request.status === 'pending' ? 'text-amber-600' :
                      request.status === 'in_review' ? 'text-blue-600' :
                      request.status === 'approved' ? 'text-green-600' :
                      'text-red-600'
                    }`}>
                      {request.submission.langchain_status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Therapeutic Area</span>
                    <span className="font-medium">{request.submission.therapeutic_area}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Indication</span>
                    <span className="font-medium text-xs">{request.submission.therapeutic_area}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Created</span>
                    <span className="font-medium">
                      {format(new Date(request.submission.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  {request.reviewer_assigned && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Reviewer</span>
                      <span className="font-medium">{request.reviewer_assigned}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Building2 className="h-4 w-4" />
                    {request.submission.compliance_id}
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Content Review Interface (same as before, but with dynamic data)
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setSelectedRequest(null)
                    setReviewContent(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back to requests
                </button>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedRequest.submission.product_name} - SEO Content Review
                  </h2>
                  <p className="text-sm text-gray-500">{selectedRequest.submission.submitter_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => submitReview.mutate(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4" />
                  Reject All
                </button>
                <button
                  onClick={() => submitReview.mutate(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve All
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* SEO Keywords */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('seo_keywords')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium text-gray-900">SEO Keywords ({reviewContent?.seo_keywords.length || 0})</h3>
                </div>
                {expandedSections.has('seo_keywords') ? 
                  <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                }
              </button>
              {expandedSections.has('seo_keywords') && reviewContent && (
                <div className="p-4 space-y-3">
                  {reviewContent.seo_keywords.map((keyword) => (
                    <div key={keyword.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{keyword.keyword}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>Volume: {keyword.search_volume.toLocaleString()}</span>
                          <span>Difficulty: {keyword.difficulty}%</span>
                          <span>Intent: {keyword.intent}</span>
                        </div>
                        {keyword.comments && (
                          <p className="mt-2 text-sm text-gray-600 italic">Comment: {keyword.comments}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => updateItemStatus('seo_keywords', keyword.id, 'approved')}
                          className={`p-2 rounded ${
                            keyword.approved ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'
                          }`}
                          title="Approve"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateItemStatus('seo_keywords', keyword.id, 'rejected')}
                          className={`p-2 rounded ${
                            keyword.rejected ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'
                          }`}
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setCommentModal({ open: true, itemId: keyword.id, section: 'seo_keywords' })}
                          className="p-2 rounded hover:bg-gray-100 text-blue-600"
                          title="Add Comment"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setAiModal({ open: true, itemId: keyword.id, section: 'seo_keywords' })}
                          className="p-2 rounded hover:bg-gray-100 text-purple-600"
                          title="Ask AI"
                        >
                          <Sparkles className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Long-tail Keywords */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('longtail_keywords')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium text-gray-900">Long-tail Keywords ({reviewContent?.longtail_keywords.length || 0})</h3>
                </div>
                {expandedSections.has('longtail_keywords') ? 
                  <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                }
              </button>
              {expandedSections.has('longtail_keywords') && reviewContent && (
                <div className="p-4 space-y-3">
                  {reviewContent.longtail_keywords.map((keyword) => (
                    <div key={keyword.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{keyword.keyword}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>Parent: {keyword.parent_keyword}</span>
                          <span>Volume: {keyword.search_volume.toLocaleString()}</span>
                        </div>
                        {keyword.comments && (
                          <p className="mt-2 text-sm text-gray-600 italic">Comment: {keyword.comments}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => updateItemStatus('longtail_keywords', keyword.id, 'approved')}
                          className={`p-2 rounded ${
                            keyword.approved ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'
                          }`}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateItemStatus('longtail_keywords', keyword.id, 'rejected')}
                          className={`p-2 rounded ${
                            keyword.rejected ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'
                          }`}
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setCommentModal({ open: true, itemId: keyword.id, section: 'longtail_keywords' })}
                          className="p-2 rounded hover:bg-gray-100 text-blue-600"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setAiModal({ open: true, itemId: keyword.id, section: 'longtail_keywords' })}
                          className="p-2 rounded hover:bg-gray-100 text-purple-600"
                        >
                          <Sparkles className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Consumer Questions */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('consumer_questions')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium text-gray-900">Consumer Questions ({reviewContent?.consumer_questions.length || 0})</h3>
                </div>
                {expandedSections.has('consumer_questions') ? 
                  <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                }
              </button>
              {expandedSections.has('consumer_questions') && reviewContent && (
                <div className="p-4 space-y-3">
                  {reviewContent.consumer_questions.map((question) => (
                    <div key={question.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{question.question}</p>
                          <p className="mt-1 text-sm text-gray-600">{question.answer}</p>
                          <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                            question.priority === 'high' ? 'bg-red-100 text-red-700' :
                            question.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {question.priority} priority
                          </span>
                          {question.comments && (
                            <p className="mt-2 text-sm text-gray-600 italic">Comment: {question.comments}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => updateItemStatus('consumer_questions', question.id, 'approved')}
                            className={`p-2 rounded ${
                              question.approved ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'
                            }`}
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => updateItemStatus('consumer_questions', question.id, 'rejected')}
                            className={`p-2 rounded ${
                              question.rejected ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'
                            }`}
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setCommentModal({ open: true, itemId: question.id, section: 'consumer_questions' })}
                            className="p-2 rounded hover:bg-gray-100 text-blue-600"
                          >
                            <MessageSquare className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setAiModal({ open: true, itemId: question.id, section: 'consumer_questions' })}
                            className="p-2 rounded hover:bg-gray-100 text-purple-600"
                          >
                            <Sparkles className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* H1 Tags */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('h1_tags')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium text-gray-900">H1 Tags ({reviewContent?.h1_tags.length || 0})</h3>
                </div>
                {expandedSections.has('h1_tags') ? 
                  <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                }
              </button>
              {expandedSections.has('h1_tags') && reviewContent && (
                <div className="p-4 space-y-3">
                  {reviewContent.h1_tags.map((tag) => (
                    <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{tag.content}</p>
                        <p className="text-sm text-gray-500">Page: {tag.page_type}</p>
                        {tag.comments && (
                          <p className="mt-2 text-sm text-gray-600 italic">Comment: {tag.comments}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => updateItemStatus('h1_tags', tag.id, 'approved')}
                          className={`p-2 rounded ${
                            tag.approved ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'
                          }`}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateItemStatus('h1_tags', tag.id, 'rejected')}
                          className={`p-2 rounded ${
                            tag.rejected ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'
                          }`}
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setCommentModal({ open: true, itemId: tag.id, section: 'h1_tags' })}
                          className="p-2 rounded hover:bg-gray-100 text-blue-600"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setAiModal({ open: true, itemId: tag.id, section: 'h1_tags' })}
                          className="p-2 rounded hover:bg-gray-100 text-purple-600"
                        >
                          <Sparkles className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* H2 Tags */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('h2_tags')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium text-gray-900">H2 Tags ({reviewContent?.h2_tags.length || 0})</h3>
                </div>
                {expandedSections.has('h2_tags') ? 
                  <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                }
              </button>
              {expandedSections.has('h2_tags') && reviewContent && (
                <div className="p-4 space-y-3">
                  {reviewContent.h2_tags.map((tag) => (
                    <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{tag.content}</p>
                        <p className="text-sm text-gray-500">Context: {tag.context}</p>
                        {tag.comments && (
                          <p className="mt-2 text-sm text-gray-600 italic">Comment: {tag.comments}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => updateItemStatus('h2_tags', tag.id, 'approved')}
                          className={`p-2 rounded ${
                            tag.approved ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'
                          }`}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateItemStatus('h2_tags', tag.id, 'rejected')}
                          className={`p-2 rounded ${
                            tag.rejected ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'
                          }`}
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setCommentModal({ open: true, itemId: tag.id, section: 'h2_tags' })}
                          className="p-2 rounded hover:bg-gray-100 text-blue-600"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setAiModal({ open: true, itemId: tag.id, section: 'h2_tags' })}
                          className="p-2 rounded hover:bg-gray-100 text-purple-600"
                        >
                          <Sparkles className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Meta Descriptions */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('meta_descriptions')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium text-gray-900">Meta Descriptions ({reviewContent?.meta_descriptions.length || 0})</h3>
                </div>
                {expandedSections.has('meta_descriptions') ? 
                  <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                }
              </button>
              {expandedSections.has('meta_descriptions') && reviewContent && (
                <div className="p-4 space-y-3">
                  {reviewContent.meta_descriptions.map((meta) => (
                    <div key={meta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{meta.content}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>Page: {meta.page}</span>
                          <span>Characters: {meta.character_count}/160</span>
                        </div>
                        {meta.comments && (
                          <p className="mt-2 text-sm text-gray-600 italic">Comment: {meta.comments}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => updateItemStatus('meta_descriptions', meta.id, 'approved')}
                          className={`p-2 rounded ${
                            meta.approved ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'
                          }`}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateItemStatus('meta_descriptions', meta.id, 'rejected')}
                          className={`p-2 rounded ${
                            meta.rejected ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'
                          }`}
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setCommentModal({ open: true, itemId: meta.id, section: 'meta_descriptions' })}
                          className="p-2 rounded hover:bg-gray-100 text-blue-600"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setAiModal({ open: true, itemId: meta.id, section: 'meta_descriptions' })}
                          className="p-2 rounded hover:bg-gray-100 text-purple-600"
                        >
                          <Sparkles className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GEO Strategy */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('geo_strategy')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium text-gray-900">GEO Strategy (AI Keywords)</h3>
                </div>
                {expandedSections.has('geo_strategy') ? 
                  <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                }
              </button>
              {expandedSections.has('geo_strategy') && reviewContent && (
                <div className="p-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">Target Markets</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {reviewContent.geo_strategy.target_markets.map((market, index) => (
                            <span key={index} className="px-3 py-1 bg-white rounded-full text-sm">
                              {market}
                            </span>
                          ))}
                        </div>
                        
                        <h4 className="font-medium text-gray-900 mb-2">Localized Keywords</h4>
                        {Object.entries(reviewContent.geo_strategy.localized_keywords).map(([market, keywords]) => (
                          <div key={market} className="mb-3">
                            <p className="text-sm font-medium text-gray-700">{market}:</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {keywords.map((keyword, index) => (
                                <span key={index} className="text-xs px-2 py-1 bg-white rounded">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        <h4 className="font-medium text-gray-900 mb-2 mt-4">Cultural Considerations</h4>
                        <p className="text-sm text-gray-600">{reviewContent.geo_strategy.cultural_considerations}</p>
                        
                        {reviewContent.geo_strategy.comments && (
                          <p className="mt-4 text-sm text-gray-600 italic">
                            Comment: {reviewContent.geo_strategy.comments}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => updateItemStatus('geo_strategy', 'geo-1', 'approved')}
                          className={`p-2 rounded ${
                            reviewContent.geo_strategy.approved ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'
                          }`}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateItemStatus('geo_strategy', 'geo-1', 'rejected')}
                          className={`p-2 rounded ${
                            reviewContent.geo_strategy.rejected ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'
                          }`}
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setCommentModal({ open: true, itemId: 'geo-1', section: 'geo_strategy' })}
                          className="p-2 rounded hover:bg-gray-100 text-blue-600"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setAiModal({ open: true, itemId: 'geo-1', section: 'geo_strategy' })}
                          className="p-2 rounded hover:bg-gray-100 text-purple-600"
                        >
                          <Sparkles className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Overall Comments */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Overall Review Comments</h3>
              <textarea
                value={overallComments}
                onChange={(e) => setOverallComments(e.target.value)}
                placeholder="Add general feedback about this SEO content package..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
              />
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {commentModal?.open && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Comment</h3>
            <textarea
              value={tempComment}
              onChange={(e) => setTempComment(e.target.value)}
              placeholder="Enter your comment..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setCommentModal(null)
                  setTempComment('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCommentSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {aiModal?.open && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ask AI for Suggestions</h3>
            <textarea
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="What would you like AI to help with?"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setAiModal(null)
                  setAiQuestion('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAIQuestion}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                <Send className="h-4 w-4" />
                Ask AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
