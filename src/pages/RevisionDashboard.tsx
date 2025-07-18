import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  MessageSquare, 
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
  Shield
} from 'lucide-react'

interface Submission {
  id: string
  product_name: string
  therapeutic_area: string
  stage: string
  workflow_stage: string
  priority_level: string
  submitter_name: string
  submitter_email: string
  created_at: string
  updated_at: string
  indication?: string
  target_audience?: string
  rejection_stage?: string
  rejection_reason?: string
  rejected_by?: string
  rejected_at?: string
  seo_reviewer?: string
  mlr_reviewer?: string
  client_reviewer?: string
  ai_output?: any
}

interface RevisionStats {
  total: number
  seo: number
  client: number
  mlr: number
  high_priority: number
  pending_7_days: number
}

const getReviewerTypeBadge = (rejectionStage: string) => {
  const config = {
    'SEO_Review': { 
      class: 'bg-blue-100 text-blue-800', 
      icon: <Search className="h-3 w-3" />,
      label: 'SEO Review'
    },
    'Client_Review': { 
      class: 'bg-purple-100 text-purple-800', 
      icon: <Users className="h-3 w-3" />,
      label: 'Client Review'
    },
    'MLR_Review': { 
      class: 'bg-green-100 text-green-800', 
      icon: <Shield className="h-3 w-3" />,
      label: 'MLR Review'
    }
  }

  const typeConfig = config[rejectionStage as keyof typeof config] || config['SEO_Review']
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.class}`}>
      {typeConfig.icon}
      {typeConfig.label}
    </span>
  )
}

const getPriorityBadge = (priority: string) => {
  const classes = {
    'high': 'bg-red-100 text-red-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'low': 'bg-green-100 text-green-800'
  }
  
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${classes[priority.toLowerCase() as keyof typeof classes] || classes.medium}`}>
      {priority}
    </span>
  )
}

export default function RevisionDashboard() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({})
  const [filterBy, setFilterBy] = useState<'all' | 'seo' | 'client' | 'mlr'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['revision-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('workflow_stage', 'Revision_Requested')
        .order('rejected_at', { ascending: false })
      
      if (error) throw error
      return data as Submission[]
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  const updateSubmission = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('submissions')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revision-dashboard'] })
      setRevisionNotes({})
    }
  })

  // Filter submissions based on selected filter and search term
  const filteredSubmissions = submissions?.filter(submission => {
    const matchesFilter = filterBy === 'all' || 
      (filterBy === 'seo' && submission.rejection_stage === 'SEO_Review') ||
      (filterBy === 'client' && submission.rejection_stage === 'Client_Review') ||
      (filterBy === 'mlr' && submission.rejection_stage === 'MLR_Review')
    
    const matchesSearch = searchTerm === '' || 
      submission.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.therapeutic_area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.submitter_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  // Calculate stats
  const stats: RevisionStats = {
    total: submissions?.length || 0,
    seo: submissions?.filter(s => s.rejection_stage === 'SEO_Review').length || 0,
    client: submissions?.filter(s => s.rejection_stage === 'Client_Review').length || 0,
    mlr: submissions?.filter(s => s.rejection_stage === 'MLR_Review').length || 0,
    high_priority: submissions?.filter(s => s.priority_level.toLowerCase() === 'high').length || 0,
    pending_7_days: submissions?.filter(s => {
      const rejectedDate = s.rejected_at ? new Date(s.rejected_at) : new Date()
      const daysSince = Math.floor((new Date().getTime() - rejectedDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysSince >= 7
    }).length || 0
  }

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const handleResubmit = (submission: Submission) => {
    // Determine which stage to return to based on rejection stage
    let newStage = submission.rejection_stage || 'SEO_Review'
    let newStatus = 'needs_review'
    
    if (submission.rejection_stage === 'Client_Review') {
      newStatus = 'client_review'
    } else if (submission.rejection_stage === 'MLR_Review') {
      newStatus = 'mlr_review'
    }

    updateSubmission.mutate({
      id: submission.id,
      updates: {
        workflow_stage: newStage,
        langchain_status: newStatus,
        rejection_stage: null,
        rejection_reason: null,
        rejected_by: null,
        rejected_at: null,
        revision_notes: revisionNotes[submission.id] || null,
        updated_at: new Date().toISOString()
      }
    })
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
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Revision Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and process all revision requests from reviewers
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revisions
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Search className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    SEO Revisions
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.seo}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Client Revisions
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.client}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    MLR Revisions
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.mlr}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    High Priority
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.high_priority}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending 7+ Days
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.pending_7_days}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterBy('all')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filterBy === 'all' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setFilterBy('seo')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filterBy === 'seo' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  SEO ({stats.seo})
                </button>
                <button
                  onClick={() => setFilterBy('client')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filterBy === 'client' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Client ({stats.client})
                </button>
                <button
                  onClick={() => setFilterBy('mlr')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filterBy === 'mlr' 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  MLR ({stats.mlr})
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search revisions..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Revisions Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Review Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rejected By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions?.map((submission) => (
                <>
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {submission.product_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {submission.therapeutic_area} • {submission.stage}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {submission.rejection_stage && getReviewerTypeBadge(submission.rejection_stage)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(submission.priority_level)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{submission.rejected_by || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">
                        {submission.rejected_at && format(new Date(submission.rejected_at), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(() => {
                        const rejectedDate = submission.rejected_at ? new Date(submission.rejected_at) : new Date()
                        const daysSince = Math.floor((new Date().getTime() - rejectedDate.getTime()) / (1000 * 60 * 60 * 24))
                        return (
                          <span className={daysSince >= 7 ? 'text-red-600 font-medium' : ''}>
                            {daysSince} days ago
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/submissions/${submission.id}`}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                        <button
                          onClick={() => toggleRowExpansion(submission.id)}
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1"
                        >
                          {expandedRows.has(submission.id) ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Expand
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {expandedRows.has(submission.id) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          {/* Rejection Reason */}
                          <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                              <MessageSquare className="h-5 w-5 text-red-400 flex-shrink-0" />
                              <div className="ml-3">
                                <h4 className="text-sm font-medium text-red-800">Rejection Reason</h4>
                                <p className="mt-1 text-sm text-red-700">
                                  {submission.rejection_reason || 'No specific reason provided'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Current Content Preview */}
                          {submission.ai_output && (
                            <div className="bg-gray-100 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Current Content Preview</h4>
                              <div className="text-xs text-gray-600 max-h-40 overflow-y-auto">
                                <pre className="whitespace-pre-wrap">
                                  {typeof submission.ai_output === 'string' 
                                    ? submission.ai_output.substring(0, 500) + '...'
                                    : JSON.stringify(submission.ai_output, null, 2).substring(0, 500) + '...'}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* Revision Notes */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Revision Notes
                            </label>
                            <textarea
                              value={revisionNotes[submission.id] || ''}
                              onChange={(e) => setRevisionNotes({ ...revisionNotes, [submission.id]: e.target.value })}
                              rows={3}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              placeholder="Add notes about the revisions made..."
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleResubmit(submission)}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Resubmit for Review
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        
        {(!filteredSubmissions || filteredSubmissions.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm || filterBy !== 'all' 
              ? 'No revisions found matching your filters'
              : 'No revision requests at this time'}
          </div>
        )}
      </div>
    </div>
  )
}
