import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import SEOReviewModal from '../components/SEOReviewModal'
import ReviewCard from '../components/ReviewCard'
import ReviewPageHeader from '../components/ReviewPageHeader'
import FilterBar from '../components/FilterBar'
import EmptyState from '../components/EmptyState'
import RoleInfoBanner from '../components/RoleInfoBanner'
import { mockSEOReviews } from '../data/mockSEOReviews'
import { 
  Search,
  FileText,
  Hash,
  TrendingUp,
  MessageSquare,
  Tag,
  Bot
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

  if (!useDummyData && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <ReviewPageHeader
        title="SEO Review Queue"
        description="Review and approve AI-generated SEO content for optimal search performance"
        icon={<Search className="h-6 w-6 text-blue-600" />}
        queueCount={filteredSubmissions.length}
        showDemoToggle={true}
        isDemoMode={useDummyData}
        onDemoToggle={() => setUseDummyData(!useDummyData)}
        statusIndicators={[
          { color: 'bg-yellow-500', label: 'AI Generated' },
          { color: 'bg-blue-500', label: 'Awaiting SEO Review' },
          { color: 'bg-green-500', label: 'Next: Client Review' }
        ]}
      />

      <RoleInfoBanner
        title="Your Role in SEO Review"
        description="As the SEO specialist, you'll optimize content for search performance:"
        bulletPoints={[
          'Validate keyword strategy and search intent alignment',
          'Review meta descriptions and title tags for click-through optimization',
          'Ensure content structure supports featured snippets and rich results',
          'Verify technical SEO elements (GEO optimization, schema markup readiness)'
        ]}
        variant="blue"
      />

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        therapeuticAreaFilter={therapeuticAreaFilter}
        onTherapeuticAreaChange={setTherapeuticAreaFilter}
        therapeuticAreas={therapeuticAreas}
        additionalFilters={
          <div className="flex items-center justify-end text-sm text-gray-500">
            <Bot className="h-4 w-4 mr-1" />
            AI Generated Content
          </div>
        }
      />

      {/* Review Queue */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSubmissions.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3">
            <EmptyState
              icon={<FileText className="h-12 w-12" />}
              title="No submissions pending SEO review"
              description="New submissions will appear here when they're ready for review."
              showDemoButton={!useDummyData}
              onShowDemo={() => setUseDummyData(true)}
            />
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <ReviewCard
              key={submission.id}
              submission={submission}
              onClick={() => handleCardClick(submission)}
              statusBadge={
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  SEO Review
                </span>
              }
              priorityLevel={submission.priority_level as 'High' | 'Medium' | 'Low'}
              highlights={
                submission.key_differentiators ? [{
                  label: 'Key Differentiators',
                  items: submission.key_differentiators,
                  icon: <Tag className="h-3 w-3" />,
                  colorClass: 'bg-purple-100 text-purple-800'
                }] : undefined
              }
              metrics={[
                {
                  label: 'SEO Keywords',
                  value: submission.seo_keywords?.length || 0,
                  icon: <Hash className="h-3 w-3 text-gray-400" />
                },
                {
                  label: 'Long-tail',
                  value: submission.long_tail_keywords?.length || 0,
                  icon: <TrendingUp className="h-3 w-3 text-gray-400" />
                },
                {
                  label: 'Questions',
                  value: submission.consumer_questions?.length || 0,
                  icon: <MessageSquare className="h-3 w-3 text-gray-400" />
                }
              ]}
              roleSpecificContent={
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">SEO Focus:</span> Review keyword strategy, content optimization, and search intent alignment for maximum organic visibility.
                  </p>
                </div>
              }
            />
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
