import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { supabase, type Submission } from '@/lib/supabase'
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function ProcessingQueue() {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['processing-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .neq('langchain_status', 'approved')
        .neq('langchain_status', 'published')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Submission[]
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'needs_processing': return 'text-gray-600'
      case 'processing': return 'text-blue-600'
      case 'needs_review': return 'text-yellow-600'
      case 'seo_approved': return 'text-green-600'
      case 'client_review': return 'text-purple-600'
      case 'client_approved': return 'text-green-600'
      case 'rejected': return 'text-red-600'
      case 'revision_requested': return 'text-orange-600'
      case 'mlr_review': return 'text-indigo-600'
      case 'mlr_approved': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'needs_processing':
      case 'processing':
        return <Clock className="w-4 h-4" />
      case 'seo_approved':
      case 'client_approved':
      case 'mlr_approved':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      case 'needs_review':
      case 'client_review':
      case 'mlr_review':
      case 'revision_requested':
        return <AlertCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const getWorkflowStageLabel = (stage: string) => {
    switch (stage) {
      case 'Form_Submitted': return 'Form Submitted'
      case 'AI_Processing': return 'AI Processing'
      case 'SEO_Review': return 'SEO Review'
      case 'Client_Review': return 'Client Review'
      case 'Revision_Requested': return 'Revision Requested'
      case 'MLR_Review': return 'MLR Review'
      case 'Published': return 'Published'
      default: return stage
    }
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading queue...</div>
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No items in processing queue
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Therapeutic Area
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stage
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {submissions.map((submission) => (
            <tr key={submission.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {submission.product_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {submission.therapeutic_area}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getWorkflowStageLabel(submission.workflow_stage)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center gap-1 text-sm font-medium ${getStatusColor(submission.langchain_status)}`}>
                  {getStatusIcon(submission.langchain_status)}
                  {submission.langchain_status.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {submission.submitter_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(submission.created_at), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  to={`/submissions/${submission.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}