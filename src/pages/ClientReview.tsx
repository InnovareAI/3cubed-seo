import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import ClientReviewModal from '../components/ClientReviewModal'
import ReviewCard from '../components/ReviewCard'
import ReviewPageHeader from '../components/ReviewPageHeader'
import FilterBar from '../components/FilterBar'
import EmptyState from '../components/EmptyState'
import RoleInfoBanner from '../components/RoleInfoBanner'
import { mockClientReviews } from '../data/mockClientReviews'
import { 
  Building2,
  FileText,
  Users,
  TrendingUp,
  DollarSign,
  Globe
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
  competitors?: string[]
  positioning?: string
  dosage_form?: string
  ai_output?: string
}

export default function ClientReview() {
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState<string>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [useDummyData, setUseDummyData] = useState(true)

  const { data: dbSubmissions, isLoading } = useQuery({
    queryKey: ['client-review-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('workflow_stage', 'Client_Review')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data as Submission[]
    },
    refetchInterval: 30000,
    enabled: !useDummyData
  })

  // Use dummy data or live data based on toggle
  const submissions = useMemo(() => {
    if (useDummyData) return mockClientReviews
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
        title="Client Review Queue"
        description="Review SEO content for brand alignment and commercial objectives"
        icon={<Building2 className="h-6 w-6 text-blue-600" />}
        queueCount={filteredSubmissions.length}
        showDemoToggle={true}
        isDemoMode={useDummyData}
        onDemoToggle={() => setUseDummyData(!useDummyData)}
        statusIndicators={[
          { color: 'bg-green-500', label: 'SEO Approved' },
          { color: 'bg-blue-500', label: 'Awaiting Client Review' },
          { color: 'bg-purple-500', label: 'Next: MLR Review' }
        ]}
      />

      <RoleInfoBanner
        title="Client Review"
        description="Brand alignment and commercial objectives"
        bulletPoints={[
          'Validate brand voice and messaging consistency',
          'Ensure commercial strategy alignment',
          'Review target audience appropriateness',
          'Confirm competitive positioning and differentiation'
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
            <Building2 className="h-4 w-4 mr-1" />
            Brand Alignment
          </div>
        }
      />

      {/* Review Queue */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSubmissions.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3">
            <EmptyState
              icon={<FileText className="h-12 w-12" />}
              title="No submissions pending client review"
              description="Submissions will appear here after SEO team approval."
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
                  Client Review
                </span>
              }
              priorityLevel={submission.priority_level as 'High' | 'Medium' | 'Low'}
              highlights={
                submission.competitors ? [{
                  label: 'Competitors',
                  items: submission.competitors,
                  icon: <Globe className="h-3 w-3" />,
                  colorClass: 'bg-orange-100 text-orange-800'
                }] : undefined
              }
              metrics={[
                {
                  label: 'Target Markets',
                  value: submission.target_audience?.length || 0,
                  icon: <Users className="h-3 w-3 text-gray-400" />
                },
                {
                  label: 'Traffic',
                  value: '+150%',
                  icon: <TrendingUp className="h-3 w-3 text-gray-400" />
                },
                {
                  label: 'ROI',
                  value: '3.5x',
                  icon: <DollarSign className="h-3 w-3 text-gray-400" />
                }
              ]}
              roleSpecificContent={
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Brand Focus:</span> Ensure content aligns with brand guidelines, commercial objectives, and market positioning.
                  </p>
                </div>
              }
            />
          ))
        )}
      </div>

      {/* Client Review Modal */}
      {selectedSubmission && (
        <ClientReviewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          submission={selectedSubmission}
        />
      )}
    </div>
  )
}
