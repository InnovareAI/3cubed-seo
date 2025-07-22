import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Target, AlertCircle, CheckCircle } from 'lucide-react'
import { Submission } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

interface SEOReviewModalProps {
  isOpen: boolean
  onClose: () => void
  content: Submission
}

export default function SEOReviewModal({ isOpen, onClose, content }: SEOReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'seo' | 'geo' | 'compliance'>('overview')
  const [revisionNotes, setRevisionNotes] = useState('')
  const [titleApproved, setTitleApproved] = useState(false)
  const [geoTagsApproved, setGeoTagsApproved] = useState(false)
  const [metaDescriptionApproved, setMetaDescriptionApproved] = useState(false)
  const [keywordApprovals, setKeywordApprovals] = useState<Record<string, boolean>>({})
  
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
      // First, create an SEO review record
      const { error: reviewError } = await supabase
        .from('seo_reviews')
        .insert({
          submission_id: content.id,
          reviewer_name: 'Current User', // TODO: Get from auth
          reviewer_email: 'user@example.com', // TODO: Get from auth
          status: newStatus === 'pending_client_review' ? 'approved' : 'revision_requested',
          keyword_approvals: keywordApprovals,
          internal_notes: notes,
          seo_title_approved: titleApproved,
          meta_description_approved: metaDescriptionApproved,
          content_approved: newStatus === 'pending_client_review'
        })
        .select()
        .single()

      if (reviewError) throw reviewError

      // Then update the submission
      const { data, error } = await supabase
        .from('submissions')
        .update({
          workflow_stage: newStatus === 'pending_client_review' ? 'client_review' : 'revision',
          seo_reviewed_at: new Date().toISOString(),
          seo_reviewed_by: 'Current User', // TODO: Get from auth
          seo_keyword_approvals: keywordApprovals,
          seo_internal_notes: notes
        })
        .eq('id', content.id)
        .select()
        .single()

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

  const handleKeywordApproval = (keyword: string) => {
    setKeywordApprovals(prev => ({
      ...prev,
      [keyword]: !prev[keyword]
    }))
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
                      {content.product_name} - {content.compliance_id}
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
                      onClick={() => setActiveTab('geo')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'geo'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      GEO Optimization
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
                          <h4 className="text-sm font-medium text-gray-500">Product</h4>
                          <p className="mt-1">{content.product_name}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Stage</h4>
                          <p className="mt-1">{content.stage}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Therapeutic Area</h4>
                          <p className="mt-1">{content.therapeutic_area}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Priority</h4>
                          <p className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${content.priority_level === 'High' ? 'bg-red-100 text-red-800' : 
                                content.priority_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {content.priority_level}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Content Preview</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700 line-clamp-6">
                            {content.raw_input_content || content.ai_output?.content || 'No content available'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'seo' && (
                    <div className="space-y-6">
                      {/* SEO Title Tag Section */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          SEO Title Tag
                          <span className="ml-2 text-xs font-normal text-gray-400">
                            (50-60 characters)
                          </span>
                        </h4>
                        <div className="bg-white border rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-900">
                            {content.seo_title || content.meta_title || 'No SEO title set'}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className={`text-xs ${
                              (content.seo_title || content.meta_title) && 
                              (content.seo_title || content.meta_title || '').length >= 50 && 
                              (content.seo_title || content.meta_title || '').length <= 60
                                ? 'text-green-600'
                                : 'text-amber-600'
                            }`}>
                              Character count: {(content.seo_title || content.meta_title || '').length}/60
                            </span>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={titleApproved}
                                onChange={(e) => setTitleApproved(e.target.checked)}
                                className="mr-2"
                              />
                              <span className="text-sm">Approved</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Meta Description */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Meta Description
                          <span className="ml-2 text-xs font-normal text-gray-400">
                            (140-155 characters)
                          </span>
                        </h4>
                        <div className="bg-white border rounded-lg p-4">
                          <p className="text-sm text-gray-700">
                            {content.meta_description || 'No meta description set'}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className={`text-xs ${
                              content.meta_description && content.meta_description.length >= 140 && content.meta_description.length <= 155
                                ? 'text-green-600'
                                : 'text-amber-600'
                            }`}>
                              Character count: {content.meta_description?.length || 0}/155
                            </span>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={metaDescriptionApproved}
                                onChange={(e) => setMetaDescriptionApproved(e.target.checked)}
                                className="mr-2"
                              />
                              <span className="text-sm">Approved</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* H1 Tag */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">H1 Tag</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-900">{content.h1_tag || 'No H1 tag set'}</p>
                        </div>
                      </div>

                      {/* Keywords */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Target Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {content.seo_keywords?.map((keyword, idx) => (
                            <div key={idx} className="flex items-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                <Target className="h-3 w-3 mr-1" />
                                {keyword}
                              </span>
                              <input
                                type="checkbox"
                                checked={keywordApprovals[keyword] || false}
                                onChange={() => handleKeywordApproval(keyword)}
                                className="ml-2"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Long-tail Keywords */}
                      {content.long_tail_keywords && content.long_tail_keywords.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Long-tail Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {content.long_tail_keywords.map((keyword, idx) => (
                              <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Consumer Questions */}
                      {content.consumer_questions && content.consumer_questions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Consumer Questions Addressed</h4>
                          <ul className="space-y-2">
                            {content.consumer_questions.map((question, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-green-600 mr-2">•</span>
                                <span className="text-sm text-gray-700">{question}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'geo' && (
                    <div className="space-y-6">
                      {/* Event Tags Section */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">GEO Event Tags</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          {content.geo_event_tags && content.geo_event_tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {content.geo_event_tags.map((tag: string, idx: number) => (
                                <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No event tags defined</p>
                          )}
                          <label className="flex items-center mt-3">
                            <input
                              type="checkbox"
                              checked={geoTagsApproved}
                              onChange={(e) => setGeoTagsApproved(e.target.checked)}
                              className="mr-2"
                            />
                            <span className="text-sm">Event tags approved</span>
                          </label>
                        </div>
                      </div>

                      {/* AI-Friendly Summary */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">AI-Friendly Summary</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700">
                            {content.geo_optimization?.ai_friendly_summary || 'No AI summary generated'}
                          </p>
                        </div>
                      </div>

                      {/* Structured Data */}
                      {content.geo_optimization?.structured_data && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Structured Data</h4>
                          <div className="bg-white border rounded-lg p-4">
                            <dl className="space-y-2">
                              {Object.entries(content.geo_optimization.structured_data).map(([key, value]) => (
                                <div key={key} className="flex">
                                  <dt className="text-sm font-medium text-gray-600 w-1/3">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</dt>
                                  <dd className="text-sm text-gray-900 w-2/3">{String(value) || 'Not specified'}</dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        </div>
                      )}

                      {/* Key Facts */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Key Facts for AI</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          {content.geo_optimization?.key_facts && content.geo_optimization.key_facts.length > 0 ? (
                            <ul className="space-y-2">
                              {content.geo_optimization.key_facts.map((fact: string, idx: number) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-green-600 mr-2">•</span>
                                  <span className="text-sm text-gray-700">{fact}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No key facts defined</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'compliance' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Compliance Status</h4>
                        <div className="flex items-center gap-2">
                          {content.ai_output?.compliance_status === 'compliant' ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="font-medium text-green-600">Compliant</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-5 w-5 text-yellow-600" />
                              <span className="font-medium text-yellow-600 capitalize">
                                {content.ai_output?.compliance_status || 'Pending Review'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {content.ai_output?.compliance_flags && content.ai_output.compliance_flags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Compliance Flags</h4>
                          <div className="space-y-2">
                            {content.ai_output.compliance_flags.map((flag: string, idx: number) => (
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
                          <p className="text-sm text-gray-700">
                            {content.review_notes || 'No review notes available'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Section */}
                <div className="mt-6 border-t pt-6">
                  <div className="space-y-3 mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Approval Checklist</h4>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={titleApproved}
                          onChange={(e) => setTitleApproved(e.target.checked)}
                          className="mr-2"
                        />
                        <span>SEO Title Tag approved</span>
                      </label>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={metaDescriptionApproved}
                          onChange={(e) => setMetaDescriptionApproved(e.target.checked)}
                          className="mr-2"
                        />
                        <span>Meta Description approved</span>
                      </label>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={geoTagsApproved}
                          onChange={(e) => setGeoTagsApproved(e.target.checked)}
                          className="mr-2"
                        />
                        <span>GEO Event Tags approved</span>
                      </label>
                    </div>
                  </div>

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
                        disabled={updateStatus.isPending || (!titleApproved || !metaDescriptionApproved)}
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