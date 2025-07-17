import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Building2, TrendingUp, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'

interface ClientProject {
  client_name: string
  company: string
  product_count: number
  active_campaigns: number
  pending_reviews: number
  approved_content: number
  total_submissions: number
  approval_rate: number
  last_activity: string
  status: 'active' | 'paused' | 'completed'
}

// Mock client data with realistic pharma companies
const mockClients: ClientProject[] = [
  {
    client_name: 'Pharma Corp',
    company: 'pharmacorp.com',
    product_count: 5,
    active_campaigns: 3,
    pending_reviews: 2,
    approved_content: 45,
    total_submissions: 52,
    approval_rate: 87,
    last_activity: new Date().toISOString(),
    status: 'active'
  },
  {
    client_name: 'BioTech Inc',
    company: 'biotech-inc.com',
    product_count: 3,
    active_campaigns: 2,
    pending_reviews: 1,
    approved_content: 28,
    total_submissions: 31,
    approval_rate: 90,
    last_activity: new Date(Date.now() - 86400000).toISOString(),
    status: 'active'
  },
  {
    client_name: 'MedTech Solutions',
    company: 'medtechsolutions.com',
    product_count: 8,
    active_campaigns: 5,
    pending_reviews: 4,
    approved_content: 67,
    total_submissions: 78,
    approval_rate: 86,
    last_activity: new Date(Date.now() - 172800000).toISOString(),
    status: 'active'
  },
  {
    client_name: 'Global Pharma',
    company: 'globalpharma.com',
    product_count: 12,
    active_campaigns: 0,
    pending_reviews: 0,
    approved_content: 134,
    total_submissions: 145,
    approval_rate: 92,
    last_activity: new Date(Date.now() - 604800000).toISOString(),
    status: 'completed'
  },
  {
    client_name: 'Innovative Bio',
    company: 'innovativebio.com',
    product_count: 4,
    active_campaigns: 1,
    pending_reviews: 0,
    approved_content: 23,
    total_submissions: 25,
    approval_rate: 92,
    last_activity: new Date(Date.now() - 259200000).toISOString(),
    status: 'active'
  },
  {
    client_name: 'NextGen Therapeutics',
    company: 'nextgenthera.com',
    product_count: 6,
    active_campaigns: 0,
    pending_reviews: 0,
    approved_content: 0,
    total_submissions: 0,
    approval_rate: 0,
    last_activity: new Date(Date.now() - 1209600000).toISOString(),
    status: 'paused'
  }
]

export default function ProjectsOverview() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all')

  // Use mock data instead of fetching
  const { data: clientProjects = mockClients, isLoading = false } = useQuery({
    queryKey: ['client-projects'],
    queryFn: async () => {
      // Return mock data
      return mockClients
    },
    refetchInterval: 30000
  })

  const filteredProjects = clientProjects?.filter(project => {
    const matchesSearch = searchTerm === '' || 
      project.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const totalStats = {
    totalClients: clientProjects?.length || 0,
    activeProjects: clientProjects?.filter(p => p.status === 'active').length || 0,
    pendingReviews: clientProjects?.reduce((sum, p) => sum + p.pending_reviews, 0) || 0,
    avgApprovalRate: clientProjects?.length 
      ? Math.round(clientProjects.reduce((sum, p) => sum + p.approval_rate, 0) / clientProjects.length)
      : 0
  }

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
        <h1 className="text-2xl font-semibold text-gray-900">Projects Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all client projects and SEO content production
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{totalStats.totalClients}</p>
            </div>
            <Building2 className="h-12 w-12 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{totalStats.activeProjects}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{totalStats.pendingReviews}</p>
            </div>
            <Clock className="h-12 w-12 text-amber-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Avg Approval Rate</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{totalStats.avgApprovalRate}%</p>
            </div>
            <CheckCircle className="h-12 w-12 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search clients or companies..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Client Projects Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredProjects?.map((project) => (
          <div
            key={project.client_name}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/projects/${encodeURIComponent(project.client_name)}`)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{project.client_name}</h3>
                  <p className="text-sm text-gray-500">{project.company}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Products</span>
                  <span className="font-medium">{project.product_count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active Campaigns</span>
                  <span className="font-medium">{project.active_campaigns}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending Reviews</span>
                  <span className={`font-medium ${project.pending_reviews > 0 ? 'text-amber-600' : ''}`}>
                    {project.pending_reviews}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Approval Rate</span>
                  <span className="font-medium">{project.approval_rate}%</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Last activity: {new Date(project.last_activity).toLocaleDateString()}
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredProjects?.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No projects found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
