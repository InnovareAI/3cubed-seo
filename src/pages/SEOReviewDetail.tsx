import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  MessageSquare,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Send,
  Check,
  X,
  AlertCircle
} from 'lucide-react'

interface ReviewableItem {
  id: string
  content: string
  approved: boolean
  sentToClient: boolean
  comment: string
}

export default function SEOReviewDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['seo_keywords', 'long_tail_keywords', 'consumer_questions', 'tags', 'geo'])
  )
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  
  // Track individual item approvals/comments
  const [itemStates, setItemStates] = useState<Record<string, ReviewableItem>>({})

  // Fetch content with all new fields
  const { data: content, isLoading } = useQuery({
    queryKey: ['seo-review-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_pieces')
        .select(`
          *,
          project:projects(
            *,
            client:clients(name)
          ),
          assigned_user:users!assigned_to(email, full_name)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    }
  })

  // Initialize item states when content loads
  React.useEffect(() => {
    if (content) {
      const initialStates: Record<string, ReviewableItem> = {}
      
      // Initialize states for all reviewable items
      const addItems = (items: string[] | null, prefix: string) => {
        if (items && Array.isArray(items)) {
          items.forEach((item, index) => {
            initialStates[`${prefix}_${index}`] = {
              id: `${prefix}_${index}`,
              content: item,
              approved: false,
              sentToClient: false,
              comment: ''
            }
          })
        }
      }
      
      addItems(content.seo_keywords, 'seo_keyword')
      addItems(content.long_tail_keywords, 'long_tail_keyword')
      addItems(content.consumer_questions, 'consumer_question')
      addItems(content.h2_tags, 'h2_tag')
      addItems(content.h3_tags, 'h3_tag')
      
      // Add single items
      if (content.h1_tag) {
        initialStates['h1_tag'] = {
          id: 'h1_tag',
          content: content.h1_tag,
          approved: false,
          sentToClient: false,
          comment: ''
        }
      }
      
      if (content.meta_title) {
        initialStates['meta_title'] = {
          id: 'meta_title',
          content: content.meta_title,
          approved: false,
          sentToClient: false,
          comment: ''
        }
      }
      
      if (content.meta_description) {
        initialStates['meta_description'] = {
          id: 'meta_description',
          content: content.meta_description,
          approved: false,
          sentToClient: false,
          comment: ''
        }
      }
      
      setItemStates(initialStates)
    }
  }, [content])

  const updateContentStatus = useMutation({
    mutationFn: async ({ status, reason }: { status: string; reason?: string }) => {
      const updateData: any = { 
        status,
        seo_reviewed_at: new Date().toISOString(),
        seo_reviewed_by: 'current-user-id' // TODO: Get from auth context
      }
      
      if (reason) {
        updateData.seo_internal_notes = reason
      }
      
      // Save individual approvals
      if (status === 'pending_client_review') {
        updateData.seo_keyword_approvals = itemStates
      }
      
      const { error } = await supabase
        .from('content_pieces')
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-review-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['seo-review-content'] })
      navigate('/seo-review')
    }
  })

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const toggleItemApproval = (itemId: string) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        approved: !prev[itemId].approved
      }
    }))
  }

  const toggleSentToClient = (itemId: string) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        sentToClient: !prev[itemId].sentToClient
      }
    }))
  }

  const updateComment = (itemId: string, comment: string) => {
    setItemStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        comment
      }
    }))
  }

  const approveAll = () => {
    setItemStates(prev => {
      const newStates = { ...prev }
      Object.keys(newStates).forEach(key => {
        newStates[key].approved = true
      })
      return newStates
    })
  }

  const handleApprove = () => {
    updateContentStatus.mutate({ status: 'pending_client_review' })
  }

  const handleReject = () => {
    if (rejectionReason.trim()) {
      updateContentStatus.mutate({ status: 'requires_revision', reason: rejectionReason })
    }
  }

  const handleRequestChanges = () => {
    updateContentStatus.mutate({ status: 'requires_revision' })
  }

  if (isLoading || !content) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const renderReviewableItem = (item: ReviewableItem) => (
    <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-900 flex-1 mr-4">{item.content}</p>
        <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 whitespace-nowrap">
          <Sparkles className="h-4 w-4" />
          Ask AI
        </button>
      </div>
      
      {/* Controls Row */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => toggleItemApproval(item.id)}
          className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
            item.approved 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {item.approved ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {item.approved ? 'Approved' : 'Approve'}
        </button>
        
        <button className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200">
          Revise
        </button>
        
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={item.sentToClient}
            onChange={() => toggleSentToClient(item.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Send to client
        </label>
      </div>
      
      {/* Comment Field */}
      <div className="relative">
        <input
          type="text"
          value={item.comment}
          onChange={(e) => updateComment(item.id, e.target.value)}
          placeholder="Add a comment..."
          className="w-full pr-10 pl-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Send className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/seo-review')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{content.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {content.project?.product_name} • {content.project?.therapeutic_area} • Priority: {content.priority_level || 'Medium'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2 inline" />
            Export
          </button>
          <button
            onClick={approveAll}
            className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
          >
            Approve All Items
          </button>
          <button
            onClick={handleApprove}
            disabled={updateContentStatus.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Complete Review
          </button>
        </div>
      </div>

      {/* SEO Keywords Section */}
      <div className="bg-white rounded-lg shadow">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('seo_keywords')}
        >
          <h2 className="text-lg font-medium text-gray-900">
            SEO Keywords ({content.seo_keywords?.length || 0})
          </h2>
          {expandedSections.has('seo_keywords') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('seo_keywords') && content.seo_keywords && (
          <div className="p-6 space-y-4">
            {content.seo_keywords.map((keyword: string, index: number) => 
              renderReviewableItem(itemStates[`seo_keyword_${index}`] || {
                id: `seo_keyword_${index}`,
                content: keyword,
                approved: false,
                sentToClient: false,
                comment: ''
              })
            )}
          </div>
        )}
      </div>

      {/* Long-tail Keywords Section */}
      <div className="bg-white rounded-lg shadow">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('long_tail_keywords')}
        >
          <h2 className="text-lg font-medium text-gray-900">
            Long-tail Keywords ({content.long_tail_keywords?.length || 0})
          </h2>
          {expandedSections.has('long_tail_keywords') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('long_tail_keywords') && content.long_tail_keywords && (
          <div className="p-6 space-y-4">
            {content.long_tail_keywords.map((keyword: string, index: number) => 
              renderReviewableItem(itemStates[`long_tail_keyword_${index}`] || {
                id: `long_tail_keyword_${index}`,
                content: keyword,
                approved: false,
                sentToClient: false,
                comment: ''
              })
            )}
          </div>
        )}
      </div>

      {/* Consumer Questions Section */}
      <div className="bg-white rounded-lg shadow">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('consumer_questions')}
        >
          <h2 className="text-lg font-medium text-gray-900">
            Consumer Questions ({content.consumer_questions?.length || 0})
          </h2>
          {expandedSections.has('consumer_questions') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('consumer_questions') && content.consumer_questions && (
          <div className="p-6 space-y-4">
            {content.consumer_questions.map((question: string, index: number) => 
              renderReviewableItem(itemStates[`consumer_question_${index}`] || {
                id: `consumer_question_${index}`,
                content: question,
                approved: false,
                sentToClient: false,
                comment: ''
              })
            )}
          </div>
        )}
      </div>

      {/* H1, H2, H3 Tags & Meta Information */}
      <div className="bg-white rounded-lg shadow">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('tags')}
        >
          <h2 className="text-lg font-medium text-gray-900">Tags & Meta Information</h2>
          {expandedSections.has('tags') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('tags') && (
          <div className="p-6 space-y-6">
            {/* H1 Tag */}
            {content.h1_tag && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">H1 Tag</h3>
                {renderReviewableItem(itemStates['h1_tag'] || {
                  id: 'h1_tag',
                  content: content.h1_tag,
                  approved: false,
                  sentToClient: false,
                  comment: ''
                })}
              </div>
            )}
            
            {/* H2 Tags */}
            {content.h2_tags && content.h2_tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">H2 Tags</h3>
                <div className="space-y-4">
                  {content.h2_tags.map((tag: string, index: number) => 
                    renderReviewableItem(itemStates[`h2_tag_${index}`] || {
                      id: `h2_tag_${index}`,
                      content: tag,
                      approved: false,
                      sentToClient: false,
                      comment: ''
                    })
                  )}
                </div>
              </div>
            )}
            
            {/* H3 Tags */}
            {content.h3_tags && content.h3_tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">H3 Tags</h3>
                <div className="space-y-4">
                  {content.h3_tags.map((tag: string, index: number) => 
                    renderReviewableItem(itemStates[`h3_tag_${index}`] || {
                      id: `h3_tag_${index}`,
                      content: tag,
                      approved: false,
                      sentToClient: false,
                      comment: ''
                    })
                  )}
                </div>
              </div>
            )}
            
            {/* Meta Title */}
            {content.meta_title && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Meta Title</h3>
                {renderReviewableItem(itemStates['meta_title'] || {
                  id: 'meta_title',
                  content: content.meta_title,
                  approved: false,
                  sentToClient: false,
                  comment: ''
                })}
              </div>
            )}
            
            {/* Meta Description */}
            {content.meta_description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Meta Description</h3>
                {renderReviewableItem(itemStates['meta_description'] || {
                  id: 'meta_description',
                  content: content.meta_description,
                  approved: false,
                  sentToClient: false,
                  comment: ''
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* GEO Optimization (AI Search) */}
      <div className="bg-white rounded-lg shadow">
        <div
          className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('geo')}
        >
          <h2 className="text-lg font-medium text-gray-900">GEO Optimization (AI Search)</h2>
          {expandedSections.has('geo') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
        {expandedSections.has('geo') && content.geo_optimization && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">AI-Friendly Summary</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {content.geo_optimization.ai_friendly_summary}
              </p>
            </div>
            
            {content.geo_optimization.structured_data && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Structured Data</h3>
                <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(content.geo_optimization.structured_data, null, 2)}
                </pre>
              </div>
            )}
            
            {content.geo_optimization.key_facts && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Key Facts for AI</h3>
                <ul className="space-y-1">
                  {content.geo_optimization.key_facts.map((fact: string, index: number) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex gap-3">
              <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                <Copy className="h-4 w-4 mr-2 inline" />
                Copy GEO Data
              </button>
              <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                <CheckCircle className="h-4 w-4 mr-2 inline" />
                Validate with AI
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Executive Summary */}
      {content.executive_summary && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Executive Summary</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-700">{content.executive_summary}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 py-6">
        <button
          onClick={() => setShowRejectModal(true)}
          className="px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          <XCircle className="h-4 w-4 mr-2 inline" />
          Reject All
        </button>
        <button
          onClick={handleRequestChanges}
          className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          <MessageSquare className="h-4 w-4 mr-2 inline" />
          Request Changes
        </button>
        <button
          onClick={handleApprove}
          disabled={updateContentStatus.isPending}
          className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          <CheckCircle className="h-4 w-4 mr-2 inline" />
          Approve & Send to Client
        </button>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Submission</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}