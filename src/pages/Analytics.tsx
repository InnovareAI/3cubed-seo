import { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Activity,
  MousePointer,
  BarChart3,
  LineChart,
  PieChart,
  Calendar
} from 'lucide-react'

type DateRange = 'last7' | 'last30' | 'last90' | 'last365' | 'custom'

interface MetricCardProps {
  title: string
  value: string
  change: number
  changeLabel: string
  icon: React.ReactNode
}

function MetricCard({ title, value, change, changeLabel, icon }: MetricCardProps) {
  const isPositive = change >= 0

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          <div className="mt-2 flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-gray-500">{changeLabel}</span>
          </div>
        </div>
        <div className="ml-4">
          <div className="p-3 bg-primary-50 rounded-lg">
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>('last30')

  const metrics = [
    {
      title: 'Total Visitors',
      value: '124,532',
      change: 12.3,
      changeLabel: 'vs last period',
      icon: <Users className="h-6 w-6 text-primary-600" />
    },
    {
      title: 'Unique Visitors',
      value: '89,421',
      change: 8.7,
      changeLabel: 'vs last period',
      icon: <Activity className="h-6 w-6 text-primary-600" />
    },
    {
      title: 'Avg. Session Duration',
      value: '3m 42s',
      change: 22.1,
      changeLabel: 'vs last period',
      icon: <Clock className="h-6 w-6 text-primary-600" />
    },
    {
      title: 'Bounce Rate',
      value: '42.3%',
      change: -5.2,
      changeLabel: 'vs last period',
      icon: <MousePointer className="h-6 w-6 text-primary-600" />
    },
    {
      title: 'Pages per Session',
      value: '4.8',
      change: 0.6,
      changeLabel: 'vs last period',
      icon: <BarChart3 className="h-6 w-6 text-primary-600" />
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: 0.4,
      changeLabel: 'vs last period',
      icon: <TrendingUp className="h-6 w-6 text-primary-600" />
    }
  ]

  const dateRangeOptions = [
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'last90', label: 'Last 90 Days' },
    { value: 'last365', label: 'Last 12 Months' },
    { value: 'custom', label: 'Custom Range' },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'performance', label: 'Content Performance', icon: <LineChart className="h-4 w-4" /> },
    { id: 'seo', label: 'SEO Metrics', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'competitor', label: 'Competitor Analysis', icon: <PieChart className="h-4 w-4" /> },
  ]

  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor content performance, traffic metrics, and conversion data
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="rounded-md border-gray-300 text-sm font-medium text-gray-700"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Export Report
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Overview</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <LineChart className="h-12 w-12" />
            <span className="ml-2">Traffic chart visualization</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Content</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">KEYTRUDA® Landing Page</p>
                <p className="text-sm text-gray-500">12,453 views</p>
              </div>
              <span className="text-sm font-medium text-green-600">+15.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Oncology Treatment Guide</p>
                <p className="text-sm text-gray-500">8,921 views</p>
              </div>
              <span className="text-sm font-medium text-green-600">+8.7%</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Patient Resources Hub</p>
                <p className="text-sm text-gray-500">6,234 views</p>
              </div>
              <span className="text-sm font-medium text-red-600">-2.3%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics Sections */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Page Views</span>
              <span className="text-sm text-gray-500">124,532 (100%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8">
              <div className="bg-primary-600 h-8 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Engaged Sessions</span>
              <span className="text-sm text-gray-500">72,149 (58%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8">
              <div className="bg-primary-600 h-8 rounded-full" style={{ width: '58%' }}></div>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Form Submissions</span>
              <span className="text-sm text-gray-500">3,985 (3.2%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8">
              <div className="bg-primary-600 h-8 rounded-full" style={{ width: '3.2%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
