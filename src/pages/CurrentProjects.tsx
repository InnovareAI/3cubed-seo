import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Clock, CheckCircle, AlertCircle, XCircle, Edit2, Eye } from 'lucide-react'

type WorkflowStage = 'Form_Submitted' | 'AI_Processing' | 'SEO_Review' | 'MLR_Review' | 'Client_Review' | 'Revision_Requested' | 'Published'

interface Submission {
  id: string
  product_name: string
  therapeutic_area: string
  stage: string
  workflow_stage: WorkflowStage
  priority_level: string
  submitter_name: string
  submitter_email: string
  created_at: string
  updated_at: string
  indication?: string
  target_audience?: string
}

const getStatusBadge = (status: WorkflowStage) => {
  const config = {
    'Form_Submitted': { 
      class: 'bg-gray-100 text-gray-800', 
      icon: <Edit2 className="h-3 w-3" />,
      label: 'Submitted'
    },
    'AI_Processing': { 
      class: 'bg-blue-100 text-blue-800', 
      icon: <Clock className="h-3 w-3" />,
      label: 'AI Processing'
    },
    'SEO_Review': { 
      class: 'bg-yellow-100 text-yellow-800', 
      icon: <Clock className="h-3 w-3" />,
      label: 'SEO Review'
    },
    'MLR_Review': { 
      class: 'bg-purple-100 text-purple-800', 
      icon: <Clock className="h-3 w-3" />,
      label: 'MLR Review'
    },
    'Client_Review': { 
      class: 'bg-indigo-100 text-indigo-800', 
      icon: <Clock className="h-3 w-3" />,
      label: 'Client Review'
    },
    'Revision_Requested': { 
      class: 'bg-orange-100 text-orange-800', 
      icon: <AlertCircle className="h-3 w-3" />,
      label: 'Revision Requested'
    },
    'Published': { 
      class: 'bg-green-100 text-green-800', 
      icon: <CheckCircle className="h-3 w-3" />,
      label: 'Published'
    }
  }

  const statusConfig = config[status] || config['Form_Submitted']
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.class}`}>
      {statusConfig.icon}
      {statusConfig.label}
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

export default function CurrentProjects() {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['current-projects-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .in('workflow_stage', ['Form_Submitted', 'AI_Processing', 'SEO_Review', 'MLR_Review', 'Client_Review', 'Revision_Requested'])
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Submission[]
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  // Calculate summary stats
  const stats = {
    total: submissions?.length || 0,
    inReview: submissions?.filter(s => ['SEO_Review', 'MLR_Review', 'Client_Review'].includes(s.workflow_stage)).length || 0,
    submitted: submissions?.filter(s => ['Form_Submitted', 'AI_Processing'].includes(s.workflow_stage)).length || 0,
    highPriority: submissions?.filter(s => s.priority_level.toLowerCase() === 'high').length || 0
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
        <h1 className="text-2xl font-semibold text-gray-900">Current Projects</h1>
        <p className="mt-1 text-sm text-gray-500">
          Active SEO content projects in progress
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Projects
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
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    In Review
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.inReview}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Newly Submitted
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.submitted}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    High Priority
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.highPriority}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Active Projects
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted By
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
              {submissions?.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {submission.product_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.therapeutic_area}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.stage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(submission.workflow_stage)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(submission.priority_level)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{submission.submitter_name}</div>
                    <div className="text-sm text-gray-500">{submission.submitter_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(submission.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/submissions/${submission.id}`}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {(!submissions || submissions.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            No active projects at this time
          </div>
        )}
      </div>
    </div>
  )
}