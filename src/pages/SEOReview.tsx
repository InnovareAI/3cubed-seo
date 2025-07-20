import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import SEOReviewModal from '../components/SEOReviewModal'
import FilterBar from '../components/FilterBar'
import EmptyState from '../components/EmptyState'
import { mockSEOReviews } from '../data/mockSEOReviews'
import { 
  Search,
  FileText,
  Hash,
  TrendingUp,
  MessageSquare,
  Calendar,
  Building2,
  Target,
  AlertCircle,
  ChevronRight
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
  meta_title?: string
  meta_description?: string
}

export default function SEOReview() {
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState<string>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [useDummyData, setUseDummyData] = useState(true)

  const { data: dbSubmissions, isLoading } = useQuery({
    queryKey: ['seo-review-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('workflow_stage', 'SEO_Review')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data as Submission[]
    },
    refetchInterval: 30000,
    enabled: !useDummyData
  })

  // Use dummy data or live data based on toggle
  const submissions = useMemo(() => {
    if (useDummyData) return mockSEOReviews
    return dbSubmissions || []
  }, [useDummyData, dbSubmissions])

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

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-700 bg-red-50 ring-red-600/20'
      case 'medium':
        return 'text-amber-700 bg-amber-50 ring-amber-600/20'
      case 'low':
        return 'text-green-700 bg-green-50 ring-green-600/20'
      default:
        return 'text-gray-700 bg-gray-50 ring-gray-600/20'
    }
  }

  if (!useDummyData && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SEO Review Queue</h1>
                <p className="text-sm text-gray-600 mt-0.5">Review and optimize AI-generated content for search performance</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Mode:</span>
                <button
                  onClick={() => setUseDummyData(!useDummyData)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    useDummyData 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {useDummyData ? 'Demo Data' : 'Live Data'}
                </button>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">{filteredSubmissions.length} items awaiting review</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        therapeuticAreaFilter={therapeuticAreaFilter}
        onTherapeuticAreaChange={setTherapeuticAreaFilter}
        therapeuticAreas={therapeuticAreas}
      />

      {/* Review Queue */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title="No submissions pending SEO review"
            description="New submissions will appear here when they're ready for review."
            showDemoButton={!useDummyData}
            onShowDemo={() => setUseDummyData(true)}
          />
        ) : (
          filteredSubmissions.map((submission) => (
            <div 
              key={submission.id} 
              className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Left Section - Main Content */}
                  <div className="flex-1">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {submission.product_name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-medium">{submission.therapeutic_area}</span>
                          <span>•</span>
                          <span>{submission.stage}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {submission.target_audience?.join(', ') || 'Not specified'}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${getPriorityColor(submission.priority_level)}`}>
                        {submission.priority_level} Priority
                      </span>
                    </div>

                    {/* Medical Indication */}
                    {submission.medical_indication && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Medical Indication:</span> {submission.medical_indication}
                        </p>
                      </div>
                    )}

                    {/* SEO Metrics Bar */}
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Keywords:</span>
                        <span className="text-sm font-semibold text-gray-900">{submission.seo_keywords?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Long-tail:</span>
                        <span className="text-sm font-semibold text-gray-900">{submission.long_tail_keywords?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Questions:</span>
                        <span className="text-sm font-semibold text-gray-900">{submission.consumer_questions?.length || 0}</span>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(submission.created_at), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{submission.submitter_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Action */}
                  <div className="flex items-center">
                    <button
                      onClick={() => handleCardClick(submission)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Review
                      <ChevronRight className="h-4 w-4" />
                    </button>
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