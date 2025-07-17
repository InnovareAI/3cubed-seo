import React, { useEffect, useState } from 'react'
import { supabase, ProjectOverview } from '../lib/supabase'
import { Building2, Package, AlertCircle, CheckCircle2, Clock, FileText, Users, Briefcase } from 'lucide-react'

export default function CurrentProjects() {
  const [projects, setProjects] = useState<ProjectOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('project_overview')
        .select('*')
        .order('last_activity', { ascending: false, nullsFirst: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'pending_ai': return <Clock className="h-4 w-4" />
      case 'pending_seo_review': return <FileText className="h-4 w-4" />
      case 'pending_client_review': return <Users className="h-4 w-4" />
      case 'pending_mlr_review': return <Briefcase className="h-4 w-4" />
      case 'pending_revisions': return <AlertCircle className="h-4 w-4" />
      case 'published': return <CheckCircle2 className="h-4 w-4" />
      default: return null
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'pending_ai': return 'bg-gray-100 text-gray-700'
      case 'pending_seo_review': return 'bg-blue-100 text-blue-700'
      case 'pending_client_review': return 'bg-purple-100 text-purple-700'
      case 'pending_mlr_review': return 'bg-orange-100 text-orange-700'
      case 'pending_revisions': return 'bg-red-100 text-red-700'
      case 'published': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const workflowStages = [
    { key: 'pending_ai', label: 'AI Processing', color: 'bg-gray-100 text-gray-700' },
    { key: 'pending_seo_review', label: 'SEO Review', color: 'bg-blue-100 text-blue-700' },
    { key: 'pending_client_review', label: 'Client Review', color: 'bg-purple-100 text-purple-700' },
    { key: 'pending_mlr_review', label: 'MLR Review', color: 'bg-orange-100 text-orange-700' },
    { key: 'pending_revisions', label: 'Revisions', color: 'bg-red-100 text-red-700' },
    { key: 'published', label: 'Published', color: 'bg-green-100 text-green-700' }
  ]

  // Group projects by client
  const projectsByClient = projects.reduce((acc, project) => {
    if (!acc[project.client_id]) {
      acc[project.client_id] = {
        client_name: project.client_name,
        client_status: project.client_status,
        projects: []
      }
    }
    acc[project.client_id].projects.push(project)
    return acc
  }, {} as Record<string, { client_name: string; client_status: string; projects: ProjectOverview[] }>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Current Projects</h1>
        <p className="text-gray-600">Overview of all active projects and their workflow status</p>
      </div>

      {/* Workflow Stage Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {workflowStages.map(stage => {
          const totalCount = projects.reduce((sum, p) => sum + (p[stage.key as keyof ProjectOverview] as number || 0), 0)
          return (
            <div key={stage.key} className="bg-white rounded-lg shadow p-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${stage.color} mb-2`}>
                {getStageIcon(stage.key)}
                {stage.label}
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
              <div className="text-sm text-gray-500">items</div>
            </div>
          )
        })}
      </div>

      {/* Projects by Client */}
      <div className="space-y-6">
        {Object.entries(projectsByClient).map(([clientId, clientData]) => (
          <div key={clientId} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{clientData.client_name}</h2>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    clientData.client_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {clientData.client_status}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {clientData.projects.length} {clientData.projects.length === 1 ? 'project' : 'projects'}
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {clientData.projects.map(project => (
                <div key={project.project_id} className="px-6 py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <Package className="h-5 w-5 text-gray-500" />
                        {project.project_name}
                      </h3>
                      {project.product_name && (
                        <p className="text-sm text-gray-600 mt-1">
                          Product: {project.product_name} | Area: {project.therapeutic_area}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Total Submissions</div>
                      <div className="text-2xl font-bold text-gray-900">{project.total_submissions}</div>
                    </div>
                  </div>

                  {/* Workflow Progress */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {workflowStages.map(stage => {
                      const count = project[stage.key as keyof ProjectOverview] as number || 0
                      return (
                        <div key={stage.key} className="text-center">
                          <div className={`inline-flex items-center justify-center w-full px-3 py-2 rounded-lg ${
                            count > 0 ? stage.color : 'bg-gray-50 text-gray-400'
                          }`}>
                            <span className="font-medium">{count}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{stage.label}</div>
                        </div>
                      )
                    })}
                  </div>

                  {project.last_activity && (
                    <div className="mt-3 text-xs text-gray-500">
                      Last activity: {new Date(project.last_activity).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No projects found</p>
        </div>
      )}
    </div>
  )
}
