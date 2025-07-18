import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { 
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  FileText,
  Calendar,
  User
} from 'lucide-react'

interface Submission {
  id: string
  product_name: string
  therapeutic_area: string
  stage: string
  workflow_stage: string
  target_audience: string
  created_at: string
  submitter_name: string
  submitter_email: string
  priority_level: string
  indication?: string
  langchain_status?: string
  generated_seo_content?: any
}

export default function SEOReview() {
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState<string>('all')

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['seo-review-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('workflow_stage', 'seo_review')
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
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800'
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
        <div className="mt-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {filteredSubmissions.length} requests pending review
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
            <Link
              key={submission.id}
              to={`/seo-review/${submission.id}`}
              className="block"
            >
              <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200 hover:border-blue-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {submission.product_name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="font-medium">{submission.stage}</span>
                          <span>•</span>
                          <span>{submission.therapeutic_area}</span>
                          <span>•</span>
                          <span>{submission.target_audience}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 mt-1" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            Submitted: {format(new Date(submission.created_at), 'MMM d, yyyy')}
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
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(submission.priority_level)}`}>
                          {submission.priority_level} Priority
                        </span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(submission.langchain_status || 'pending')}
                          <span className="text-sm font-medium text-gray-700">
                            Generated
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}