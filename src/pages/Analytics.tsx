import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { TrendingUp, TrendingDown, Users, FileText, CheckCircle, Clock } from 'lucide-react'

const performanceData = [
  { month: 'Jan', submissions: 45, approved: 41, rejected: 4 },
  { month: 'Feb', submissions: 52, approved: 48, rejected: 4 },
  { month: 'Mar', submissions: 61, approved: 57, rejected: 4 },
  { month: 'Apr', submissions: 58, approved: 53, rejected: 5 },
  { month: 'May', submissions: 67, approved: 64, rejected: 3 },
  { month: 'Jun', submissions: 72, approved: 69, rejected: 3 },
]

const contentTypeData = [
  { name: 'Product Pages', value: 35, color: '#3B82F6' },
  { name: 'Blog Articles', value: 25, color: '#10B981' },
  { name: 'White Papers', value: 20, color: '#F59E0B' },
  { name: 'Email Campaigns', value: 15, color: '#EF4444' },
  { name: 'Landing Pages', value: 5, color: '#8B5CF6' },
]

const clientPerformance = [
  { client: 'Pharma Corp', score: 92 },
  { client: 'BioTech Inc', score: 88 },
  { client: 'MedTech Solutions', score: 85 },
  { client: 'Global Pharma', score: 90 },
  { client: 'Innovative Bio', score: 87 },
]

export default function Analytics() {
  const { data: stats } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: async () => ({
      totalSubmissions: 345,
      totalApproved: 318,
      avgApprovalRate: 92.2,
      avgTimeToApproval: 3.5,
      monthlyGrowth: 12.5,
      activeClients: 24
    })
  })

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track performance metrics and content production insights
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalSubmissions}</p>
              <p className="mt-1 text-sm text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{stats?.monthlyGrowth}% from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.avgApprovalRate}%</p>
              <p className="mt-1 text-sm text-gray-500">
                Last 30 days
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Time to Approval</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.avgTimeToApproval} days</p>
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <TrendingDown className="h-4 w-4 mr-1" />
                -0.5 days improvement
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.activeClients}</p>
              <p className="mt-1 text-sm text-gray-500">
                Currently active
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        {/* Submission Trends */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Submission Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="submissions" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
                name="Total Submissions"
              />
              <Line 
                type="monotone" 
                dataKey="approved" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981' }}
                name="Approved"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Content Type Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Type Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={contentTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {contentTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {contentTypeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Performance Score</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={clientPerformance} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" domain={[0, 100]} stroke="#6B7280" />
            <YAxis dataKey="client" type="category" stroke="#6B7280" width={120} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '6px'
              }}
            />
            <Bar dataKey="score" fill="#3B82F6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
