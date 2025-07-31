import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { debounce } from 'lodash'
import { format } from 'date-fns'
import {
  Save,
  Edit2,
  X,
  Check,
  AlertCircle,
  Clock,
  User,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'

interface Submission {
  id: string
  product_name: string
  therapeutic_area: string
  workflow_stage: string
  ai_processing_status: string
  created_at: string
  updated_at: string
  
  // SEO fields (editable)
  seo_title?: string
  meta_title?: string
  meta_description?: string
  seo_strategy_outline?: string
  h1_tag?: string
  h2_tags?: string[]
  seo_keywords?: string[]
  long_tail_keywords?: string[]
  geo_event_tags?: string[]
  
  // Review tracking
  seo_reviewed_at?: string
  seo_reviewed_by?: string
  seo_internal_notes?: string
  
  // AI-generated content
  ai_output?: any
  geo_optimization_score?: number
  
  // Metadata
  last_edited_by?: string
  last_edited_at?: string
}

interface EditingState {
  [key: string]: Partial<Submission>
}

interface ConflictInfo {
  submissionId: string
  conflictedFields: string[]
  otherUser: string
  timestamp: string
}

export default function EditableSEODashboard() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingState, setEditingState] = useState<EditingState>({})
  const [showSaved, setShowSaved] = useState<string | null>(null)
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([])
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Fetch submissions
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['editable-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Submission[]
    }
  })

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('editable-submissions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'submissions'
      }, (payload) => {
        // Check for conflicts if we're editing this record
        if (payload.eventType === 'UPDATE' && editingId === payload.new.id) {
          const editedFields = Object.keys(editingState[editingId] || {})
          const conflictedFields = editedFields.filter(field => 
            payload.new[field] !== payload.old[field] &&
            payload.new[field] !== editingState[editingId]?.[field]
          )
          
          if (conflictedFields.length > 0) {
            setConflicts(prev => [...prev, {
              submissionId: payload.new.id,
              conflictedFields,
              otherUser: payload.new.last_edited_by || 'Another user',
              timestamp: new Date().toISOString()
            }])
          }
        }
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['editable-submissions'] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, editingId, editingState])

  // Save mutation with optimistic updates
  const saveMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Submission> }) => {
      const { error } = await supabase
        .from('submissions')
        .update({
          ...updates,
          seo_reviewed_at: new Date().toISOString(),
          seo_reviewed_by: 'current-user@example.com', // TODO: Get from auth
          last_edited_by: 'current-user@example.com',
          last_edited_at: new Date().toISOString(),
          workflow_stage: 'seo_reviewed'
        })
        .eq('id', id)
      
      if (error) throw error
      return { id, updates }
    },
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['editable-submissions'] })
      
      // Snapshot the previous value
      const previousSubmissions = queryClient.getQueryData<Submission[]>(['editable-submissions'])
      
      // Optimistically update to the new value
      if (previousSubmissions) {
        queryClient.setQueryData<Submission[]>(['editable-submissions'], old => 
          old?.map(submission => 
            submission.id === id 
              ? {
                  ...submission,
                  ...updates,
                  seo_reviewed_at: new Date().toISOString(),
                  seo_reviewed_by: 'current-user@example.com',
                  last_edited_by: 'current-user@example.com',
                  last_edited_at: new Date().toISOString(),
                  workflow_stage: 'seo_reviewed'
                }
              : submission
          ) || []
        )
      }
      
      // Return a context object with the snapshotted value
      return { previousSubmissions, id }
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousSubmissions) {
        queryClient.setQueryData(['editable-submissions'], context.previousSubmissions)
      }
      console.error('Save failed:', error)
      alert('Failed to save changes. Please try again.')
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['editable-submissions'] })
    },
    onSuccess: ({ id }) => {
      setShowSaved(id)
      setTimeout(() => setShowSaved(null), 3000)
      
      // Clear editing state for this submission
      setEditingState(prev => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
      
      if (editingId === id) {
        setEditingId(null)
      }
    }
  })

  // Handle field changes
  const handleFieldChange = (id: string, field: keyof Submission, value: any) => {
    setEditingState(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }))
  }

  // Auto-save with debounce
  const debouncedSave = useMemo(
    () => debounce((id: string, updates: Partial<Submission>) => {
      if (autoSaveEnabled && Object.keys(updates).length > 0) {
        saveMutation.mutate({ id, updates })
      }
    }, 2000),
    [autoSaveEnabled]
  )

  // Handle auto-save
  useEffect(() => {
    if (editingId && editingState[editingId]) {
      debouncedSave(editingId, editingState[editingId])
    }
  }, [editingState, editingId, debouncedSave])

  // Start editing
  const startEditing = (submission: Submission) => {
    setEditingId(submission.id)
    setEditingState(prev => ({
      ...prev,
      [submission.id]: {
        seo_title: submission.seo_title || '',
        meta_title: submission.meta_title || '',
        meta_description: submission.meta_description || '',
        seo_strategy_outline: submission.seo_strategy_outline || '',
        h1_tag: submission.h1_tag || '',
        seo_internal_notes: submission.seo_internal_notes || ''
      }
    }))
  }

  // Cancel editing
  const cancelEditing = (id: string) => {
    setEditingId(null)
    setEditingState(prev => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
  }

  // Manual save
  const handleSave = (id: string) => {
    const updates = editingState[id]
    if (updates) {
      saveMutation.mutate({ id, updates })
    }
  }

  // Toggle row expansion
  const toggleExpanded = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Resolve conflict
  const resolveConflict = (submissionId: string, useOurs: boolean) => {
    if (useOurs) {
      handleSave(submissionId)
    } else {
      cancelEditing(submissionId)
    }
    setConflicts(prev => prev.filter(c => c.submissionId !== submissionId))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2">Loading submissions...</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          SEO Content Dashboard
        </h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Real-time editing with auto-save enabled
          </p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Auto-save</span>
          </label>
        </div>
      </div>

      {/* Conflict Notifications */}
      {conflicts.length > 0 && (
        <div className="mb-4 space-y-2">
          {conflicts.map((conflict, idx) => (
            <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="ml-3 flex-1">
                  <p className="text-sm text-yellow-800">
                    <strong>{conflict.otherUser}</strong> edited fields: {conflict.conflictedFields.join(', ')}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => resolveConflict(conflict.submissionId, true)}
                      className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                    >
                      Keep My Changes
                    </button>
                    <button
                      onClick={() => resolveConflict(conflict.submissionId, false)}
                      className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      Discard My Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submissions Grid */}
      <div className="space-y-4">
        {submissions?.map((submission) => {
          const isEditing = editingId === submission.id
          const isExpanded = expandedRows.has(submission.id)
          const editState = editingState[submission.id] || {}
          
          return (
            <div
              key={submission.id}
              className={`bg-white rounded-lg shadow-sm border ${
                isEditing ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
              } transition-all`}
            >
              {/* Header Row */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {submission.product_name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {submission.therapeutic_area}
                    </span>
                    {submission.ai_processing_status === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <Check className="h-3 w-3" />
                        AI Processed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {showSaved === submission.id && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Saved
                      </span>
                    )}
                    {!isEditing ? (
                      <>
                        <button
                          onClick={() => startEditing(submission)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleExpanded(submission.id)}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                        >
                          {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSave(submission.id)}
                          disabled={saveMutation.isPending}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => cancelEditing(submission.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(submission.created_at), 'MMM d, yyyy')}
                  </span>
                  {submission.seo_reviewed_at && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Reviewed by {submission.seo_reviewed_by}
                    </span>
                  )}
                  {submission.geo_optimization_score && (
                    <span className="flex items-center gap-1">
                      GEO Score: {submission.geo_optimization_score}%
                    </span>
                  )}
                </div>
              </div>

              {/* Expandable Content */}
              {(isExpanded || isEditing) && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                  {/* SEO Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Title (50-60 chars)
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editState.seo_title || submission.seo_title || ''}
                        onChange={(e) => handleFieldChange(submission.id, 'seo_title', e.target.value)}
                        maxLength={60}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{submission.seo_title || 'Not set'}</p>
                    )}
                  </div>

                  {/* Meta Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Title
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editState.meta_title || submission.meta_title || ''}
                        onChange={(e) => handleFieldChange(submission.id, 'meta_title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{submission.meta_title || 'Not set'}</p>
                    )}
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description (150-160 chars)
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editState.meta_description || submission.meta_description || ''}
                        onChange={(e) => handleFieldChange(submission.id, 'meta_description', e.target.value)}
                        maxLength={160}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{submission.meta_description || 'Not set'}</p>
                    )}
                  </div>

                  {/* SEO Strategy */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Strategy Outline
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editState.seo_strategy_outline || submission.seo_strategy_outline || ''}
                        onChange={(e) => handleFieldChange(submission.id, 'seo_strategy_outline', e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {submission.seo_strategy_outline || 'Not set'}
                      </p>
                    )}
                  </div>

                  {/* Internal Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Internal SEO Notes
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editState.seo_internal_notes || submission.seo_internal_notes || ''}
                        onChange={(e) => handleFieldChange(submission.id, 'seo_internal_notes', e.target.value)}
                        rows={3}
                        placeholder="Add notes for the team..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {submission.seo_internal_notes || 'No notes'}
                      </p>
                    )}
                  </div>

                  {/* Keywords Display (Read-only) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SEO Keywords
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {submission.seo_keywords?.map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {keyword}
                          </span>
                        )) || <span className="text-gray-500">None</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GEO Event Tags
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {submission.geo_event_tags?.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            {tag}
                          </span>
                        )) || <span className="text-gray-500">None</span>}
                      </div>
                    </div>
                  </div>

                  {/* Last Update Info */}
                  {submission.last_edited_at && (
                    <div className="pt-2 border-t border-gray-200 text-xs text-gray-500">
                      Last edited by {submission.last_edited_by} on{' '}
                      {format(new Date(submission.last_edited_at), 'MMM d, yyyy HH:mm')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}