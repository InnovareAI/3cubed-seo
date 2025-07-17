import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info,
  Download,
  Filter,
  Search,
  Calendar,
  User,
  Shield,
  Key,
  Database,
  Eye
} from 'lucide-react'
import { format } from 'date-fns'

type ActivityType = 'all' | 'content' | 'approval' | 'compliance' | 'security' | 'system' | 'data'
type DateRange = 'last24h' | 'last7d' | 'last30d' | 'last90d' | 'lastYear' | 'all'
type Status = 'success' | 'warning' | 'error'

interface AuditEntry {
  id: string
  timestamp: Date
  user: string
  action: string
  details: string
  ipAddress: string
  status: Status
  category: ActivityType
  metadata?: {
    objectId?: string
    objectType?: string
    changes?: Record<string, any>
  }
}

const mockAuditData: AuditEntry[] = [
  {
    id: '1',
    timestamp: new Date('2024-01-15 14:32:18'),
    user: 'Sarah Johnson',
    action: 'Content Created',
    details: 'Created new landing page: KEYTRUDA® HCP Information',
    ipAddress: '192.168.1.145',
    status: 'success',
    category: 'content'
  },
  {
    id: '2',
    timestamp: new Date('2024-01-15 13:45:22'),
    user: 'Dr. Michael Chen',
    action: 'MLR Approval',
    details: 'Approved content for publication with minor edits',
    ipAddress: '192.168.1.203',
    status: 'success',
    category: 'approval'
  },
  {
    id: '3',
    timestamp: new Date('2024-01-15 11:22:09'),
    user: 'Emily Rodriguez',
    action: 'Compliance Check',
    details: 'Automated compliance scan completed',
    ipAddress: '192.168.1.167',
    status: 'warning',
    category: 'compliance'
  },
  {
    id: '4',
    timestamp: new Date('2024-01-15 10:15:43'),
    user: 'System',
    action: 'API Key Generated',
    details: 'New API key created for PubMed integration',
    ipAddress: 'System',
    status: 'success',
    category: 'security'
  },
  {
    id: '5',
    timestamp: new Date('2024-01-15 09:30:12'),
    user: 'James Wilson',
    action: 'User Permission Change',
    details: 'Updated user permissions for Marketing Team',
    ipAddress: '192.168.1.112',
    status: 'success',
    category: 'security'
  },
  {
    id: '6',
    timestamp: new Date('2024-01-15 08:45:33'),
    user: 'Dr. Lisa Park',
    action: 'Content Rejection',
    details: 'Rejected blog post due to unsupported claims',
    ipAddress: '192.168.1.189',
    status: 'error',
    category: 'approval'
  },
  {
    id: '7',
    timestamp: new Date('2024-01-14 16:20:45'),
    user: 'System',
    action: 'Backup Completed',
    details: 'Daily backup completed successfully',
    ipAddress: 'System',
    status: 'success',
    category: 'system'
  },
  {
    id: '8',
    timestamp: new Date('2024-01-14 15:18:22'),
    user: 'Robert Martinez',
    action: 'Bulk Export',
    details: 'Exported content library for Q4 2023 review',
    ipAddress: '192.168.1.134',
    status: 'success',
    category: 'data'
  }
]

const getStatusIcon = (status: Status) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />
  }
}

const getCategoryIcon = (category: ActivityType) => {
  switch (category) {
    case 'content':
      return <FileText className="h-4 w-4" />
    case 'approval':
      return <CheckCircle className="h-4 w-4" />
    case 'compliance':
      return <Shield className="h-4 w-4" />
    case 'security':
      return <Key className="h-4 w-4" />
    case 'system':
      return <Database className="h-4 w-4" />
    case 'data':
      return <Download className="h-4 w-4" />
    default:
      return <Info className="h-4 w-4" />
  }
}

export default function AuditTrail() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activityType, setActivityType] = useState<ActivityType>('all')
  const [dateRange, setDateRange] = useState<DateRange>('last7d')
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null)

  // In a real app, this would fetch from the API
  const { data: auditEntries = mockAuditData } = useQuery({
    queryKey: ['audit-trail', activityType, dateRange, searchTerm],
    queryFn: async () => {
      // Simulate API call
      return mockAuditData
    }
  })

  const filteredEntries = auditEntries.filter(entry => {
    if (searchTerm && !entry.details.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !entry.user.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (activityType !== 'all' && entry.category !== activityType) {
      return false
    }
    return true
  })

  const stats = {
    totalActivities: filteredEntries.length,
    successRate: Math.round((filteredEntries.filter(e => e.status === 'success').length / filteredEntries.length) * 100),
    activeUsers: new Set(filteredEntries.map(e => e.user)).size,
    complianceScore: 98.2
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Audit Trail</h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete activity log for compliance and security tracking
        </p>
      </div>

      {/* Compliance Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">21 CFR Part 11 Compliant</h3>
            <p className="mt-1 text-sm text-blue-700">
              All activities are logged with timestamp, user identification, and cannot be modified. 
              Logs are retained for 7 years in accordance with FDA regulations.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Activities</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalActivities}</p>
            </div>
            <Database className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.successRate}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
            </div>
            <User className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Compliance Score</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.complianceScore}%</p>
            </div>
            <Shield className="h-8 w-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value as ActivityType)}
              className="border border-gray-300 rounded-md text-sm flex-1"
            >
              <option value="all">All Activities</option>
              <option value="content">Content Changes</option>
              <option value="approval">Approvals</option>
              <option value="compliance">Compliance</option>
              <option value="security">Security</option>
              <option value="system">System</option>
              <option value="data">Data Operations</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="border border-gray-300 rounded-md text-sm flex-1"
            >
              <option value="last24h">Last 24 Hours</option>
              <option value="last7d">Last 7 Days</option>
              <option value="last30d">Last 30 Days</option>
              <option value="last90d">Last 90 Days</option>
              <option value="lastYear">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(entry.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    {entry.user}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(entry.category)}
                    {entry.action}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {entry.details}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.ipAddress}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(entry.status)}
                    <span className={`text-sm ${
                      entry.status === 'success' ? 'text-green-600' :
                      entry.status === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {entry.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedEntry(entry)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Activity Details</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Timestamp</p>
                <p className="mt-1 text-sm text-gray-900">
                  {format(selectedEntry.timestamp, 'EEEE, MMMM d, yyyy HH:mm:ss')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">User</p>
                <p className="mt-1 text-sm text-gray-900">{selectedEntry.user}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Action</p>
                <p className="mt-1 text-sm text-gray-900">{selectedEntry.action}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Details</p>
                <p className="mt-1 text-sm text-gray-900">{selectedEntry.details}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">IP Address</p>
                <p className="mt-1 text-sm text-gray-900">{selectedEntry.ipAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="mt-1 flex items-center gap-2">
                  {getStatusIcon(selectedEntry.status)}
                  <span className="text-sm text-gray-900">{selectedEntry.status}</span>
                </div>
              </div>
              {selectedEntry.metadata && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Additional Metadata</p>
                  <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md overflow-x-auto">
                    {JSON.stringify(selectedEntry.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
