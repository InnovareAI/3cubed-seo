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
  MoreVertical,
  Sparkles,
  Zap,
  Star,
  Heart,
  TrendingUp
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

const getStatusColor = (status: RequestStatus) => {
  switch (status) {
    case 'in-review':
      return 'bg-gradient-to-r from-yellow-400 to-amber-400 text-white shadow-lg shadow-yellow-200'
    case 'draft':
      return 'bg-gradient-to-r from-gray-400 to-slate-400 text-white shadow-lg shadow-gray-200'
    case 'compliance-review':
      return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-200'
    case 'approved':
      return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200'
    case 'rejected':
      return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-200'
  }
}

const getStatusIcon = (status: RequestStatus) => {
  switch (status) {
    case 'in-review':
      return <Clock className="h-4 w-4" />
    case 'draft':
      return <Edit2 className="h-4 w-4" />
    case 'compliance-review':
      return <AlertCircle className="h-4 w-4" />
    case 'approved':
      return <CheckCircle className="h-4 w-4" />
    case 'rejected':
      return <XCircle className="h-4 w-4" />
  }
}

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50 px-2 py-1 rounded-lg font-bold'
    case 'medium':
      return 'text-amber-600 bg-amber-50 px-2 py-1 rounded-lg font-bold'
    case 'low':
      return 'text-green-600 bg-green-50 px-2 py-1 rounded-lg font-bold'
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

const typeGradients: Record<ContentType, string> = {
  'product-page': 'from-blue-500 to-cyan-500',
  'blog-article': 'from-green-500 to-teal-500',
  'white-paper': 'from-purple-500 to-pink-500',
  'email-campaign': 'from-orange-500 to-red-500',
  'landing-page': 'from-indigo-500 to-purple-500'
}

export default function ContentRequests() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')

  const { data: requests = mockRequests } = useQuery({
    queryKey: ['content-requests'],
    queryFn: async () => {
      return mockRequests
    }
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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              Open Requests
              <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
            </h1>
            <p className="text-teal-100">
              Manage and track all SEO content requests
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 rounded-full hover:shadow-lg transform hover:scale-105 transition-all shadow-lg">
            <Plus className="h-5 w-5" />
            New Request
            <Zap className="h-4 w-4 text-yellow-300" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border border-purple-200">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border-2 border-purple-300 rounded-lg w-full text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-indigo-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'all')}
              className="border-2 border-indigo-300 rounded-lg text-sm flex-1 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white font-medium"
            >
              <option value="all">🎨 All Status</option>
              <option value="in-review">⏰ In Review</option>
              <option value="draft">✏️ Draft</option>
              <option value="compliance-review">🔍 Compliance Review</option>
              <option value="approved">✅ Approved</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
              className="border-2 border-amber-300 rounded-lg text-sm flex-1 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white font-medium"
            >
              <option value="all">⭐ All Priority</option>
              <option value="high">🔥 High Priority</option>
              <option value="medium">⚡ Medium Priority</option>
              <option value="low">🌱 Low Priority</option>
            </select>
          </div>
          
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all text-sm font-bold shadow-md">
            <Download className="h-5 w-5" />
            Export
            <TrendingUp className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border-2 border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Request ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Requested By
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Progress
              </th>
              <th className="relative px-6 py-4">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request, index) => (
              <tr key={request.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                    {request.id}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{request.product}</div>
                    <div className="text-sm text-purple-600 font-medium">{request.company}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${typeGradients[request.type]} shadow-md`}>
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{getContentTypeLabel(request.type)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(request.status)} transform hover:scale-105 transition-transform`}>
                    {getStatusIcon(request.status)}
                    {request.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm ${getPriorityColor(request.priority)}`}>
                    {request.priority === 'high' && '🔥 '}
                    {request.priority === 'medium' && '⚡ '}
                    {request.priority === 'low' && '🌱 '}
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {request.requestedBy.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{request.requestedBy}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                  {format(request.created, 'yyyy-MM-dd')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 overflow-hidden shadow-inner">
                      <div 
                        className={`h-3 rounded-full transition-all bg-gradient-to-r ${
                          request.progress >= 80 ? 'from-green-500 to-emerald-500' :
                          request.progress >= 50 ? 'from-yellow-500 to-orange-500' :
                          'from-red-500 to-pink-500'
                        } shadow-lg`}
                        style={{ width: `${request.progress}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${
                      request.progress >= 80 ? 'text-green-600' :
                      request.progress >= 50 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {request.progress}%
                      {request.progress === 100 && ' 🎉'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-purple-500 hover:text-purple-700 hover:bg-purple-100 p-2 rounded-lg transition-all">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 flex items-center justify-between border-2 border-purple-200 sm:px-6 rounded-xl shadow-lg">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border-2 border-purple-300 text-sm font-bold rounded-lg text-purple-700 bg-white hover:bg-purple-50">
            Previous
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border-2 border-purple-300 text-sm font-bold rounded-lg text-purple-700 bg-white hover:bg-purple-50">
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 font-medium">
              Showing <span className="font-bold text-purple-600">{filteredRequests.length}</span> amazing results
              <Heart className="inline-block h-4 w-4 text-pink-500 ml-2" />
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-lg shadow-lg -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-3 py-2 rounded-l-lg border-2 border-purple-300 bg-white text-sm font-bold text-purple-600 hover:bg-purple-100">
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border-2 border-purple-300 bg-gradient-to-r from-purple-500 to-pink-500 text-sm font-bold text-white">
                1
              </button>
              <button className="relative inline-flex items-center px-3 py-2 rounded-r-lg border-2 border-purple-300 bg-white text-sm font-bold text-purple-600 hover:bg-purple-100">
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
