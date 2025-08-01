import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { supabase, type ContentPiece, type ContentStatus } from '../lib/mockData'
import { Clock, CheckCircle, AlertCircle, FileText, Search, Users, Shield } from 'lucide-react'

export default function ProcessingQueue() {
  const { data: contentPieces, isLoading } = useQuery({
    queryKey: ['processing-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_pieces')
        .select(`
          *,
          project:projects(name, client_name),
          assigned_user:users!assigned_to(email)
        `)
        .order('updated_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      return data as ContentPiece[]
    }
  })

  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100'
      case 'pending_seo_review': return 'text-blue-600 bg-blue-100'
      case 'pending_client_review': return 'text-yellow-600 bg-yellow-100'
      case 'pending_mlr_review': return 'text-purple-600 bg-purple-100'
      case 'requires_revision': return 'text-red-600 bg-red-100'
      case 'approved': return 'text-green-600 bg-green-100'
      case 'published': return 'text-green-800 bg-green-200'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: ContentStatus) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />
      case 'pending_seo_review':
        return <Search className="w-4 h-4" />
      case 'pending_client_review':
        return <Users className="w-4 h-4" />
      case 'pending_mlr_review':
        return <Shield className="w-4 h-4" />
      case 'requires_revision':
        return <AlertCircle className="w-4 h-4" />
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'published':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusLabel = (status: ContentStatus) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'pending_seo_review': return 'SEO Review'
      case 'pending_client_review': return 'Client Review'
      case 'pending_mlr_review': return 'MLR Review'
      case 'requires_revision': return 'Needs Revision'
      case 'approved': return 'Approved'
      case 'published': return 'Published'
      default: return status
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded"></div>
        ))}
      </div>
    )
  }

  if (!contentPieces || contentPieces.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent content activity
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {contentPieces.map((content) => (
        <div key={content.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 line-clamp-1">
                {content.title}
              </h4>
              <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                <span>{content.project?.name}</span>
                <span>•</span>
                <span>{content.target_keyword}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                  {getStatusIcon(content.status)}
                  {getStatusLabel(content.status)}
                </span>
                <span className="text-xs text-gray-500">
                  Updated {format(new Date(content.updated_at), 'MMM d, h:mm a')}
                </span>
              </div>
            </div>
            <Link
              to={`/content/${content.id}`}
              className="ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
