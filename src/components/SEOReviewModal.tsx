import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Search, Target, BarChart3, AlertCircle, CheckCircle } from 'lucide-react'
import { ContentPiece } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

interface SEOReviewModalProps {
  isOpen: boolean
  onClose: () => void
  content: ContentPiece
}

export default function SEOReviewModal({ isOpen, onClose, content }: SEOReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'seo' | 'compliance'>('overview')
  const [revisionNotes, setRevisionNotes] = useState('')
  const queryClient = useQueryClient()

  // Update content status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ 
      newStatus, 
      notes 
    }: { 
      newStatus: 'pending_client_review' | 'requires_revision'
      notes?: string 
    }) => {
      const { data, error } = await supabase.rpc('transition_content_status', {
        p_content_id: content.id,
        p_new_status: newStatus,
        p_user_id: '11111111-1111-1111-1111-111111111111', // TODO: Get from auth
        p_notes: notes || null
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-review-content'] })
      queryClient.invalidateQueries({ queryKey: ['processing-queue'] })
      onClose()
      alert('Content status updated successfully')
    },
    onError: (error) => {
      alert('Failed to update status: ' + error.message)
    }
  })

  const handleApprove = () => {
    updateStatus.mutate({
      newStatus: 'pending_client_review'
    })
  }

  const handleRequestRevision = () => {
    if (!revisionNotes.trim()) {
      alert('Please provide revision notes')
      return
    }

    updateStatus.mutate({
      newStatus: 'requires_revision',
      notes: revisionNotes
    })
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <h3 className="text-2xl font-semibold leading-6 text-gray-900">
                      SEO Review
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {content.title}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                {/* Tabs */}
                <div className="mt-4 border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'overview'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('seo')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'seo'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      SEO Analysis
                    </button>
                    <button
                      onClick={() => setActiveTab('compliance')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'compliance'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Compliance
                    </button>
                  </nav>
                </div>

                <div className="mt-6 max-h-[60vh] overflow-y-auto">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Project</h4>
                          <p className="mt-1">{content.project?.name}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Client</h4>
                          <p className="mt-1">{content.project?.client?.name}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Therapeutic Area</h4>
                          <p className="mt-1">{content.project?.therapeutic_area}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Target Keyword</h4>
                          <p className="mt-1 font-medium text-green-600">{content.target_keyword}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Content Preview</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700 line-clamp-6">
                            {/* In a real app, we'd parse the actual content here */}
                            This pharmaceutical content has been optimized for the target keyword "{content.target_keyword}" 
                            and includes relevant information about {content.project?.therapeutic_area}. 
                            The content addresses key search intents and provides value to healthcare professionals 
                            seeking information about this therapeutic indication.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'seo' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">SEO Strategy</h4>
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700">{content.content.seo_analysis.strategy}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Target Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {content.content.seo_analysis.keywords.map((keyword, idx) => (
                            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              <Target className="h-3 w-3 mr-1" />
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Content Recommendations</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700">{content.content.seo_analysis.content_recommendations}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">SEO Metrics</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white border rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Keyword Density</span>
                              <BarChart3 className="h-4 w-4 text-gray-400" />
                            </div>
                            <p className="mt-1 text-xl font-semibold">2.3%</p>
                            <p className="text-xs text-green-600">Optimal</p>
                          </div>
                          <div className="bg-white border rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Readability Score</span>
                              <BarChart3 className="h-4 w-4 text-gray-400" />
                            </div>
                            <p className="mt-1 text-xl font-semibold">85/100</p>
                            <p className="text-xs text-green-600">Good</p>
                          </div>
                          <div className="bg-white border rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Content Length</span>
                              <BarChart3 className="h-4 w-4 text-gray-400" />
                            </div>
                            <p className="mt-1 text-xl font-semibold">1,250</p>
                            <p className="text-xs text-gray-600">Words</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'compliance' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Compliance Status</h4>
                        <div className="flex items-center gap-2">
                          {content.content.compliance_report.status === 'compliant' ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="font-medium text-green-600">Compliant</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-5 w-5 text-yellow-600" />
                              <span className="font-medium text-yellow-600 capitalize">
                                {content.content.compliance_report.status}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {content.content.compliance_report.flags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Compliance Flags</h4>
                          <div className="space-y-2">
                            {content.content.compliance_report.flags.map((flag, idx) => (
                              <div key={idx} className="flex items-start gap-2 bg-yellow-50 rounded-lg p-3">
                                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                <p className="text-sm text-gray-700">{flag}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Review Notes</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700">{content.content.compliance_report.review_notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Section */}
                <div className="mt-6 border-t pt-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Notes (Optional)
                    </label>
                    <textarea
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="Add any notes or feedback..."
                    />
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={handleRequestRevision}
                      disabled={updateStatus.isPending}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Request Revision
                    </button>

                    <div className="flex gap-3">
                      <button
                        onClick={onClose}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Close
                      </button>
                      <button
                        onClick={handleApprove}
                        disabled={updateStatus.isPending}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Approve & Send to Client
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
