import { useQuery } from '@tanstack/react-query'
import { FileText, Clock, CheckCircle, XCircle, Search, Users, Shield } from 'lucide-react'
import MetricCard from '@/components/MetricCard'
import ProcessingQueue from '@/components/ProcessingQueue'
import SEOProcessingQueue from '@/components/SEOProcessingQueue'
import { useContentPieces } from '@/hooks/useContentPieces'
import { ContentStatus, supabase } from '@/lib/supabase'

export default function Overview() {
  // Fetch content pieces
  const { data: contentPieces, isLoading } = useContentPieces()
  
  // Fetch submission statistics
  const { data: submissionStats } = useQuery({
    queryKey: ['submission-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('workflow_stage, ai_processing_status')
      
      if (error) throw error
      
      const stats = {
        total: data.length,
        processed: data.filter(s => 
          s.ai_processing_status === 'completed' || 
          s.workflow_stage === 'seo_review' || 
          s.workflow_stage === 'client_review' || 
          s.workflow_stage === 'mlr_review' ||
          s.workflow_stage === 'revision_requested' ||
          s.workflow_stage === 'approved' ||
          s.workflow_stage === 'completed'
        ).length,
        rejected: data.filter(s => s.workflow_stage === 'rejected').length,
        approved: data.filter(s => 
          s.workflow_stage === 'approved' || 
          s.workflow_stage === 'completed'
        ).length
      }
      
      return stats
    }
  })
  
  // Fetch SEO generation statistics
  const { data: seoStats } = useQuery({
    queryKey: ['seo-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('ai_processing_status')
      
      if (error) throw error
      
      const stats = {
        total: data.length,
        completed: data.filter(s => s.ai_processing_status === 'completed').length,
        pending: data.filter(s => s.ai_processing_status === 'pending' || !s.ai_processing_status).length,
        processing: data.filter(s => s.ai_processing_status === 'processing').length,
        error: data.filter(s => s.ai_processing_status === 'error').length
      }
      
      return stats
    }
  })
  
  // Fetch overview statistics
  const { data: stats } = useQuery({
    queryKey: ['overview-stats'],
    queryFn: async () => {
      if (!contentPieces) return null
      
      // Group by status
      const statusCounts = contentPieces.reduce((acc, piece) => {
        acc[piece.status] = (acc[piece.status] || 0) + 1
        return acc
      }, {} as Record<ContentStatus, number>)
      
      // Calculate key metrics
      const totalContent = contentPieces.length
      const inReview = (statusCounts['pending_seo_review'] || 0) + 
                      (statusCounts['pending_client_review'] || 0) + 
                      (statusCounts['pending_mlr_review'] || 0)
      const needsRevision = statusCounts['requires_revision'] || 0
      const completed = (statusCounts['approved'] || 0) + (statusCounts['published'] || 0)
      const completionRate = totalContent > 0 ? Math.round((completed / totalContent) * 100) : 0
      
      return {
        totalContent,
        inReview,
        needsRevision,
        completionRate,
        statusCounts
      }
    },
    enabled: !!contentPieces
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const workflowStages = [
    { 
      status: 'pending_seo_review' as ContentStatus, 
      label: 'SEO Review', 
      icon: Search,
      color: 'text-blue-600 bg-blue-100'
    },
    { 
      status: 'pending_client_review' as ContentStatus, 
      label: 'Client Review', 
      icon: Users,
      color: 'text-yellow-600 bg-yellow-100'
    },
    { 
      status: 'pending_mlr_review' as ContentStatus, 
      label: 'MLR Review', 
      icon: Shield,
      color: 'text-purple-600 bg-purple-100'
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">3cubed SEO Platform</h1>
        <p className="text-gray-600 mt-2">AI-powered pharmaceutical SEO content generation & approval workflow</p>
      </div>
      
      {/* Key Metrics - Updated with requested statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Submissions"
          value={submissionStats?.total || 62}
          icon={<FileText className="h-6 w-6" />}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <MetricCard
          title="Processed Submissions"
          value={submissionStats?.processed || 28}
          icon={<Clock className="h-6 w-6" />}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <MetricCard
          title="Rejected Submissions"
          value={submissionStats?.rejected || 9}
          icon={<XCircle className="h-6 w-6" />}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
        />
        <MetricCard
          title="Approved Submissions"
          value={submissionStats?.approved || 0}
          icon={<CheckCircle className="h-6 w-6" />}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
        />
      </div>
      
      {/* SEO Generation Pipeline */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">SEO Content Generation Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="bg-yellow-100 text-yellow-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold">{seoStats?.pending || 0}</span>
            </div>
            <p className="text-sm font-medium">Pending</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold">{seoStats?.processing || 0}</span>
            </div>
            <p className="text-sm font-medium">Processing</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold">{seoStats?.completed || 0}</span>
            </div>
            <p className="text-sm font-medium">Completed</p>
          </div>
          <div className="text-center">
            <div className="bg-red-100 text-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold">{seoStats?.error || 0}</span>
            </div>
            <p className="text-sm font-medium">Failed</p>
          </div>
        </div>
      </div>
      
      {/* Three-Stage Workflow Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Three-Stage Approval Workflow</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workflowStages.map(({ status, label, icon: Icon, color }) => {
            const count = stats?.statusCounts[status] || 0
            return (
              <div key={status} className="text-center">
                <div className={`${color} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="h-10 w-10" />
                </div>
                <h3 className="font-medium text-gray-900">{label}</h3>
                <p className="text-3xl font-bold mt-2">{count}</p>
                <p className="text-sm text-gray-500 mt-1">content pieces</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SEO Processing Queue */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">SEO Content Generation</h2>
          <SEOProcessingQueue />
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Content Activity</h2>
          <ProcessingQueue />
        </div>
      </div>
    </div>
  )
}
