import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import MLRReviewModal from '../components/MLRReviewModal'
import ReviewCard from '../components/ReviewCard'
import ReviewPageHeader from '../components/ReviewPageHeader'
import FilterBar from '../components/FilterBar'
import EmptyState from '../components/EmptyState'
import RoleInfoBanner from '../components/RoleInfoBanner'
import { mockMLRReviews } from '../data/mockMLRReviews'
import { 
  Shield,
  FileText,
  Scale,
  FileCheck,
  AlertTriangle,
  CheckCircle
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
  client_review_responses?: any
  client_reviewed_at?: string
  client_reviewed_by?: string
  dosage_form?: string
  ai_output?: any
}

export default function MLRReview() {
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState<string>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [useDummyData, setUseDummyData] = useState(true)

  const { data: dbSubmissions, isLoading } = useQuery({
    queryKey: ['mlr-review-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('workflow_stage', 'MLR_Review')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data as Submission[]
    },
    refetchInterval: 30000,
    enabled: !useDummyData
  })

  // Use dummy data or live data based on toggle
  const submissions = useMemo(() => {
    if (useDummyData) return mockMLRReviews
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      <ReviewPageHeader
        title="Medical Legal Review (MLR) Queue"
        description="Final compliance review before publication"
        icon={<Shield className="h-6 w-6 text-purple-600" />}
        queueCount={filteredSubmissions.length}
        showDemoToggle={true}
        isDemoMode={useDummyData}
        onDemoToggle={() => setUseDummyData(!useDummyData)}
        statusIndicators={[
          { color: 'bg-green-500', label: 'Client Approved' },
          { color: 'bg-purple-500', label: 'Awaiting MLR Review' },
          { color: 'bg-emerald-500', label: 'Next: Publication' }
        ]}
      />

      <RoleInfoBanner
        title="Your Role in MLR Review"
        description="As the MLR reviewer, you'll ensure compliance with:"
        bulletPoints={[
          'Medical accuracy and scientific validity of all claims',
          'Legal and regulatory requirements (FDA, FTC guidelines)',
          'Fair balance between benefits and risks',
          'Appropriate disclaimers and safety information'
        ]}
        variant="purple"
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
            <Shield className="h-4 w-4 mr-1" />
            Compliance Review
          </div>
        }
      />

      {/* Review Queue */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSubmissions.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3">
            <EmptyState
              icon={<FileText className="h-12 w-12" />}
              title="No submissions pending MLR review"
              description="All submissions have completed MLR review."
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  MLR Review
                </span>
              }
              priorityLevel={submission.priority_level as 'High' | 'Medium' | 'Low'}
              highlights={
                submission.client_review_responses?.kpiAlignment ? [{
                  label: 'Client Approved KPIs',
                  items: submission.client_review_responses.kpiAlignment,
                  icon: <CheckCircle className="h-3 w-3" />,
                  colorClass: 'bg-green-100 text-green-800'
                }] : undefined
              }
              metrics={[
                {
                  label: 'Client Score',
                  value: submission.client_review_responses?.roiConfidence || 'N/A',
                  icon: <Scale className="h-3 w-3 text-gray-400" />
                },
                {
                  label: 'Review Stage',
                  value: 'Final',
                  icon: <FileCheck className="h-3 w-3 text-gray-400" />
                },
                {
                  label: 'Compliance',
                  value: 'Pending',
                  icon: <AlertTriangle className="h-3 w-3 text-gray-400" />
                }
              ]}
              roleSpecificContent={
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">MLR Focus:</span> Verify medical accuracy, regulatory compliance, and ensure proper balance of benefit/risk information.
                  </p>
                </div>
              }
            />
          ))
        )}
      </div>

      {/* MLR Review Modal */}
      {selectedSubmission && (
        <MLRReviewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          submission={selectedSubmission}
        />
      )}
    </div>
  )
}
