import { useQuery } from '@tanstack/react-query'
import { FileText, Clock, TrendingUp, AlertCircle, Search, Users, Shield } from 'lucide-react'
import MetricCard from '@/components/MetricCard'
import StatusDistributionChart from '@/components/StatusDistributionChart'
import ProcessingQueue from '@/components/ProcessingQueue'
import { useContentPieces } from '@/hooks/useContentPieces'
import { ContentStatus } from '@/lib/supabase'

export default function Overview() {
  // Fetch content pieces
  const { data: contentPieces, isLoading } = useContentPieces()
  
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
        <p className="text-gray-600 mt-2">Three-stage approval workflow for pharmaceutical content</p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Content"
          value={stats?.totalContent || 0}
          icon={<FileText className="h-6 w-6" />}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <MetricCard
          title="In Review"
          value={stats?.inReview || 0}
          icon={<Clock className="h-6 w-6" />}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
        />
        <MetricCard
          title="Needs Revision"
          value={stats?.needsRevision || 0}
          icon={<AlertCircle className="h-6 w-6" />}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
        />
        <MetricCard
          title="Completion Rate"
          value={`${stats?.completionRate || 0}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
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
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Content Status Distribution</h2>
          <StatusDistributionChart data={stats?.statusCounts || {}} />
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
