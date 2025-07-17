import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { FileText, CheckCircle, Clock, TrendingUp, AlertCircle, CheckSquare } from 'lucide-react'
import MetricCard from '@/components/MetricCard'
import RecentSubmissionsTable from '@/components/RecentSubmissionsTable'
import StatusDistributionChart from '@/components/StatusDistributionChart'
import ProcessingQueue from '@/components/ProcessingQueue'

export default function Overview() {
  // Fetch overview statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['overview-stats'],
    queryFn: async () => {
      // Get total submissions
      const { count: totalSubmissions } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
      
      // Get submissions by status
      const { data: statusData } = await supabase
        .from('submissions')
        .select('langchain_status')
      
      const statusCounts = statusData?.reduce((acc, item) => {
        acc[item.langchain_status] = (acc[item.langchain_status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}
      
      // Get pending reviews count
      const pendingReviews = statusCounts['needs_review'] || 0
      
      // Calculate approval rate
      const approved = statusCounts['approved'] || 0
      const completed = statusCounts['complete'] || 0
      const total = approved + completed + (statusCounts['rejected'] || 0)
      const approvalRate = total > 0 ? Math.round(((approved + completed) / total) * 100) : 0
      
      // Get average processing time
      const { data: processingData } = await supabase
        .from('submissions')
        .select('processing_time_seconds')
        .not('processing_time_seconds', 'is', null)
      
      const avgProcessingTime = processingData?.length 
        ? Math.round(processingData.reduce((sum, item) => sum + item.processing_time_seconds, 0) / processingData.length / 60)
        : 0
      
      return {
        totalSubmissions: totalSubmissions || 0,
        approvalRate,
        avgProcessingTime,
        activeCampaigns: statusCounts['processing'] || 0,
        pendingReviews,
        statusCounts
      }
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your pharma SEO content production in real-time
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Submissions"
          value={stats?.totalSubmissions || 0}
          change="+12% from last month"
          icon={<FileText className="h-5 w-5" />}
          trend="up"
        />
        
        <MetricCard
          title="Approval Rate"
          value={`${stats?.approvalRate || 0}%`}
          change="+5% from last month"
          icon={<CheckCircle className="h-5 w-5" />}
          trend="up"
        />
        
        <MetricCard
          title="Avg. Processing"
          value={`${stats?.avgProcessingTime || 0} min`}
          change="-15% improvement"
          icon={<Clock className="h-5 w-5" />}
          trend="down"
        />
        
        <MetricCard
          title="In Progress"
          value={stats?.activeCampaigns || 0}
          icon={<TrendingUp className="h-5 w-5" />}
          status={(stats?.activeCampaigns || 0) > 5 ? 'warning' : 'success'}
        />
        
        <MetricCard
          title="Pending Review"
          value={stats?.pendingReviews || 0}
          icon={<CheckSquare className="h-5 w-5" />}
          status={(stats?.pendingReviews || 0) > 0 ? 'warning' : 'success'}
          change={(stats?.pendingReviews || 0) > 0 ? 'Needs attention' : 'All clear'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Submissions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Submissions</h2>
          </div>
          <RecentSubmissionsTable />
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Status Distribution</h2>
          </div>
          <StatusDistributionChart data={stats?.statusCounts} />
        </div>
      </div>

      {/* Processing Queue */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Processing Queue</h2>
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <AlertCircle className="h-4 w-4" />
            Updates every 30 seconds
          </span>
        </div>
        <ProcessingQueue />
      </div>
    </div>
  )
}
