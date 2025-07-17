import React, { useEffect, useState } from 'react'
import { supabase, Client, Project } from '../lib/supabase'
import { Building2, Plus, Edit2, Merge, Mail, CheckCircle, XCircle } from 'lucide-react'

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [mergeTarget, setMergeTarget] = useState<string>('')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          projects:projects(count),
          submissions:submissions(count)
        `)
        .order('name')

      if (error) throw error
      setClients(data || [])
    } catch (err) {
      console.error('Error fetching clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDomain = async (clientId: string, newDomain: string) => {
    // This would require a new client_domains table
    // For now, we'll show the concept
    alert(`Would add domain ${newDomain} to client`)
  }

  const handleMergeClients = async () => {
    if (!selectedClient || !mergeTarget) return

    try {
      // Update all submissions and projects to point to target client
      const { error: projectError } = await supabase
        .from('projects')
        .update({ client_id: mergeTarget })
        .eq('client_id', selectedClient.id)

      const { error: submissionError } = await supabase
        .from('submissions')
        .update({ client_id: mergeTarget })
        .eq('client_id', selectedClient.id)

      // Delete the merged client
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', selectedClient.id)

      if (projectError || submissionError || deleteError) {
        throw new Error('Failed to merge clients')
      }

      setShowMergeModal(false)
      fetchClients()
      alert('Clients merged successfully!')
    } catch (err) {
      console.error('Error merging clients:', err)
      alert('Failed to merge clients')
    }
  }

  const handleUpdateClient = async (updates: Partial<Client>) => {
    if (!selectedClient) return

    try {
      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', selectedClient.id)

      if (error) throw error

      setShowEditModal(false)
      fetchClients()
      alert('Client updated successfully!')
    } catch (err) {
      console.error('Error updating client:', err)
      alert('Failed to update client')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Management</h1>
        <p className="text-gray-600">Manage client accounts and domain associations</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Active Clients</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {clients.map((client) => (
            <div key={client.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      client.status === 'active' ? 'bg-green-100 text-green-700' : 
                      client.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {client.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Primary Domain: {client.company_domain}</span>
                    </div>
                    {client.contact_email && (
                      <div>Contact: {client.contact_name || 'N/A'} ({client.contact_email})</div>
                    )}
                    <div className="flex gap-4 text-xs text-gray-500 mt-2">
                      <span>{client.projects?.[0]?.count || 0} projects</span>
                      <span>{client.submissions?.[0]?.count || 0} submissions</span>
                    </div>
                  </div>

                  {/* Additional Domains (future feature) */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Email domains:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        @{client.company_domain}
                      </span>
                      {/* Additional domains would go here */}
                      <button className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded hover:bg-gray-100 flex items-center gap-1">
                        <Plus className="h-3 w-3" />
                        Add domain
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedClient(client)
                      setShowEditModal(true)
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClient(client)
                      setShowMergeModal(true)
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Merge className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Merge Modal */}
      {showMergeModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Merge Client: {selectedClient.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select the client to merge into. All projects and submissions will be transferred.
            </p>
            <select
              value={mergeTarget}
              onChange={(e) => setMergeTarget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
            >
              <option value="">Select target client...</option>
              {clients
                .filter(c => c.id !== selectedClient.id)
                .map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={handleMergeClients}
                disabled={!mergeTarget}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Merge Clients
              </button>
              <button
                onClick={() => {
                  setShowMergeModal(false)
                  setMergeTarget('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Client: {selectedClient.name}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleUpdateClient({
                name: formData.get('name') as string,
                contact_name: formData.get('contact_name') as string,
                contact_email: formData.get('contact_email') as string,
                status: formData.get('status') as 'active' | 'paused' | 'inactive'
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    name="name"
                    defaultValue={selectedClient.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    name="contact_name"
                    defaultValue={selectedClient.contact_name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    name="contact_email"
                    type="email"
                    defaultValue={selectedClient.contact_email || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={selectedClient.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
