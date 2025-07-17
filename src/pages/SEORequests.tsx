import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Search, Filter, ChevronRight, AlertCircle, CheckCircle, Clock, XCircle, Plus } from 'lucide-react'
import { format } from 'date-fns'
import type { Submission } from '../lib/supabase'

export default function SEORequests() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['seo-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('workflow_stage', 'SEO_Review')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Submission[]
    }
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'needs_review':
        return <Clock className="h-4 w-4" />
      case 'seo_approved':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'needs_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'seo_approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredSubmissions = submissions?.filter(submission => {
    const matchesSearch = searchTerm === '' || 
      submission.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.compliance_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || submission.langchain_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">SEO Review Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Content pending SEO review and optimization
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product or compliance ID..."
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="needs_review">Needs Review</option>
              <option value="seo_approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compliance ID
              </th>
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
                Date
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubmissions?.map((submission) => (
              <tr 
                key={submission.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/submissions/${submission.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {submission.compliance_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {submission.product_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {submission.therapeutic_area}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {submission.stage}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(submission.langchain_status)}`}>
                    {getStatusIcon(submission.langchain_status)}
                    {submission.langchain_status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {submission.submitter_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {submission.submitter_email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(submission.created_at), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredSubmissions?.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No SEO requests found</p>
        </div>
      )}
    </div>
  )
}