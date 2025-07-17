import React, { useState, useEffect } from 'react'
import { supabase, type Client } from '../lib/supabase'
import { processSubmissionAssignment } from '../lib/clientProjectHelpers'
import { Send, Building2, AlertCircle } from 'lucide-react'

interface SubmissionFormProps {
  onSuccess?: () => void
  isAdmin?: boolean
}

export default function SubmissionForm({ onSuccess, isAdmin = false }: SubmissionFormProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    submitter_name: '',
    submitter_email: '',
    product_name: '',
    therapeutic_area: '',
    stage: '',
    priority_level: 'Medium' as 'High' | 'Medium' | 'Low',
    raw_input_content: '',
    override_client_id: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAdmin) {
      fetchClients()
    }
  }, [isAdmin])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setClients((data || []) as Client[])
    } catch (err) {
      console.error('Error fetching clients:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let client_id: string
      let project_id: string

      if (isAdmin && formData.override_client_id) {
        // Admin override - use selected client
        const { data: projects, error: projectError } = await supabase
          .from('projects')
          .select('id')
          .eq('client_id', formData.override_client_id)
          .eq('product_name', formData.product_name)
          .eq('therapeutic_area', formData.therapeutic_area)
          .single()

        if (projectError || !projects) {
          // Create new project for this client
          const { data: newProject, error: createError } = await supabase
            .from('projects')
            .insert({
              client_id: formData.override_client_id,
              name: `${formData.product_name} - ${formData.therapeutic_area}`,
              product_name: formData.product_name,
              therapeutic_area: formData.therapeutic_area,
              status: 'active'
            })
            .select()
            .single()

          if (createError) throw createError
          project_id = newProject.id
        } else {
          project_id = projects.id
        }
        
        client_id = formData.override_client_id
      } else {
        // Auto-assign based on email domain
        const assignment = await processSubmissionAssignment({
          submitter_email: formData.submitter_email,
          product_name: formData.product_name,
          therapeutic_area: formData.therapeutic_area
        })
        
        client_id = assignment.client_id
        project_id = assignment.project_id
      }

      // Create the submission
      const { error: submitError } = await supabase
        .from('submissions')
        .insert({
          compliance_id: `COMP-${Date.now()}`,
          client_id,
          project_id,
          submitter_name: formData.submitter_name,
          submitter_email: formData.submitter_email,
          product_name: formData.product_name,
          therapeutic_area: formData.therapeutic_area,
          stage: formData.stage,
          priority_level: formData.priority_level,
          raw_input_content: formData.raw_input_content,
          langchain_status: 'needs_processing',
          workflow_stage: 'Form_Submitted',
          langchain_phase: 'initial',
          langchain_retry_count: 0
        })

      if (submitError) throw submitError

      // Reset form
      setFormData({
        submitter_name: '',
        submitter_email: '',
        product_name: '',
        therapeutic_area: '',
        stage: '',
        priority_level: 'Medium',
        raw_input_content: '',
        override_client_id: ''
      })

      alert('Submission created successfully!')
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Error creating submission:', err)
      setError('Failed to create submission. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Admin Client Override */}
      {isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="inline h-4 w-4 mr-1" />
            Admin: Override Client Assignment
          </label>
          <select
            value={formData.override_client_id}
            onChange={(e) => setFormData({ ...formData, override_client_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Auto-assign based on email domain</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} (@{client.company_domain})
              </option>
            ))}
          </select>
          <p className="text-xs text-yellow-700 mt-1">
            Leave blank to auto-assign based on submitter's email domain
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Submitter Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.submitter_name}
            onChange={(e) => setFormData({ ...formData, submitter_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Submitter Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.submitter_email}
            onChange={(e) => setFormData({ ...formData, submitter_email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.product_name}
            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Therapeutic Area <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.therapeutic_area}
            onChange={(e) => setFormData({ ...formData, therapeutic_area: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stage <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select stage...</option>
            <option value="Pre-Clinical">Pre-Clinical</option>
            <option value="Phase I">Phase I</option>
            <option value="Phase II">Phase II</option>
            <option value="Phase III">Phase III</option>
            <option value="FDA Approved">FDA Approved</option>
            <option value="Market Launch">Market Launch</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority Level <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.priority_level}
            onChange={(e) => setFormData({ ...formData, priority_level: e.target.value as 'High' | 'Medium' | 'Low' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content Request <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={6}
          value={formData.raw_input_content}
          onChange={(e) => setFormData({ ...formData, raw_input_content: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Describe the content you need for SEO optimization..."
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  )
}