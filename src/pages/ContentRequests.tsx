import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  MoreVertical
} from 'lucide-react'
import { format } from 'date-fns'

type RequestStatus = 'in-review' | 'draft' | 'compliance-review' | 'approved' | 'rejected'
type Priority = 'high' | 'medium' | 'low'
type ContentType = 'product-page' | 'blog-article' | 'white-paper' | 'email-campaign' | 'landing-page'

interface ContentRequest {
  id: string
  product: string
  company: string
  type: ContentType
  status: RequestStatus
  priority: Priority
  requestedBy: string
  created: Date
  progress: number
  dueDate?: Date
  description?: string
}

const mockRequests: ContentRequest[] = [
  {
    id: 'REQ-001',
    product: 'PD-1 Inhibitor (Phase III)',
    company: 'Oncology',
    type: 'product-page',
    status: 'in-review',
    priority: 'high',
    requestedBy: 'Sarah Johnson',
    created: new Date('2025-01-10'),
    progress: 85
  },
  {
    id: 'REQ-002',
    product: 'DPP-4 Inhibitor (Pre-Launch)',
    company: 'Diabetes',
    type: 'blog-article',
    status: 'draft',
    priority: 'medium',
    requestedBy: 'Michael Chen',
    created: new Date('2025-01-12'),
    progress: 30
  },
  {
    id: 'REQ-003',
    product: 'Biosimilar Candidate (Phase II)',
    company: 'Rheumatology',
    type: 'white-paper',
    status: 'compliance-review',
    priority: 'high',
    requestedBy: 'Emily Rodriguez',
    created: new Date('2025-01-08'),
    progress: 85
  },
  {
    id: 'REQ-004',
    product: 'KEYTRUDA® (Post-Launch)',
    company: 'Oncology',
    type: 'email-campaign',
    status: 'approved',
    priority: 'high',
    requestedBy: 'James Wilson',
    created: new Date('2025-01-05'),
    progress: 100
  }
]

const getStatusBadgeClass = (status: RequestStatus) => {
  switch (status) {
    case 'in-review':
      return 'bg-yellow-100 text-yellow-800'
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'compliance-review':
      return 'bg-purple-100 text-purple-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
  }
}

const getStatusIcon = (status: RequestStatus) => {
  switch (status) {
    case 'in-review':
      return <Clock className="h-3 w-3" />
    case 'draft':
      return <Edit2 className="h-3 w-3" />
    case 'compliance-review':
      return <AlertCircle className="h-3 w-3" />
    case 'approved':
      return <CheckCircle className="h-3 w-3" />
    case 'rejected':
      return <XCircle className="h-3 w-3" />
  }
}

const getPriorityBadgeClass = (priority: Priority) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
  }
}

const getContentTypeLabel = (type: ContentType) => {
  switch (type) {
    case 'product-page':
      return 'Clinical Trial Recruitment'
    case 'blog-article':
      return 'Disease State Education'
    case 'white-paper':
      return 'Scientific Publication'
    case 'email-campaign':
      return 'Branded HCP Campaign'
    case 'landing-page':
      return 'Patient Landing Page'
  }
}

export default function ContentRequests() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')

  const { data: requests = mockRequests } = useQuery({
    queryKey: ['content-requests'],
    queryFn: async () => mockRequests
  })

  const filteredRequests = requests.filter(request => {
    if (searchTerm && !request.product.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !request.company.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (statusFilter !== 'all' && request.status !== statusFilter) {
      return false
    }
    if (priorityFilter !== 'all' && request.priority !== priorityFilter) {
      return false
    }
    return true
  })

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Content Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all SEO content requests
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'all')}
              className="border border-gray-300 rounded-md text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="in-review">In Review</option>
              <option value="draft">Draft</option>
              <option value="compliance-review">Compliance Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
              className="border border-gray-300 rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Requests Table */}
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
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requested By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {request.id}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{request.product}</div>
                    <div className="text-sm text-gray-500">{request.company}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{getContentTypeLabel(request.type)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
                    {getStatusIcon(request.status)}
                    {request.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(request.priority)}`}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
                      {request.requestedBy.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm text-gray-900">{request.requestedBy}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(request.created, 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${
                          request.progress >= 80 ? 'bg-green-600' :
                          request.progress >= 50 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${request.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {request.progress}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border border-gray-200 sm:px-6 rounded-lg mt-4">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredRequests.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
