import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/database-types'
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Save,
  Send,
  Hash,
  Search,
  HelpCircle,
  FileText,
  Type,
  Sparkles,
  UserCheck,
  Building2,
  ArrowRight
} from 'lucide-react'

interface SEOContentItem {
  id: string
  type: 'seo_keyword' | 'longtail_keyword' | 'consumer_question' | 'h1_tag' | 'h2_tag' | 'meta_description'
  content: string
  details?: {
    search_volume?: number
    difficulty?: number
    intent?: string
    answer?: string
    character_count?: number
    parent_keyword?: string
  }
  internal_approved: boolean
  client_approved: boolean
  comments: string
  selected_for_content: boolean
}

export default function ClientDashboard() {
  const { clientName } = useParams<{ clientName: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const decodedClientName = decodeURIComponent(clientName || '')
  
  // State for content items
  const [contentItems, setContentItems] = useState<SEOContentItem[]>([])
  const [reviewComments, setReviewComments] = useState('')
  const [aiRequest, setAiRequest] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [approvalMode, setApprovalMode] = useState<'internal' | 'client'>('internal')

  // Check if user is client based on email domain
  // const isClientUser = false // TODO: Get from auth context

  // Fetch client submissions and generate SEO content
  const { data: clientData, isLoading } = useQuery({
    queryKey: ['client-seo-content', decodedClientName],
    queryFn: async () => {
      // Get client submissions
      const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('your_name', decodedClientName)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // For demo, generate mock SEO content
      const mockContent: SEOContentItem[] = [
        // SEO Keywords (10)
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `seo-${i}`,
          type: 'seo_keyword' as const,
          content: `${submissions?.[0]?.product_identifier || 'Product'} ${submissions?.[0]?.therapeutic_area || 'treatment'} ${i + 1}`,
          details: {
            search_volume: Math.floor(Math.random() * 10000) + 1000,
            difficulty: Math.floor(Math.random() * 100),
            intent: ['informational', 'commercial', 'transactional'][Math.floor(Math.random() * 3)]
          },
          internal_approved: i % 3 !== 0, // Some pre-approved
          client_approved: false,
          comments: '',
          selected_for_content: false
        })),
        
        // Long-tail Keywords (10)
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `longtail-${i}`,
          type: 'longtail_keyword' as const,
          content: `best ${submissions?.[0]?.product_identifier || 'medication'} for ${submissions?.[0]?.medical_indication || 'condition'} treatment ${i + 1}`,
          details: {
            search_volume: Math.floor(Math.random() * 1000) + 100,
            parent_keyword: `${submissions?.[0]?.product_identifier || 'Product'} treatment`
          },
          internal_approved: i % 2 === 0,
          client_approved: false,
          comments: '',
          selected_for_content: false
        })),
        
        // Consumer Questions (5)
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `question-${i}`,
          type: 'consumer_question' as const,
          content: `How does ${submissions?.[0]?.product_identifier || 'this medication'} work for ${submissions?.[0]?.medical_indication || 'patients'}?`,
          details: {
            answer: `${submissions?.[0]?.product_identifier} is a ${submissions?.[0]?.therapeutic_area} treatment that works by targeting specific pathways...`
          },
          internal_approved: true,
          client_approved: false,
          comments: '',
          selected_for_content: false
        })),
        
        // H1 Tags (3)
        ...Array.from({ length: 3 }, (_, i) => ({
          id: `h1-${i}`,
          type: 'h1_tag' as const,
          content: `${submissions?.[0]?.product_identifier}: Advanced ${submissions?.[0]?.therapeutic_area} Treatment`,
          internal_approved: true,
          client_approved: false,
          comments: '',
          selected_for_content: false
        })),
        
        // H2 Tags (5)
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `h2-${i}`,
          type: 'h2_tag' as const,
          content: `Understanding ${submissions?.[0]?.product_identifier} for ${submissions?.[0]?.medical_indication}`,
          internal_approved: i % 2 === 0,
          client_approved: false,
          comments: '',
          selected_for_content: false
        })),
        
        // Meta Descriptions (3)
        ...Array.from({ length: 3 }, (_, i) => ({
          id: `meta-${i}`,
          type: 'meta_description' as const,
          content: `Learn about ${submissions?.[0]?.product_identifier}, an innovative ${submissions?.[0]?.therapeutic_area} treatment for ${submissions?.[0]?.medical_indication}. Discover benefits, usage, and clinical data.`,
          details: {
            character_count: 155
          },
          internal_approved: true,
          client_approved: false,
          comments: '',
          selected_for_content: false
        }))
      ]
      
      return {
        submissions,
        seoContent: mockContent,
        summary: submissions?.[0]?.ai_output || 'AI-generated summary of the product and its SEO strategy...'
      }
    }
  })

  useEffect(() => {
    if (clientData?.seoContent) {
      setContentItems(clientData.seoContent)
    }
  }, [clientData])

  // Update individual item
  const updateItem = (id: string, updates: Partial<SEOContentItem>) => {
    setContentItems(items => 
      items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    )
  }

  // Bulk approve selected items
  const approveSelected = () => {
    setContentItems(items =>
      items.map(item =>
        selectedItems.has(item.id) 
          ? { 
              ...item, 
              [approvalMode === 'internal' ? 'internal_approved' : 'client_approved']: true 
            } 
          : item
      )
    )
    setSelectedItems(new Set())
  }

  // Save all changes
  const saveMutation = useMutation({
    mutationFn: async () => {
      // In real app, save to database
      console.log('Saving SEO content:', contentItems)
      console.log('Review comments:', reviewComments)
      console.log('AI request:', aiRequest)
      
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-seo-content'] })
      alert('Changes saved successfully!')
    }
  })

  const proceedToContentGeneration = () => {
    // Get selected keywords
    const selectedKeywords = contentItems
      .filter(item => item.selected_for_content)
      .map(item => item.content)
    
    if (selectedKeywords.length === 0) {
      alert('Please select at least one keyword for content generation')
      return
    }
    
    // Navigate to content generation with selected keywords
    navigate(`/content-generation/${encodeURIComponent(decodedClientName)}`, {
      state: { selectedKeywords, contentItems }
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'seo_keyword':
      case 'longtail_keyword':
        return <Search className="h-4 w-4" />
      case 'consumer_question':
        return <HelpCircle className="h-4 w-4" />
      case 'h1_tag':
      case 'h2_tag':
        return <Type className="h-4 w-4" />
      case 'meta_description':
        return <FileText className="h-4 w-4" />
      default:
        return <Hash className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'seo_keyword': return 'SEO Keyword'
      case 'longtail_keyword': return 'Long-tail Keyword'
      case 'consumer_question': return 'Consumer Question'
      case 'h1_tag': return 'H1 Tag'
      case 'h2_tag': return 'H2 Tag'
      case 'meta_description': return 'Meta Description'
      default: return type
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const groupedContent = contentItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = []
    acc[item.type].push(item)
    return acc
  }, {} as Record<string, SEOContentItem[]>)

  // Check if all internal approvals are done
  const allInternalApproved = contentItems.every(item => item.internal_approved)
  
  // Count approvals
  const approvalStats = {
    internal: contentItems.filter(item => item.internal_approved).length,
    client: contentItems.filter(item => item.client_approved).length,
    total: contentItems.length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{decodedClientName}</h1>
            <p className="text-sm text-gray-500">
              SEO Content Review • {clientData?.submissions?.[0]?.product_identifier}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Approval Mode Toggle */}
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setApprovalMode('internal')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                approvalMode === 'internal' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCheck className="h-4 w-4 inline mr-1" />
              Internal
            </button>
            <button
              onClick={() => setApprovalMode('client')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                approvalMode === 'client' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              } ${!allInternalApproved ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!allInternalApproved}
            >
              <Building2 className="h-4 w-4 inline mr-1" />
              Client
            </button>
          </div>
          
          <button
            onClick={() => approveSelected()}
            disabled={selectedItems.size === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="h-4 w-4" />
            Approve Selected ({selectedItems.size})
          </button>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save All Changes
          </button>
        </div>
      </div>

      {/* Approval Progress */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Internal Approval</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(approvalStats.internal / approvalStats.total) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {approvalStats.internal}/{approvalStats.total}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Client Approval</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(approvalStats.client / approvalStats.total) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {approvalStats.client}/{approvalStats.total}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={proceedToContentGeneration}
              disabled={approvalStats.client === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Content
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-600" />
            AI Summary
          </h2>
        </div>
        <div className="p-6">
          <div className="prose max-w-none text-sm text-gray-700">
            {clientData?.summary}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {Object.entries(groupedContent).map(([type, items]) => (
          <div key={type} className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                {getTypeIcon(type)}
                {getTypeLabel(type)} ({items.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedItems)
                          if (e.target.checked) {
                            newSelected.add(item.id)
                          } else {
                            newSelected.delete(item.id)
                          }
                          setSelectedItems(newSelected)
                        }}
                        className="mt-1"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={item.content}
                              onChange={(e) => updateItem(item.id, { content: e.target.value })}
                              className="w-full text-sm font-medium text-gray-900 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none"
                              disabled={approvalMode === 'client' && !item.internal_approved}
                            />
                            
                            {/* Details */}
                            {item.details && (
                              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                {item.details.search_volume && (
                                  <span>Volume: {item.details.search_volume.toLocaleString()}</span>
                                )}
                                {item.details.difficulty && (
                                  <span>Difficulty: {item.details.difficulty}%</span>
                                )}
                                {item.details.intent && (
                                  <span>Intent: {item.details.intent}</span>
                                )}
                                {item.details.character_count && (
                                  <span>Characters: {item.details.character_count}</span>
                                )}
                              </div>
                            )}
                            
                            {/* Answer for questions */}
                            {item.type === 'consumer_question' && item.details?.answer && (
                              <textarea
                                value={item.details.answer}
                                onChange={(e) => updateItem(item.id, { 
                                  details: { ...item.details, answer: e.target.value }
                                })}
                                className="mt-2 w-full text-sm text-gray-600 bg-gray-50 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                rows={2}
                                disabled={approvalMode === 'client' && !item.internal_approved}
                              />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 ml-4">
                            {/* Approval Status */}
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded ${
                                item.internal_approved 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-gray-100 text-gray-400'
                              }`} title="Internal Approval">
                                <UserCheck className="h-4 w-4" />
                              </div>
                              <div className={`p-1.5 rounded ${
                                item.client_approved 
                                  ? 'bg-blue-100 text-blue-600' 
                                  : 'bg-gray-100 text-gray-400'
                              }`} title="Client Approval">
                                <Building2 className="h-4 w-4" />
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateItem(item.id, { 
                                  [approvalMode === 'internal' ? 'internal_approved' : 'client_approved']: true 
                                })}
                                disabled={approvalMode === 'client' && !item.internal_approved}
                                className={`p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </button>
                              <button
                                onClick={() => updateItem(item.id, { 
                                  [approvalMode === 'internal' ? 'internal_approved' : 'client_approved']: false 
                                })}
                                disabled={approvalMode === 'client' && !item.internal_approved}
                                className={`p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </button>
                            </div>
                            
                            {/* Select for Content */}
                            {item.client_approved && (
                              <input
                                type="checkbox"
                                checked={item.selected_for_content}
                                onChange={(e) => updateItem(item.id, { selected_for_content: e.target.checked })}
                                className="ml-2"
                                title="Select for content generation"
                              />
                            )}
                          </div>
                        </div>
                        
                        {/* Comments field */}
                        <div className="mt-2">
                          <input
                            type="text"
                            value={item.comments}
                            onChange={(e) => updateItem(item.id, { comments: e.target.value })}
                            placeholder="Add comments..."
                            className="w-full text-sm text-gray-600 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Review Comments
            </label>
            <textarea
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              placeholder="Add general feedback about this SEO content..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ask AI for Improvements
            </label>
            <div className="flex gap-2">
              <textarea
                value={aiRequest}
                onChange={(e) => setAiRequest(e.target.value)}
                placeholder="Request specific improvements or alternatives from AI..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
              />
              <button
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                <Send className="h-4 w-4" />
                Ask AI
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              {approvalMode === 'internal' 
                ? 'Reviewing as internal team member' 
                : 'Reviewing as client representative'}
            </div>
            <div className="flex items-center gap-3">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                <XCircle className="h-4 w-4" />
                Reject All
              </button>
              <button
                onClick={() => {
                  const approvalField = approvalMode === 'internal' ? 'internal_approved' : 'client_approved'
                  setContentItems(items => items.map(item => ({ ...item, [approvalField]: true })))
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                Approve All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
