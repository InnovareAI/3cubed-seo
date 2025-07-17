import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Shield, CheckCircle, XCircle, AlertCircle, Clock, TrendingUp, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'

interface ComplianceCheck {
  id: string
  submissionId: string
  productName: string
  checkType: 'FDA' | 'EMA' | 'Health Canada' | 'Internal'
  status: 'passed' | 'failed' | 'pending' | 'review'
  severity: 'critical' | 'high' | 'medium' | 'low'
  issues: string[]
  checkedBy: string
  checkedAt: Date
  notes?: string
}

const mockComplianceData: ComplianceCheck[] = [
  {
    id: '1',
    submissionId: 'SUB-001',
    productName: 'KEYTRUDA (pembrolizumab)',
    checkType: 'FDA',
    status: 'passed',
    severity: 'low',
    issues: [],
    checkedBy: 'Compliance AI',
    checkedAt: new Date(),
    notes: 'All FDA requirements met'
  },
  {
    id: '2',
    submissionId: 'SUB-002',
    productName: 'OZEMPIC (semaglutide)',
    checkType: 'FDA',
    status: 'review',
    severity: 'medium',
    issues: ['Missing black box warning', 'Incomplete adverse events section'],
    checkedBy: 'Compliance AI',
    checkedAt: new Date(Date.now() - 3600000),
    notes: 'Requires manual review for risk assessment'
  },
  {
    id: '3',
    submissionId: 'SUB-003',
    productName: 'Biosimilar Candidate X',
    checkType: 'EMA',
    status: 'failed',
    severity: 'critical',
    issues: ['Unapproved indication claim', 'Missing clinical trial data', 'Comparative efficacy claims not substantiated'],
    checkedBy: 'Compliance AI',
    checkedAt: new Date(Date.now() - 7200000)
  },
  {
    id: '4',
    submissionId: 'SUB-004',
    productName: 'Novel mRNA Vaccine',
    checkType: 'Health Canada',
    status: 'pending',
    severity: 'low',
    issues: [],
    checkedBy: 'Pending Review',
    checkedAt: new Date(Date.now() - 86400000)
  }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'passed':
      return <CheckCircle className="h-5 w-5" />
    case 'failed':
      return <XCircle className="h-5 w-5" />
    case 'review':
      return <AlertCircle className="h-5 w-5" />
    case 'pending':
      return <Clock className="h-5 w-5" />
    default:
      return <AlertCircle className="h-5 w-5" />
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'passed':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'review':
      return 'bg-yellow-100 text-yellow-800'
    case 'pending':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getSeverityBadgeClass = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800'
    case 'high':
      return 'bg-orange-100 text-orange-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function Compliance() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [checkTypeFilter, setCheckTypeFilter] = useState<string>('all')

  const { data: complianceChecks = mockComplianceData } = useQuery({
    queryKey: ['compliance-checks'],
    queryFn: async () => mockComplianceData
  })

  const stats = {
    total: complianceChecks.length,
    passed: complianceChecks.filter(c => c.status === 'passed').length,
    failed: complianceChecks.filter(c => c.status === 'failed').length,
    pending: complianceChecks.filter(c => c.status === 'pending' || c.status === 'review').length,
    complianceRate: Math.round((complianceChecks.filter(c => c.status === 'passed').length / complianceChecks.length) * 100)
  }

  const filteredChecks = complianceChecks.filter(check => {
    const matchesSearch = searchTerm === '' || 
      check.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.submissionId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || check.status === statusFilter
    const matchesType = checkTypeFilter === 'all' || check.checkType === checkTypeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Compliance Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor regulatory compliance across all content submissions
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Checks</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Passed</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.passed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.failed}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.complianceRate}%</p>
              <p className="mt-1 text-sm text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +2.5% from last month
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product or submission ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="review">Under Review</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div>
            <select
              value={checkTypeFilter}
              onChange={(e) => setCheckTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Authorities</option>
              <option value="FDA">FDA</option>
              <option value="EMA">EMA</option>
              <option value="Health Canada">Health Canada</option>
              <option value="Internal">Internal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Compliance Checks Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Authority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issues
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Checked
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredChecks.map((check) => (
              <tr key={check.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {check.submissionId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {check.productName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                    {check.checkType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(check.status)}`}>
                    {getStatusIcon(check.status)}
                    {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityBadgeClass(check.severity)}`}>
                    {check.severity.charAt(0).toUpperCase() + check.severity.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {check.issues.length > 0 ? (
                    <ul className="text-sm text-gray-900 space-y-1">
                      {check.issues.slice(0, 2).map((issue, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-1">•</span>
                          <span className="text-xs">{issue}</span>
                        </li>
                      ))}
                      {check.issues.length > 2 && (
                        <li className="text-xs text-gray-500">+{check.issues.length - 2} more</li>
                      )}
                    </ul>
                  ) : (
                    <span className="text-sm text-green-600">No issues found</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">{check.checkedBy}</div>
                    <div className="text-xs text-gray-500">{format(check.checkedAt, 'MMM d, h:mm a')}</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
