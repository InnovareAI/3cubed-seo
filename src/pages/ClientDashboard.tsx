import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  Hash,
  Search,
  HelpCircle,
  FileText,
  Type,
  Sparkles,
  UserCheck,
  Building2,
  Clock,
  AlertCircle
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
  
  const decodedClientName = decodeURIComponent(clientName || '')
  
  // State for content items
  const [contentItems, setContentItems] = useState<SEOContentItem[]>([])

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

  // Count approvals
  const approvalStats = {
    internal: contentItems.filter(item => item.internal_approved).length,
    client: contentItems.filter(item => item.client_approved).length,
    total: contentItems.length
  }

  // Get approval stage status
  const getApprovalStageStatus = () => {
    const allInternalApproved = contentItems.every(item => item.internal_approved)
    const allClientApproved = contentItems.every(item => item.client_approved)
    
    if (allClientApproved) {
      return { stage: 'Completed', icon: <CheckCircle className="h-5 w-5 text-green-600" />, color: 'text-green-600' }
    } else if (allInternalApproved) {
      return { stage: 'Client Review', icon: <Building2 className="h-5 w-5 text-blue-600" />, color: 'text-blue-600' }
    } else {
      return { stage: 'Internal Review', icon: <UserCheck className="h-5 w-5 text-yellow-600" />, color: 'text-yellow-600' }
    }
  }

  const stageStatus = getApprovalStageStatus()

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
              SEO Content Approval Summary • {clientData?.submissions?.[0]?.product_identifier}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {stageStatus.icon}
          <span className={`text-lg font-medium ${stageStatus.color}`}>
            {stageStatus.stage}
          </span>
        </div>
      </div>

      {/* Approval Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Approval Progress</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Internal Approval</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${(approvalStats.internal / approvalStats.total) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium min-w-[50px] text-right">
                {approvalStats.internal}/{approvalStats.total}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {approvalStats.internal === approvalStats.total 
                ? 'All items approved internally' 
                : `${approvalStats.total - approvalStats.internal} items pending approval`}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Client Approval</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${(approvalStats.client / approvalStats.total) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium min-w-[50px] text-right">
                {approvalStats.client}/{approvalStats.total}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {approvalStats.client === approvalStats.total 
                ? 'All items approved by client' 
                : approvalStats.internal < approvalStats.total
                  ? 'Awaiting internal approval completion'
                  : `${approvalStats.total - approvalStats.client} items pending client approval`}
            </p>
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

      {/* Content Sections - Read Only */}
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
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.content}
                        </p>
                        
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
                          <p className="mt-2 text-sm text-gray-600 bg-white rounded p-2">
                            {item.details.answer}
                          </p>
                        )}
                        
                        {/* Comments */}
                        {item.comments && (
                          <p className="mt-2 text-sm text-gray-600 italic">
                            Note: {item.comments}
                          </p>
                        )}
                      </div>
                      
                      {/* Approval Status Icons */}
                      <div className="flex items-center gap-2 ml-4">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Approval Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Approval Timeline</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${
              approvalStats.internal > 0 ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <UserCheck className={`h-5 w-5 ${
                approvalStats.internal > 0 ? 'text-green-600' : 'text-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Internal Review</p>
              <p className="text-sm text-gray-500">
                {approvalStats.internal === approvalStats.total 
                  ? 'Completed' 
                  : approvalStats.internal > 0 
                    ? 'In Progress' 
                    : 'Not Started'}
              </p>
            </div>
            {approvalStats.internal === approvalStats.total && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${
              approvalStats.client > 0 ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Building2 className={`h-5 w-5 ${
                approvalStats.client > 0 ? 'text-blue-600' : 'text-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Client Review</p>
              <p className="text-sm text-gray-500">
                {approvalStats.client === approvalStats.total 
                  ? 'Completed' 
                  : approvalStats.client > 0 
                    ? 'In Progress' 
                    : approvalStats.internal < approvalStats.total
                      ? 'Awaiting Internal Approval'
                      : 'Ready for Review'}
              </p>
            </div>
            {approvalStats.client === approvalStats.total && (
              <CheckCircle className="h-5 w-5 text-blue-600" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}