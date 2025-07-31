import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Search, 
  Download, 
  Eye, 
  Copy, 
  Edit, 
  Trash2,
  FileText,
  Mail,
  Share2,
  DollarSign,
  Newspaper,
  BookOpen,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

interface ContentItem {
  id: string
  title: string
  type: string
  client: string
  product: string
  keywords: string[]
  wordCount: number
  status: 'draft' | 'approved' | 'published'
  createdAt: string
  updatedAt: string
  author: string
  complianceStatus: 'pending' | 'approved' | 'rejected'
}


export default function ContentLibrary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // In real app, fetch from database
  const { data: contentItems = [] } = useQuery({
    queryKey: ['content-library'],
    queryFn: async () => {
      // TODO: Fetch from database
      return []
    }
  })

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      'landing_page': <FileText className="h-4 w-4" />,
      'email_campaign': <Mail className="h-4 w-4" />,
      'social_media_post': <Share2 className="h-4 w-4" />,
      'paid_ad_copy': <DollarSign className="h-4 w-4" />,
      'newsletter_article': <Newspaper className="h-4 w-4" />,
      'blog_post': <BookOpen className="h-4 w-4" />
    }
    return icons[type] || <FileText className="h-4 w-4" />
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      'draft': 'bg-gray-100 text-gray-700',
      'approved': 'bg-green-100 text-green-700',
      'published': 'bg-blue-100 text-blue-700'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'
      }`}>
        {status}
      </span>
    )
  }

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-amber-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Content Library</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and access all generated content pieces
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export Selected
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="landing_page">Landing Pages</option>
            <option value="email_campaign">Email Campaigns</option>
            <option value="social_media_post">Social Media</option>
            <option value="paid_ad_copy">Paid Ads</option>
            <option value="newsletter_article">Newsletters</option>
            <option value="blog_post">Blog Posts</option>
          </select>
          
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredContent.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.client} • {item.product}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedItems)
                    if (e.target.checked) {
                      newSelected.add(item.id)
                    } else {
                      newSelected.delete(item.id)
                    }
                    setSelectedItems(newSelected)
                  }}
                  className="mt-1"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    {getComplianceIcon(item.complianceStatus)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Word Count</span>
                  <span className="font-medium">{item.wordCount}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Author</span>
                  <span className="font-medium">{item.author}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Updated</span>
                  <span className="font-medium">{new Date(item.updatedAt).toLocaleDateString()}</span>
                </div>
                
                {item.keywords.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Keywords</p>
                    <div className="flex flex-wrap gap-1">
                      {item.keywords.slice(0, 3).map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {keyword}
                        </span>
                      ))}
                      {item.keywords.length > 3 && (
                        <span className="text-xs text-gray-500">+{item.keywords.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    title="View content"
                  >
                    <Eye className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Copy content"
                  >
                    <Copy className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Edit content"
                  >
                    <Edit className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Delete content"
                  >
                    <Trash2 className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredContent.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No content found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
