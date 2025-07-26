import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CTAButton from '../components/CTAButton'
import { THERAPEUTIC_AREAS } from '../constants/therapeuticAreas'
import { 
  Search,
  FileText,
  Shield,
  Calendar,
  Clock,
  Filter,
  Users,
  Building,
  ArrowRight,
  Eye,
  CheckCircle,
  Scale,
  XCircle
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
}

export default function MLRReview() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState<string>('all')

  const { data: submissions, isLoading } = useQuery({
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
    refetchInterval: 30000
  })

  // Fetch submission statistics - same as Overview and ClientReview
  const { data: submissionStats } = useQuery({
    queryKey: ['mlr-submission-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('workflow_stage, ai_processing_status')
      
      if (error) throw error
      
      const stats = {
        total: data.length,
        processed: data.filter(s => 
          s.ai_processing_status === 'completed' || 
          s.workflow_stage === 'seo_review' || 
          s.workflow_stage === 'client_review' || 
          s.workflow_stage === 'mlr_review' ||
          s.workflow_stage === 'revision_requested' ||
          s.workflow_stage === 'approved' ||
          s.workflow_stage === 'completed'
        ).length,
        approved: data.filter(s => 
          s.workflow_stage === 'approved' || 
          s.workflow_stage === 'completed'
        ).length,
        rejected: data.filter(s => s.workflow_stage === 'rejected').length
      }
      
      return stats
    }
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

  if (isLoading) {
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
        <CTAButton variant="primary" icon={<FileText className="h-4 w-4" />}>
          Export Report
        </CTAButton>
      </div>

      {/* Stats Cards - Updated to match Overview format */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{submissionStats?.total || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processed</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">{submissionStats?.processed || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-semibold text-indigo-600 mt-1">{submissionStats?.approved || 0}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-semibold text-red-600 mt-1">{submissionStats?.rejected || 0}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
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
                <span>{('submitter_company' in submission ? submission.submitter_company : submission.client_name) || 'Pharma Corp'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{submission.target_audience?.join(', ') || 'Healthcare Professionals'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Received {format(new Date(submission.created_at), 'MMM d, yyyy')}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-purple-600">
                <Shield className="h-4 w-4" />
                <span>Pending MLR Review</span>
              </div>

              {submission.client_review_responses?.roiConfidence && (
                <div className="flex items-start gap-2 text-sm text-gray-600 bg-green-50 p-2 rounded">
                  <Scale className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-xs">Client Score: {submission.client_review_responses.roiConfidence}</span>
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
