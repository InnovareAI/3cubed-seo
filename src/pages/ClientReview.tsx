import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { mockSEOReviews } from '@/data/mockSEOReviews'
import CTAButton from '@/components/CTAButton'
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Building,
  Calendar,
  MessageSquare,
  FileText,
  Users,
  ThumbsUp,
  Edit3,
  Eye
} from 'lucide-react'

interface Submission {
  id: string
  product_name: string
  therapeutic_area: string
  stage: string
  workflow_stage: string
  target_audience: string[]
  created_at: string
  submitter_name: string
  priority_level: string
  client_name?: string
  seo_reviewed_at?: string
  client_review_status?: string
  client_feedback?: string
  client_approval_date?: string
}

export default function ClientReview() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [useDemoData] = useState(true)

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['client-review-content', { searchQuery, selectedPriority, selectedClient, selectedStatus }],
    queryFn: async () => {
      if (useDemoData) {
        // Filter mock data for Client Review stage
        return mockSEOReviews.filter(s => 
          s.workflow_stage === 'Client_Review' || 
          s.workflow_stage === 'client_review'
        ).map(s => ({
          ...s,
          client_review_status: Math.random() > 0.5 ? 'pending' : Math.random() > 0.5 ? 'approved' : 'revision_requested',
          client_approval_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          client_feedback: Math.random() > 0.5 ? 'Please revise the H2 tags to be more specific' : null
        }))
      }

      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('workflow_stage', 'Client_Review')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  const filteredSubmissions = submissions?.filter(submission => {
    const matchesSearch = !searchQuery || 
      submission.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.therapeutic_area?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesPriority = selectedPriority === 'all' || submission.priority_level === selectedPriority
    const matchesClient = selectedClient === 'all' || submission.client_name === selectedClient
    const matchesStatus = selectedStatus === 'all' || submission.client_review_status === selectedStatus
    
    return matchesSearch && matchesPriority && matchesClient && matchesStatus
  })

  const stats = {
    total: filteredSubmissions?.length || 0,
    pending: filteredSubmissions?.filter(s => s.client_review_status === 'pending').length || 0,
    approved: filteredSubmissions?.filter(s => s.client_review_status === 'approved').length || 0,
    revision: filteredSubmissions?.filter(s => s.client_review_status === 'revision_requested').length || 0
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'revision_requested': return <Edit3 className="h-5 w-5 text-yellow-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600'
      case 'revision_requested': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const handleCardClick = (id: string) => {
    navigate(`/client-review/${id}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Review</h1>
          <p className="text-sm text-gray-600 mt-1">Review and approve SEO-optimized content with clients</p>
        </div>
        <CTAButton variant="primary" icon={<FileText className="h-4 w-4" />}>
          Export Report
        </CTAButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total for Review</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Client Approved</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ThumbsUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revisions Requested</p>
              <p className="text-2xl font-semibold text-yellow-600 mt-1">{stats.revision}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Edit3 className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Clients</option>
            <option value="Pharma Corp">Pharma Corp</option>
            <option value="BioPharma Inc">BioPharma Inc</option>
            <option value="HealthCare Solutions">HealthCare Solutions</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="revision_requested">Revision Requested</option>
          </select>

          <CTAButton variant="secondary" icon={<Filter className="h-4 w-4" />}>
            More Filters
          </CTAButton>
        </div>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubmissions?.map((submission) => (
          <div
            key={submission.id}
            onClick={() => handleCardClick(submission.id)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {submission.product_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{submission.therapeutic_area}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(submission.priority_level || 'medium')}`}>
                {submission.priority_level || 'Medium'} Priority
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="h-4 w-4" />
                <span>{submission.client_name || 'Pharma Corp'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{submission.target_audience?.join(', ') || 'Healthcare Professionals'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Sent {new Date(submission.client_approval_date || submission.created_at).toLocaleDateString()}</span>
              </div>

              <div className={`flex items-center gap-2 text-sm ${getStatusColor(submission.client_review_status || 'pending')}`}>
                {getStatusIcon(submission.client_review_status || 'pending')}
                <span className="capitalize">{(submission.client_review_status || 'pending').replace('_', ' ')}</span>
              </div>

              {submission.client_feedback && (
                <div className="flex items-start gap-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                  <MessageSquare className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <span className="text-xs">{submission.client_feedback}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <CTAButton
                size="sm"
                variant="secondary"
                icon={<Eye className="h-3 w-3" />}
              >
                View Details
              </CTAButton>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {filteredSubmissions?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No content found for client review</p>
        </div>
      )}
    </div>
  )
}