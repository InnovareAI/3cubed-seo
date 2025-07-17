import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { supabase, type Submission } from '@/lib/supabase'
import { ExternalLink } from 'lucide-react'

export default function RecentSubmissionsTable() {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['recent-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (error) throw error
      return data as Submission[]
    }
  })

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'needs_processing': 'bg-gray-100 text-gray-700',
      'processing': 'bg-blue-100 text-blue-700',
      'approved': 'bg-green-100 text-green-700',
      'rejected': 'bg-red-100 text-red-700',
      'complete': 'bg-green-100 text-green-700'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-700'
      }`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="px-6 py-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
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
              Stage
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">View</span>
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
                {getStatusBadge(submission.langchain_status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(submission.created_at), 'MMM d, h:mm a')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  to={`/submissions/${submission.id}`}
                  className="text-primary-600 hover:text-primary-900 inline-flex items-center gap-1"
                >
                  View
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {(!submissions || submissions.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          No submissions yet
        </div>
      )}
    </div>
  )
}
