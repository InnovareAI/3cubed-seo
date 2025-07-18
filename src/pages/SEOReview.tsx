import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import SEOReviewModal from '../components/SEOReviewModal'
import { 
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  FileText,
  Calendar,
  User,
  Users,
  Target,
  Globe,
  TrendingUp,
  MessageSquare,
  Hash,
  Building,
  Tag,
  Zap
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
  h1_tag?: any
  meta_description?: any
}

export default function SEOReview() {
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState<string>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['seo-review-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('workflow_stage', 'SEO_Review')
        .order('created_at', { ascending: true }) // Oldest first
      
      if (error) throw error
      return data as Submission[]
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  const filteredSubmissions = submissions?.filter(submission => {
    if (searchTerm && !submission.product_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !submission.therapeutic_area.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (priorityFilter !== 'all' && submission.priority_level.toLowerCase() !== priorityFilter) {
      return false
    }
    if (therapeuticAreaFilter !== 'all' && submission.therapeutic_area !== therapeuticAreaFilter) {
      return false
    }
    return true
  }) || []

  const getPriorityBadge = (priority: string) => {
    const classes = {
      'high': 'bg-red-100 text-red-800 border-red-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-green-100 text-green-800 border-green-200'
    }
    
    return classes[priority.toLowerCase() as keyof typeof classes] || classes.medium
  }

  const getDaysInQueue = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusIcon = (status: string) => {
    if (status === 'complete' || status === 'approved') {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (status === 'processing') {
      return <Clock className="h-4 w-4 text-blue-500" />
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const handleCardClick = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSubmission(null)
  }

  // Get unique therapeutic areas for filter
  const therapeuticAreas = [...new Set(submissions?.map(s => s.therapeutic_area) || [])]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">SEO Review Queue</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve AI-generated SEO content
        </p>
        <div className="mt-2 flex items-center gap-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {filteredSubmissions.length} requests pending review
          </span>
          <span className="text-sm text-gray-500">
            Click any card to review in detail
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-md text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          
          <div>
            <select
              value={therapeuticAreaFilter}
              onChange={(e) => setTherapeuticAreaFilter(e.target.value)}
              className="border border-gray-300 rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Therapeutic Areas</option>
              {therapeuticAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center justify-end text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            Sorted by: Oldest First
          </div>
        </div>
      </div>

      {/* Review Queue */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions pending SEO review</h3>
            <p className="text-gray-500">New submissions will appear here when they're ready for review.</p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              onClick={() => handleCardClick(submission)}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 p-6 border border-gray-200 hover:border-blue-400 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {submission.product_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(submission.priority_level)}`}>
                          <Zap className="h-3 w-3 mr-1" />
                          {submission.priority_level} Priority
                        </span>
                        <span className="inline-flex items-center text-gray-600">
                          <Target className="h-4 w-4 mr-1" />
                          {submission.stage}
                        </span>
                        <span className="inline-flex items-center text-gray-600">
                          <Building className="h-4 w-4 mr-1" />
                          {submission.therapeutic_area}
                        </span>
                        {submission.target_audience && submission.target_audience.length > 0 && (
                          <span className="inline-flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-1" />
                            {submission.target_audience.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors mt-1" />
                  </div>

                  {/* Medical Information */}
                  {submission.medical_indication && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Medical Indication:</span> {submission.medical_indication}
                      </p>
                    </div>
                  )}

                  {/* Key Differentiators */}
                  {submission.key_differentiators && submission.key_differentiators.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {submission.key_differentiators.slice(0, 3).map((diff, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Tag className="h-3 w-3 mr-1" />
                            {diff}
                          </span>
                        ))}
                        {submission.key_differentiators.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{submission.key_differentiators.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SEO Preview */}
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500">SEO Keywords</span>
                        <Hash className="h-3 w-3 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {submission.seo_keywords?.length || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500">Long-tail Keywords</span>
                        <TrendingUp className="h-3 w-3 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {submission.long_tail_keywords?.length || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500">Consumer Questions</span>
                        <MessageSquare className="h-3 w-3 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {submission.consumer_questions?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {format(new Date(submission.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{submission.submitter_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {getDaysInQueue(submission.created_at)} days in queue
                        </span>
                      </div>
                      {submission.geography && submission.geography.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{submission.geography.join(', ')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {getStatusIcon(submission.langchain_status || 'pending')}
                      <span className="text-sm font-medium text-gray-700">
                        AI Generated
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SEO Review Modal */}
      {selectedSubmission && (
        <SEOReviewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          submission={selectedSubmission}
        />
      )}
    </div>
  )
}