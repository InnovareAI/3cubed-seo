import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, ContentPiece } from '@/lib/supabase'
import { Search, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react'
import { format } from 'date-fns'

export default function SEOReview() {
  const [selectedContent, setSelectedContent] = useState<ContentPiece | null>(null)
  const [revisionNotes, setRevisionNotes] = useState('')
  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const queryClient = useQueryClient()

  // Fetch content pending SEO review
  const { data: contentPieces, isLoading } = useQuery({
    queryKey: ['seo-review-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_pieces')
        .select(`
          *,
          project:projects(name, client_name, therapeutic_area),
          assigned_user:users!content_pieces_assigned_to_fkey(email, full_name)
        `)
        .eq('status', 'pending_seo_review')
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Fetched content:', data)
      return data as ContentPiece[]
    }
  })

  // Update content status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ 
      contentId, 
      newStatus, 
      notes 
    }: { 
      contentId: string
      newStatus: 'pending_client_review' | 'requires_revision'
      notes?: string 
    }) => {
      // Use the database function for status transition
      const { data, error } = await supabase.rpc('transition_content_status', {
        p_content_id: contentId,
        p_new_status: newStatus,
        p_user_id: '11111111-1111-1111-1111-111111111111', // TODO: Get from auth
        p_notes: notes || null
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-review-content'] })
      queryClient.invalidateQueries({ queryKey: ['processing-queue'] })
      setSelectedContent(null)
      setRevisionNotes('')
      setShowRevisionModal(false)
      // Simple success feedback
      alert('Content status updated successfully')
    },
    onError: (error) => {
      alert('Failed to update status: ' + error.message)
    }
  })

  const handleApprove = (content: ContentPiece) => {
    updateStatus.mutate({
      contentId: content.id,
      newStatus: 'pending_client_review'
    })
  }

  const handleRequestRevision = () => {
    if (!selectedContent || !revisionNotes.trim()) {
      alert('Please provide revision notes')
      return
    }

    updateStatus.mutate({
      contentId: selectedContent.id,
      newStatus: 'requires_revision',
      notes: revisionNotes
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SEO Review</h1>
        <p className="text-gray-600 mt-2">Review and approve content for SEO optimization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Pending Review ({contentPieces?.length || 0})</h2>
          
          {!contentPieces || contentPieces.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
              <Search className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No content pending SEO review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contentPieces.map((content) => (
                <div
                  key={content.id}
                  onClick={() => setSelectedContent(content)}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    selectedContent?.id === content.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <h3 className="font-medium text-gray-900 line-clamp-1">{content.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{content.project?.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {format(new Date(content.created_at), 'MMM d, yyyy')}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{content.target_keyword}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="lg:col-span-2">
          {selectedContent ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-semibold text-gray-900">{selectedContent.title}</h2>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Project:</span>
                    <p className="font-medium">{selectedContent.project?.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Client:</span>
                    <p className="font-medium">{selectedContent.project?.client_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Therapeutic Area:</span>
                    <p className="font-medium">{selectedContent.project?.therapeutic_area}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Target Keyword:</span>
                    <p className="font-medium">{selectedContent.target_keyword}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">SEO Analysis</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Strategy</h4>
                  <p className="text-gray-700">{selectedContent.content.seo_analysis.strategy}</p>
                  
                  <h4 className="font-medium text-gray-900 mt-4 mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedContent.content.seo_analysis.keywords.map((keyword, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>

                  <h4 className="font-medium text-gray-900 mt-4 mb-2">Content Recommendations</h4>
                  <p className="text-gray-700">{selectedContent.content.seo_analysis.content_recommendations}</p>
                </div>

                <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedContent.content.compliance_report.status === 'compliant' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className="font-medium capitalize">
                      {selectedContent.content.compliance_report.status}
                    </span>
                  </div>
                  {selectedContent.content.compliance_report.flags.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Flags:</p>
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {selectedContent.content.compliance_report.flags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(selectedContent)}
                    disabled={updateStatus.isPending}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Approve for Client Review
                  </button>
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    disabled={updateStatus.isPending}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-5 w-5" />
                    Request Revision
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">Select content to review</p>
            </div>
          )}
        </div>
      </div>

      {/* Revision Modal */}
      {showRevisionModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Request Revision</h3>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Provide detailed feedback for revision..."
              className="w-full h-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleRequestRevision}
                disabled={updateStatus.isPending || !revisionNotes.trim()}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Revision Request
              </button>
              <button
                onClick={() => {
                  setShowRevisionModal(false)
                  setRevisionNotes('')
                }}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
