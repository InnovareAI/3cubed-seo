import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase, type Submission } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Search, Calendar, Building2, User, ExternalLink, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { SubmissionForm } from '../components/SubmissionForm'

export default function SEORequests() {
  const [showForm, setShowForm] = useState(false)
  
  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['seo-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Submission[]
    }
  })

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'needs_processing': 'bg-gray-100 text-gray-700',
      'processing': 'bg-blue-100 text-blue-700',
      'needs_review': 'bg-yellow-100 text-yellow-700',
      'approved': 'bg-green-100 text-green-700',
      'rejected': 'bg-red-100 text-red-700',
      'complete': 'bg-green-100 text-green-700',
      'client_approved': 'bg-purple-100 text-purple-700',
      'seo_approved': 'bg-indigo-100 text-indigo-700',
      'mlr_approved': 'bg-teal-100 text-teal-700',
      'revision_requested': 'bg-orange-100 text-orange-700'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-700'
      }`}>
        {status.replace(/_/g, ' ')}
      </span>
    )
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">SEO Content Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            All pharmaceutical SEO content generation requests
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {showForm ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Hide Form
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              New SEO Request
            </>
          )}
        </button>
      </div>

      {/* Submission Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New SEO Content Request</h2>
          <SubmissionForm onSuccess={handleFormSuccess} onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {requests?.map((request) => (
            <li key={request.id}>
              <Link
                to={`/submissions/${request.id}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Search className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.product_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.therapeutic_area} • {request.stage}
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex items-center space-x-4">
                      {getStatusBadge(request.langchain_status)}
                      <ExternalLink className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex sm:space-x-6">
                      <p className="flex items-center text-sm text-gray-500">
                        <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {request.submitter_name}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Building2 className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {request.submitter_email?.split('@')[1] || 'Unknown'}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>Workflow: {request.workflow_stage.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}