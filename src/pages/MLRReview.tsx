import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/database-types'
import { mockMLRReviews } from '../data/mockMLRReviews'
import CTAButton from '../components/CTAButton'
import { THERAPEUTIC_AREAS } from '../constants/therapeuticAreas'
import { 
  Search,
  FileText,
  Shield,
  Calendar,
  AlertCircle,
  Clock,
  Filter,
  Users,
  Building,
  ArrowRight,
  Eye,
  CheckCircle,
  Scale,
  BookOpen,
  Award,
  XCircle,
  AlertTriangle,
  Info
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
  submitter_company?: string
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
  mlr_requirements?: {
    prescribing_information_approved: boolean
    pi_approval_date?: string | null
    peer_reviewed_articles: Array<{
      title: string
      journal: string
      status: 'verified' | 'pending' | 'rejected'
    }>
    regulatory_submissions: string[]
  }
  compliance_items?: {
    claims_verification: 'verified' | 'pending' | 'failed'
    fair_balance: 'compliant' | 'under_review' | 'non_compliant'
    adverse_events_disclosure: 'complete' | 'incomplete' | 'missing'
    contraindications_listed: boolean
    dosage_administration_clear: boolean
    off_label_disclaimers: 'present' | 'missing' | 'unclear'
  }
}

export default function MLRReview() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState<string>('all')
  const [useDummyData, setUseDummyData] = useState(true)

  const { data: dbSubmissions, isLoading } = useQuery({
    queryKey: ['mlr-review-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('workflow_stage', 'mlr_review')
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

  const handleCardClick = (submissionId: string) => {
    navigate(`/mlr-review/${submissionId}`)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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

  const getComplianceStatus = (submission: Submission) => {
    if (!submission.compliance_items) return 'unknown'
    const items = submission.compliance_items
    const criticalItems = [
      items.claims_verification === 'verified',
      items.fair_balance === 'compliant',
      items.adverse_events_disclosure === 'complete',
      items.contraindications_listed,
      items.dosage_administration_clear,
      items.off_label_disclaimers === 'present'
    ]
    const passedItems = criticalItems.filter(Boolean).length
    const totalItems = criticalItems.length
    
    if (passedItems === totalItems) return 'compliant'
    if (passedItems >= totalItems * 0.7) return 'partial'
    return 'non_compliant'
  }

  // Calculate stats for the cards
  const stats = {
    total: filteredSubmissions?.length || 0,
    highPriority: filteredSubmissions?.filter(s => s.priority_level?.toLowerCase() === 'high').length || 0,
    compliant: filteredSubmissions?.filter(s => getComplianceStatus(s) === 'compliant').length || 0,
    piApproved: filteredSubmissions?.filter(s => s.mlr_requirements?.prescribing_information_approved).length || 0
  }

  if (!useDummyData && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MLR Review</h1>
          <p className="text-sm text-gray-600 mt-1">Medical legal compliance review before publication</p>
        </div>
        <div className="flex items-center gap-3">
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
          <CTAButton variant="primary" icon={<FileText className="h-4 w-4" />}>
            Export Report
          </CTAButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total for Review</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-semibold text-red-600 mt-1">{stats.highPriority}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">MLR Compliant</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">{stats.compliant}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">PI Approved</p>
              <p className="text-2xl font-semibold text-blue-600 mt-1">{stats.piApproved}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={therapeuticAreaFilter}
            onChange={(e) => setTherapeuticAreaFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Therapeutic Areas</option>
            {THERAPEUTIC_AREAS.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            defaultValue="all"
          >
            <option value="all">All Stages</option>
            <option value="pre-launch">Pre-Launch</option>
            <option value="launch">Launch</option>
            <option value="post-launch">Post-Launch</option>
          </select>

          <CTAButton variant="secondary" icon={<Filter className="h-4 w-4" />}>
            More Filters
          </CTAButton>
        </div>
      </div>

      {/* MLR Requirements & Best Practices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* MLR Requirements */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">MLR Requirements</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-700">Approved Prescribing Information (PI)</span>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Required</span>
            </div>
            <div className="flex items-center gap-3">
              <Award className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-gray-700">Peer-reviewed Journal Articles</span>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Required</span>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Regulatory Submissions</span>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Verified</span>
            </div>
          </div>
        </div>

        {/* Industry Best Practices */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Compliance Best Practices</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-700">Claims Verification</span>
            </div>
            <div className="flex items-center gap-3">
              <Scale className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-700">Fair Balance Requirements</span>
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-gray-700">Adverse Events Disclosure</span>
            </div>
            <div className="flex items-center gap-3">
              <Info className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-700">Off-label Use Disclaimers</span>
            </div>
          </div>
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
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
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
                <span>{('submitter_company' in submission ? submission.submitter_company : submission.client_name) || '-'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{submission.target_audience?.join(', ') || '-'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Received {format(new Date(submission.created_at), 'MMM d, yyyy')}</span>
              </div>

              {/* MLR Requirements Status */}
              {submission.mlr_requirements && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-xs font-medium">PI Status:</span>
                    {submission.mlr_requirements.prescribing_information_approved ? (
                      <span className="text-green-600 text-xs bg-green-100 px-2 py-0.5 rounded-full">Approved</span>
                    ) : (
                      <span className="text-red-600 text-xs bg-red-100 px-2 py-0.5 rounded-full">Pending</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4" />
                    <span className="text-xs font-medium">Articles:</span>
                    <span className="text-xs text-gray-600">{submission.mlr_requirements.peer_reviewed_articles.length} verified</span>
                  </div>
                </div>
              )}

              {/* Compliance Status */}
              {submission.compliance_items && (
                <div className="flex items-start gap-2 text-sm p-2 rounded" 
                     style={{
                       backgroundColor: getComplianceStatus(submission) === 'compliant' ? '#f0f9ff' : 
                                       getComplianceStatus(submission) === 'partial' ? '#fef3c7' : '#fee2e2'
                     }}>
                  {getComplianceStatus(submission) === 'compliant' ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  ) : getComplianceStatus(submission) === 'partial' ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <span className="text-xs font-medium">
                      {getComplianceStatus(submission) === 'compliant' ? 'MLR Compliant' :
                       getComplianceStatus(submission) === 'partial' ? 'Partial Compliance' :
                       'Non-Compliant'}
                    </span>
                    {getComplianceStatus(submission) !== 'compliant' && (
                      <p className="text-xs text-gray-600 mt-1">Review required for compliance items</p>
                    )}
                  </div>
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
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {filteredSubmissions?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No content found for MLR review</p>
        </div>
      )}
    </div>
  )
}
