import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Search, Filter, ChevronRight, AlertCircle, CheckCircle, Clock, XCircle, Plus } from 'lucide-react'
import { format } from 'date-fns'
import type { Submission } from '../lib/supabase'

// Mock data for development
const mockSubmissions: Submission[] = [
  {
    id: '1',
    compliance_id: 'CMP-2025-001',
    email_thread_id: 'ETH-001',
    product_identifier: 'KEYTRUDA (pembrolizumab)',
    medical_indication: 'Advanced melanoma',
    therapeutic_area: 'Oncology',
    stage_new: 'Phase III',
    target_audience: 'Healthcare Professionals',
    geography_new: ['United States', 'Canada'],
    key_differentiators: 'First-line treatment option',
    competitor_products: 'Opdivo, Yervoy',
    your_name: 'Dr. Sarah Johnson',
    your_email: 'sarah.johnson@pharma.com',
    approver_seo: 'Michael Chen',
    langchain_status: 'needs_review',
    langchain_phase: 'AI Processing Complete',
    langchain_retry_count: 0,
    qa_status: 'pending',
    fda_compliance_status: 'pending',
    ai_output: {},
    raw_input_content: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    compliance_id: 'CMP-2025-002',
    email_thread_id: 'ETH-002',
    product_identifier: 'OZEMPIC (semaglutide)',
    medical_indication: 'Type 2 diabetes',
    therapeutic_area: 'Endocrinology',
    stage_new: 'Post-Launch',
    target_audience: 'Patients',
    geography_new: ['United States'],
    key_differentiators: 'Once-weekly dosing',
    competitor_products: 'Trulicity, Victoza',
    your_name: 'Dr. James Wilson',
    your_email: 'james.wilson@biotech.com',
    approver_seo: 'Emily Rodriguez',
    langchain_status: 'approved',
    langchain_phase: 'Complete',
    langchain_retry_count: 0,
    qa_status: 'approved',
    fda_compliance_status: 'approved',
    ai_output: {},
    raw_input_content: '',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'needs_review':
      return <Clock className="h-4 w-4" />
    case 'approved':
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
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function SEORequests() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error fetching submissions:', error)
          return mockSubmissions
        }
        
        return data || mockSubmissions
      } catch (err) {
        console.error('Error in submissions query:', err)
        return mockSubmissions
      }
    }
  })

  const filteredSubmissions = submissions?.filter(submission => {
    const matchesSearch = searchTerm === '' || 
      submission.product_identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">SEO Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage SEO content generation requests
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {/* Filters */}
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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Therapeutic Area
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target Audience
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requestor
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
                onClick={() => navigate(`/seo-requests/${submission.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {submission.compliance_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {submission.product_identifier}
                    </div>
                    <div className="text-sm text-gray-500">
                      {submission.medical_indication}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {submission.therapeutic_area}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {submission.target_audience}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(submission.langchain_status)}`}>
                    {getStatusIcon(submission.langchain_status)}
                    {submission.langchain_status.replace('_', ' ').charAt(0).toUpperCase() + submission.langchain_status.slice(1).replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {submission.your_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {submission.your_email}
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