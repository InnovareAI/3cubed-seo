import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, XCircle, Clock, AlertCircle, Search, Filter, Eye, FileText, ThumbsUp, ThumbsDown } from 'lucide-react'
import { format } from 'date-fns'

interface SEOReviewItem {
  id: string
  submissionId: string
  productName: string
  contentType: string
  keywords: string[]
  metaDescription: string
  contentPreview: string
  seoScore: number
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested'
  reviewer?: string
  reviewDate?: Date
  comments?: string
}

const mockReviewItems: SEOReviewItem[] = [
  {
    id: '1',
    submissionId: 'SUB-001',
    productName: 'KEYTRUDA (pembrolizumab)',
    contentType: 'Product Page',
    keywords: ['pembrolizumab', 'PD-1 inhibitor', 'melanoma treatment', 'immunotherapy'],
    metaDescription: 'Learn about KEYTRUDA (pembrolizumab), a PD-1 inhibitor for advanced melanoma treatment. Discover efficacy data, dosing information, and safety profile.',
    contentPreview: 'KEYTRUDA is a prescription medicine used to treat a kind of skin cancer called melanoma...',
    seoScore: 92,
    status: 'pending'
  },
  {
    id: '2',
    submissionId: 'SUB-002',
    productName: 'OZEMPIC (semaglutide)',
    contentType: 'Blog Article',
    keywords: ['semaglutide', 'type 2 diabetes', 'GLP-1 agonist', 'weight management'],
    metaDescription: 'Discover how OZEMPIC (semaglutide) helps manage type 2 diabetes with once-weekly dosing. Learn about benefits, side effects, and patient experiences.',
    contentPreview: 'Managing type 2 diabetes requires a comprehensive approach that includes lifestyle modifications...',
    seoScore: 88,
    status: 'approved',
    reviewer: 'Dr. Emily Chen',
    reviewDate: new Date(Date.now() - 3600000),
    comments: 'Excellent keyword integration and meta description. Content is compliant and informative.'
  },
  {
    id: '3',
    submissionId: 'SUB-003',
    productName: 'Biosimilar Candidate X',
    contentType: 'Landing Page',
    keywords: ['biosimilar', 'rheumatoid arthritis', 'biologic therapy', 'cost-effective treatment'],
    metaDescription: 'Explore our biosimilar treatment option for rheumatoid arthritis. Cost-effective biologic therapy with proven efficacy.',
    contentPreview: 'Introducing a new biosimilar option for patients with rheumatoid arthritis...',
    seoScore: 75,
    status: 'revision_requested',
    reviewer: 'Michael Thompson',
    reviewDate: new Date(Date.now() - 7200000),
    comments: 'Keywords need better integration. Meta description could be more compelling. Please revise.'
  }
]

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'revision_requested':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />
    case 'approved':
      return <CheckCircle className="h-4 w-4" />
    case 'rejected':
      return <XCircle className="h-4 w-4" />
    case 'revision_requested':
      return <AlertCircle className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

const getSEOScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

export default function SEOReview() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<SEOReviewItem | null>(null)

  const { data: reviewItems = mockReviewItems } = useQuery({
    queryKey: ['seo-review-items'],
    queryFn: async () => mockReviewItems
  })

  const filteredItems = reviewItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submissionId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: reviewItems.length,
    pending: reviewItems.filter(i => i.status === 'pending').length,
    approved: reviewItems.filter(i => i.status === 'approved').length,
    needsRevision: reviewItems.filter(i => i.status === 'revision_requested').length
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">SEO Review</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve SEO-optimized content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Needs Revision</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.needsRevision}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product or submission ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="revision_requested">Revision Requested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Review Items Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SEO Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keywords
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviewer
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.submissionId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.productName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.contentType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getSEOScoreColor(item.seoScore)}`}>
                    {item.seoScore}/100
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {item.keywords.slice(0, 2).map((keyword, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {keyword}
                      </span>
                    ))}
                    {item.keywords.length > 2 && (
                      <span className="text-xs text-gray-500">+{item.keywords.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(item.status)}`}>
                    {getStatusIcon(item.status)}
                    {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.reviewer ? (
                    <div>
                      <div className="text-sm text-gray-900">{item.reviewer}</div>
                      {item.reviewDate && (
                        <div className="text-xs text-gray-500">
                          {format(item.reviewDate, 'MMM d, h:mm a')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedItem(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    {item.status === 'pending' && (
                      <>
                        <button className="text-green-600 hover:text-green-900">
                          <ThumbsUp className="h-5 w-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <ThumbsDown className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
