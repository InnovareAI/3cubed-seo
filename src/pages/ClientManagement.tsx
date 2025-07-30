import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { 
  Plus, 
  Building2, 
  Edit2, 
  Clock,
  Users,
  FileText,
  TrendingUp,
  Shield,
  DollarSign,
  Target,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  BarChart,
  User,
  CheckCircle,
  X
} from 'lucide-react'

interface Client {
  id: string
  name: string
  company_domain: string
  contact_name?: string | null
  contact_email?: string | null
  status: 'active' | 'paused' | 'inactive'
  created_at: string
  updated_at: string
}

interface ExtendedClient extends Client {
  projects_count?: number
  submissions_count?: number
  active_campaigns?: number
  compliance_score?: number
  last_submission?: string
  contract_value?: number
  therapeutic_areas?: string[]
  phone?: string
}


export default function ClientManagement() {
  const [isAddingClient, setIsAddingClient] = useState(false)
  const [expandedClient, setExpandedClient] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'compliance' | 'billing'>('overview')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  // const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [editingClient, setEditingClient] = useState<ExtendedClient | null>(null)
  
  const [newClient, setNewClient] = useState({
    name: '',
    company_domain: '',
    contact_name: '',
    contact_email: '',
    status: 'active' as 'active' | 'paused' | 'inactive',
    phone: '',
    address: '',
    contract_type: 'annual',
    therapeutic_areas: [] as string[],
    compliance_requirements: {
      fda_regulated: true,
      ema_regulated: false,
      other_regulations: ''
    }
  })

  const { data: dbClients, isLoading, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Client[]
    },
    enabled: true
  })

  const clients = dbClients || []

  const handleCreateClient = async () => {
    // Validate required fields
    if (!newClient.name || !newClient.company_domain || !newClient.contact_name || !newClient.contact_email) {
      alert('Please fill in all required fields')
      return
    }

    const { error } = await supabase
      .from('clients')
      .insert([newClient])
    
    if (!error) {
      setIsAddingClient(false)
      resetNewClient()
      refetch()
      showSuccess('Client created successfully!')
    } else {
      alert('Error creating client: ' + error.message)
    }
  }

  const showSuccess = (_message: string) => {
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  const resetNewClient = () => {
    setNewClient({
      name: '',
      company_domain: '',
      contact_name: '',
      contact_email: '',
      status: 'active',
      phone: '',
      address: '',
      contract_type: 'annual',
      therapeutic_areas: [],
      compliance_requirements: {
        fda_regulated: true,
        ema_regulated: false,
        other_regulations: ''
      }
    })
  }

  const toggleExpanded = (clientId: string) => {
    setExpandedClient(expandedClient === clientId ? null : clientId)
  }

  // const handleEditClient = (client: ExtendedClient) => {
  //   setEditingClient(client)
  //   setNewClient({
  //     name: client.name,
  //     company_domain: client.company_domain,
  //     contact_name: client.contact_name || '',
  //     contact_email: client.contact_email || '',
  //     status: client.status,
  //     phone: client.phone || '',
  //     address: '',
  //     contract_type: 'annual',
  //     therapeutic_areas: client.therapeutic_areas || [],
  //     compliance_requirements: {
  //       fda_regulated: true,
  //       ema_regulated: false,
  //       other_regulations: ''
  //     }
  //   })
  //   setIsAddingClient(true)
  // }

  // const handleUpdateClient = async () => {
  //   if (!editingClient) return
    
  //   if (!newClient.name || !newClient.company_domain || !newClient.contact_name || !newClient.contact_email) {
  //     alert('Please fill in all required fields')
  //     return
  //   }

  //   if (useDemoData) {
  //     // Update in local state
  //     const updatedClients = localClients.map(client => 
  //       client.id === editingClient.id 
  //         ? {
  //             ...client,
  //             ...newClient,
  //             updated_at: new Date().toISOString()
  //           }
  //         : client
  //     )
  //     setLocalClients(updatedClients)
  //     setIsAddingClient(false)
  //     setEditingClient(null)
  //     resetNewClient()
  //     showSuccess('Client updated successfully!')
  //   }
  // }

  // const handleDeleteClient = async (clientId: string) => {
  //   if (useDemoData) {
  //     setLocalClients(localClients.filter(client => client.id !== clientId))
  //     setShowDeleteConfirm(null)
  //     showSuccess('Client deleted successfully!')
  //   }
  // }

  const therapeuticAreaOptions = [
    'Oncology', 'Cardiology', 'Neurology', 'Rheumatology', 'Immunology',
    'Endocrinology', 'Psychiatry', 'Dermatology', 'Pulmonology', 'Gastroenterology'
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">Operation completed successfully!</p>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Client Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage pharmaceutical client accounts, contracts, and compliance requirements
          </p>
        </div>
        <button
          onClick={() => setIsAddingClient(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </button>
      </div>

      {/* Client Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{clients.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {clients.reduce((sum, client) => sum + ((client as ExtendedClient).active_campaigns || 0), 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Compliance Score</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {Math.round(clients.reduce((sum, client) => sum + ((client as ExtendedClient).compliance_score || 0), 0) / clients.length)}%
              </p>
            </div>
            <Shield className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contract Value</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                ${(clients.reduce((sum, client) => sum + ((client as ExtendedClient).contract_value || 0), 0) / 1000000).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Add/Edit Client Modal */}
      {isAddingClient && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h3>
              <button
                onClick={() => {
                  setIsAddingClient(false)
                  setEditingClient(null)
                  resetNewClient()
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {(['overview', 'details', 'compliance', 'billing'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client Name *</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="e.g., Global Pharma Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Domain *</label>
                <input
                  type="text"
                  value={newClient.company_domain}
                  onChange={(e) => setNewClient({ ...newClient, company_domain: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Primary Contact Name *</label>
                <input
                  type="text"
                  value={newClient.contact_name || ''}
                  onChange={(e) => setNewClient({ ...newClient, contact_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Email *</label>
                <input
                  type="email"
                  value={newClient.contact_email || ''}
                  onChange={(e) => setNewClient({ ...newClient, contact_email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone || ''}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={newClient.status}
                    onChange={(e) => setNewClient({ ...newClient, status: e.target.value as 'active' | 'paused' | 'inactive' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={newClient.address || ''}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Therapeutic Areas</label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {therapeuticAreaOptions.map(area => (
                    <label key={area} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newClient.therapeutic_areas.includes(area)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewClient({ 
                              ...newClient, 
                              therapeutic_areas: [...newClient.therapeutic_areas, area] 
                            })
                          } else {
                            setNewClient({ 
                              ...newClient, 
                              therapeutic_areas: newClient.therapeutic_areas.filter(a => a !== area) 
                            })
                          }
                        }}
                        className="rounded text-primary-600"
                      />
                      <span className="text-sm text-gray-700">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newClient.compliance_requirements.fda_regulated}
                    onChange={(e) => setNewClient({
                      ...newClient,
                      compliance_requirements: {
                        ...newClient.compliance_requirements,
                        fda_regulated: e.target.checked
                      }
                    })}
                    className="rounded text-primary-600"
                  />
                  <span className="text-sm font-medium text-gray-700">FDA Regulated</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newClient.compliance_requirements.ema_regulated}
                    onChange={(e) => setNewClient({
                      ...newClient,
                      compliance_requirements: {
                        ...newClient.compliance_requirements,
                        ema_regulated: e.target.checked
                      }
                    })}
                    className="rounded text-primary-600"
                  />
                  <span className="text-sm font-medium text-gray-700">EMA Regulated</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Other Regulatory Requirements</label>
                <textarea
                  value={newClient.compliance_requirements.other_regulations}
                  onChange={(e) => setNewClient({
                    ...newClient,
                    compliance_requirements: {
                      ...newClient.compliance_requirements,
                      other_regulations: e.target.value
                    }
                  })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="e.g., Health Canada, PMDA, etc."
                />
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contract Type</label>
                <select
                  value={newClient.contract_type}
                  onChange={(e) => setNewClient({ ...newClient, contract_type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="annual">Annual</option>
                  <option value="project">Project-based</option>
                  <option value="retainer">Monthly Retainer</option>
                </select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Billing details and contract values will be configured after client creation through the billing portal.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsAddingClient(false)
                resetNewClient()
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateClient}
              disabled={!newClient.name || !newClient.company_domain || !newClient.contact_name || !newClient.contact_email}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingClient ? 'Update Client' : 'Create Client'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )}

      {/* Client List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {clients?.map((client) => (
            <li key={client.id}>
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <Building2 className="h-10 w-10 text-gray-400 flex-shrink-0" />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">{client.company_domain}</div>
                          {client.contact_email && (
                            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Mail className="h-3 w-3" />
                              {client.contact_email}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">{(client as ExtendedClient).projects_count || 0}</span> projects
                          </div>
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">{(client as ExtendedClient).submissions_count || 0}</span> submissions
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">{(client as ExtendedClient).compliance_score || 0}%</span>
                          </div>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            client.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : client.status === 'paused'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.status}
                          </span>
                          <button 
                            onClick={() => toggleExpanded(client.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedClient === client.id ? 
                              <ChevronUp className="h-5 w-5" /> : 
                              <ChevronDown className="h-5 w-5" />
                            }
                          </button>
                          <button className="text-primary-600 hover:text-primary-900">
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedClient === client.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Contact Information */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Contact Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{client.contact_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{client.contact_email}</span>
                          </div>
                          {(client as ExtendedClient).phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-700">{(client as ExtendedClient).phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Campaign Activity */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <BarChart className="h-4 w-4" />
                          Campaign Activity
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Active Campaigns:</span>
                            <span className="font-medium text-gray-900">{(client as ExtendedClient).active_campaigns || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Last Submission:</span>
                            <span className="font-medium text-gray-900">
                              {(client as ExtendedClient).last_submission ? 
                                new Date((client as ExtendedClient).last_submission!).toLocaleDateString() : 
                                'N/A'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Contract Value:</span>
                            <span className="font-medium text-gray-900">
                              ${(((client as ExtendedClient).contract_value || 0) / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Therapeutic Areas */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Therapeutic Areas
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {(client as ExtendedClient).therapeutic_areas?.map((area: string, index: number) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-3">
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <FileText className="h-3 w-3 mr-1" />
                        View Projects
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <Clock className="h-3 w-3 mr-1" />
                        Activity Log
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-primary-600 text-xs font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Billing Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
