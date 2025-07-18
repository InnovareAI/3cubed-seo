import { useState } from 'react'
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
  Eye,
  RefreshCw
} from 'lucide-react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { useAuditLogs, useAuditLogStats, formatActionName, getActionColor } from '../hooks/useAuditLogs'
import { AuditLogger } from '../lib/auditLogger'

type ActivityType = 'all' | 'submission' | 'auth' | 'user' | 'system' | 'client' | 'project'
type DateRange = 'last24h' | 'last7d' | 'last30d' | 'last90d' | 'lastYear' | 'all'

const getDateRangeFilter = (range: DateRange) => {
  const now = new Date()
  switch (range) {
    case 'last24h':
      return { start: subDays(now, 1), end: now }
    case 'last7d':
      return { start: subDays(now, 7), end: now }
    case 'last30d':
      return { start: subDays(now, 30), end: now }
    case 'last90d':
      return { start: subDays(now, 90), end: now }
    case 'lastYear':
      return { start: subDays(now, 365), end: now }
    default:
      return undefined
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Info className="h-4 w-4 text-gray-500" />
  }
}

const getCategoryIcon = (entityType: string) => {
  switch (entityType) {
    case 'submission':
      return <FileText className="h-4 w-4" />
    case 'auth':
      return <Key className="h-4 w-4" />
    case 'user':
      return <User className="h-4 w-4" />
    case 'system':
      return <Database className="h-4 w-4" />
    case 'client':
    case 'project':
      return <Shield className="h-4 w-4" />
    default:
      return <Info className="h-4 w-4" />
  }
}

export default function AuditTrail() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activityType, setActivityType] = useState<ActivityType>('all')
  const [dateRange, setDateRange] = useState<DateRange>('last7d')
  const [selectedEntry, setSelectedEntry] = useState<any>(null)

  // Get filter configuration
  const filters = {
    entityType: activityType === 'all' ? undefined : activityType,
    dateRange: getDateRangeFilter(dateRange),
    action: searchTerm || undefined,
  }

  // Fetch real audit logs
  const { data: auditEntries = [], isLoading, error, refetch } = useAuditLogs(filters)
  const { data: stats } = useAuditLogStats()

  const handleExport = async () => {
    // Log the export action
    await AuditLogger.logDataExport('audit_trail', {
      dateRange,
      activityType,
      searchTerm,
      recordCount: auditEntries.length
    })

    // Convert to CSV
    const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Status']
    const rows = auditEntries.map(entry => [
      format(new Date(entry.created_at), 'yyyy-MM-dd HH:mm:ss'),
      entry.user_email,
      entry.action,
      entry.entity_type,
      entry.entity_id,
      entry.ip_address,
      entry.status
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_trail_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading audit logs. Please ensure the audit_logs table exists in your database.</p>
          <p className="text-sm text-red-600 mt-2">Error: {error.message}</p>
        </div>
      </div>
    )
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
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {stats?.totalActivities || 0}
              </p>
            </div>
            <Database className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {stats?.successRate || 0}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {stats?.activeUsers || 0}
              </p>
            </div>
            <User className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Compliance Score</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {stats?.complianceScore || 0}%
              </p>
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
              placeholder="Search actions..."
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
              className="border border-gray-300 rounded-md text-sm flex-1 px-3 py-2"
            >
              <option value="all">All Activities</option>
              <option value="submission">Submissions</option>
              <option value="auth">Authentication</option>
              <option value="user">User Actions</option>
              <option value="system">System</option>
              <option value="client">Clients</option>
              <option value="project">Projects</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="border border-gray-300 rounded-md text-sm flex-1 px-3 py-2"
            >
              <option value="last24h">Last 24 Hours</option>
              <option value="last7d">Last 7 Days</option>
              <option value="last30d">Last 30 Days</option>
              <option value="last90d">Last 90 Days</option>
              <option value="lastYear">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => refetch()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
            <p className="mt-2 text-sm text-gray-500">Loading audit logs...</p>
          </div>
        ) : auditEntries.length === 0 ? (
          <div className="p-6 text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="mt-2 text-sm text-gray-500">No audit logs found</p>
            <p className="text-xs text-gray-400 mt-1">Activities will appear here as users interact with the system</p>
          </div>
        ) : (
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
              {auditEntries.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(entry.created_at), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {entry.user_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(entry.entity_type)}
                      <span className={getActionColor(entry.action)}>
                        {formatActionName(entry.action)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    <span className="font-medium">{entry.entity_type}:</span> {entry.entity_id}
                    {entry.changes && Object.keys(entry.changes).length > 0 && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({Object.keys(entry.changes).length} changes)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.ip_address}
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
        )}
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
                  {format(new Date(selectedEntry.created_at), 'EEEE, MMMM d, yyyy HH:mm:ss')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">User</p>
                <p className="mt-1 text-sm text-gray-900">{selectedEntry.user_email}</p>
                {selectedEntry.user_id && (
                  <p className="text-xs text-gray-500">ID: {selectedEntry.user_id}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Action</p>
                <p className="mt-1 text-sm text-gray-900">{formatActionName(selectedEntry.action)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Entity</p>
                <p className="mt-1 text-sm text-gray-900">
                  Type: {selectedEntry.entity_type}<br />
                  ID: {selectedEntry.entity_id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">IP Address</p>
                <p className="mt-1 text-sm text-gray-900">{selectedEntry.ip_address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">User Agent</p>
                <p className="mt-1 text-sm text-gray-900 text-xs break-all">{selectedEntry.user_agent}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="mt-1 flex items-center gap-2">
                  {getStatusIcon(selectedEntry.status)}
                  <span className="text-sm text-gray-900">{selectedEntry.status}</span>
                </div>
              </div>
              {selectedEntry.error_message && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Error Message</p>
                  <p className="mt-1 text-sm text-red-600">{selectedEntry.error_message}</p>
                </div>
              )}
              {selectedEntry.changes && Object.keys(selectedEntry.changes).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Changes</p>
                  <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md overflow-x-auto">
                    {JSON.stringify(selectedEntry.changes, null, 2)}
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