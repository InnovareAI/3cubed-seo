import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchClientReviewSubmissions } from '@/lib/api/clientReview'
import CTAButton from '@/components/CTAButton'
import { 
  Search, 
 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Building,
  Calendar,
  MessageSquare,
  FileText,
  Users,

  Edit3,
  Eye,
  AlertCircle
} from 'lucide-react'

export default function ClientReview() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const { data: submissions, isLoading, error } = useQuery({
    queryKey: ['client-review-content', { searchQuery, selectedPriority, selectedClient, selectedStatus }],
    queryFn: () => fetchClientReviewSubmissions({
      searchQuery,
      priority: selectedPriority,
      status: selectedStatus,
      client: selectedClient
    }),
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  const filteredSubmissions = submissions || []

  const handleCardClick = (id: string) => {
    navigate(`/client-review/${id}`)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600'
      case 'approved':
        return 'text-green-600'
      case 'revision_requested':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'revision_requested':
        return <Edit3 className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Get unique clients from submissions
  const uniqueClients = [...new Set(submissions?.map(s => s.sponsor_name).filter(Boolean))]

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client review content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-600">Error loading content. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Review</h1>
        <p className="text-gray-600">Review and approve SEO-optimized content with clients</p>
        <CTAButton 
          className="mt-4"
          icon={<FileText className="h-4 w-4" />}
          variant="secondary"
        >
          Export Report
        </CTAButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total for Review</h3>
          <p className="text-3xl font-bold text-gray-900">{filteredSubmissions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Pending Review</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {filteredSubmissions.filter(s => s.client_review_status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Client Approved</h3>
          <p className="text-3xl font-bold text-green-600">
            {filteredSubmissions.filter(s => s.client_review_status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Revisions Requested</h3>
          <p className="text-3xl font-bold text-red-600">
            {filteredSubmissions.filter(s => s.client_review_status === 'revision_requested').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {uniqueClients.map(client => (
              <option key={client} value={client}>{client}</option>
            ))}
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
                {(submission.priority_level || 'medium').charAt(0).toUpperCase() + (submission.priority_level || 'medium').slice(1)} Priority
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="h-4 w-4" />
                <span>{submission.sponsor_name || 'Unknown Client'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{submission.target_audience || 'Healthcare Professionals'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Updated {new Date(submission.last_updated || submission.created_at).toLocaleDateString()}</span>
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
          <p className="text-sm text-gray-400 mt-2">
            Content must be in 'seo_review' workflow stage with completed status and generated content
          </p>
        </div>
      )}
    </div>
  )
}
