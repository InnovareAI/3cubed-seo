import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { 
  X,
  CheckCircle,
  XCircle,
  MessageSquare,
  Download,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  AlertCircle
} from 'lucide-react'

interface SEOReviewModalProps {
  isOpen: boolean
  onClose: () => void
  submission: any
}

export default function SEOReviewModal({ isOpen, onClose, submission }: SEOReviewModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['keywords', 'questions', 'recommendations']))
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const updateWorkflowStage = useMutation({
    mutationFn: async ({ stage, reason }: { stage: string; reason?: string }) => {
      const updateData: any = { workflow_stage: stage }
      if (reason) {
        updateData.rejection_reason = reason
        updateData.rejected_at = new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('submissions')
        .update(updateData)
        .eq('id', submission.id)
      
      if (error) throw error
    },
    onSuccess: () => {
      onClose()
    }
  })

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const handleApprove = () => {
    updateWorkflowStage.mutate({ stage: 'Client_Review' })
  }

  const handleReject = () => {
    if (rejectionReason.trim()) {
      updateWorkflowStage.mutate({ stage: 'Rejected', reason: rejectionReason })
    }
  }

  const handleRequestChanges = () => {
    updateWorkflowStage.mutate({ stage: 'Revision_Requested' })
  }

  // Mock SEO content for demo
  const seoContent = {
    seo_keywords: submission.seo_keywords || [
      'cancer treatment clinical trial',
      'phase 3 oncology study',
      'advanced cancer therapy',
      'tumor treatment research',
      'cancer drug development',
      'oncology clinical research',
      'cancer patient recruitment',
      'innovative cancer treatment',
      'cancer therapy trial',
      'oncology drug testing'
    ],
    longtail_keywords: submission.long_tail_keywords || [
      'phase 3 cancer clinical trial near me',
      'how to join oncology research study',
      'advanced cancer treatment clinical trials 2024',
      'eligibility criteria for cancer drug trials',
      'benefits of participating in cancer research',
      'new cancer treatment options in development',
      'oncology clinical trial patient experiences',
      'cancer research study compensation and benefits',
      'what to expect in phase 3 cancer trials',
      'finding the right oncology clinical trial'
    ],
    consumer_questions: submission.consumer_questions || [
      'What are the eligibility requirements for this cancer clinical trial?',
      'How long does the clinical trial last?',
      'Are there any costs associated with participating?',
      'What are the potential side effects of the treatment?',
      'Will I receive a placebo or the actual treatment?',
      'How often will I need to visit the trial site?',
      'Can I continue my current cancer treatments?',
      'What happens after the trial ends?',
      'Is travel assistance available for trial participants?',
      'How is my privacy protected during the trial?'
    ],
    h1_recommendations: [
      'Join Our Phase 3 Cancer Clinical Trial | Advanced Oncology Treatment Study',
      'Breakthrough Cancer Treatment Clinical Trial Now Enrolling Patients',
      'Phase 3 Oncology Research Study | Help Advance Cancer Care'
    ],
    h2_recommendations: [
      'Who Can Participate in This Clinical Trial',
      'Understanding the Clinical Trial Process',
      'Benefits of Joining Our Research Study',
      'What to Expect During the Trial',
      'Safety Monitoring and Patient Care',
      'Frequently Asked Questions',
      'How to Apply for the Clinical Trial',
      'Contact Our Research Team'
    ],
    meta_description: submission.meta_description || {
      text: 'Join our Phase 3 clinical trial for advanced cancer treatment. Learn about eligibility, benefits, and how to participate in this groundbreaking oncology research study.',
      length: 158
    },
    schema_markup: {
      "@context": "https://schema.org",
      "@type": "MedicalStudy",
      "name": "Phase 3 Oncology Clinical Trial",
      "description": "A phase 3 clinical trial evaluating an innovative treatment for advanced cancer",
      "sponsor": {
        "@type": "Organization",
        "name": submission.client_name || "Pharmaceutical Company"
      },
      "studyDesign": "Randomized controlled trial",
      "healthCondition": submission.medical_indication || "Advanced Cancer",
      "phase": "Phase 3",
      "studyLocation": {
        "@type": "AdministrativeArea",
        "name": "Multiple locations across the United States"
      }
    }
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
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Dialog.Title as="h3" className="text-2xl font-semibold text-gray-900">
                        {submission.product_name}
                      </Dialog.Title>
                      <p className="mt-1 text-sm text-gray-500">
                        {submission.stage} • {submission.therapeutic_area} • {submission.target_audience?.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        <Download className="h-4 w-4 mr-2 inline" />
                        Export
                      </button>
                      <button
                        onClick={onClose}
                        className="rounded-md p-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6 space-y-6">
                  {/* SEO Keywords Section */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div
                      className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSection('keywords')}
                    >
                      <h2 className="text-lg font-medium text-gray-900">SEO Keywords ({seoContent.seo_keywords.length})</h2>
                      {expandedSections.has('keywords') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                    {expandedSections.has('keywords') && (
                      <div className="p-6 space-y-3">
                        {seoContent.seo_keywords.map((keyword, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-900">{keyword}</span>
                            <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                              <Sparkles className="h-4 w-4" />
                              Ask AI
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Longtail Keywords Section */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div
                      className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSection('longtail')}
                    >
                      <h2 className="text-lg font-medium text-gray-900">Longtail Keywords ({seoContent.longtail_keywords.length})</h2>
                      {expandedSections.has('longtail') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                    {expandedSections.has('longtail') && (
                      <div className="p-6 space-y-3">
                        {seoContent.longtail_keywords.map((keyword, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-900">{keyword}</span>
                            <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                              <Sparkles className="h-4 w-4" />
                              Ask AI
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Consumer Questions Section */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div
                      className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSection('questions')}
                    >
                      <h2 className="text-lg font-medium text-gray-900">Consumer Questions ({seoContent.consumer_questions.length})</h2>
                      {expandedSections.has('questions') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                    {expandedSections.has('questions') && (
                      <div className="p-6 space-y-3">
                        {seoContent.consumer_questions.map((question, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-900">{question}</span>
                            <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                              <Sparkles className="h-4 w-4" />
                              Ask AI
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* H1 & H2 Recommendations */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div
                      className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSection('recommendations')}
                    >
                      <h2 className="text-lg font-medium text-gray-900">H1 & H2 Recommendations</h2>
                      {expandedSections.has('recommendations') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                    {expandedSections.has('recommendations') && (
                      <div className="p-6 space-y-6">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">H1 Recommendations:</h3>
                          <div className="space-y-3">
                            {seoContent.h1_recommendations.map((h1, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-900">{h1}</span>
                                <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                                  <Sparkles className="h-4 w-4" />
                                  Ask AI
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">H2 Recommendations:</h3>
                          <div className="space-y-3">
                            {seoContent.h2_recommendations.map((h2, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-900">{h2}</span>
                                <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                                  <Sparkles className="h-4 w-4" />
                                  Ask AI
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Meta Description */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">Meta Description</h2>
                    </div>
                    <div className="p-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-900 mb-2">{seoContent.meta_description.text}</p>
                        <p className="text-xs text-gray-500">Character count: {seoContent.meta_description.length}/160</p>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                          <Copy className="h-4 w-4 mr-2 inline" />
                          Copy
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                          <Sparkles className="h-4 w-4 mr-2 inline" />
                          Optimize with AI
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Schema Markup */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">Schema Markup</h2>
                    </div>
                    <div className="p-6">
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{JSON.stringify(seoContent.schema_markup, null, 2)}</code>
                      </pre>
                      <div className="mt-4 flex gap-3">
                        <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                          <Copy className="h-4 w-4 mr-2 inline" />
                          Copy Schema
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                          <CheckCircle className="h-4 w-4 mr-2 inline" />
                          Validate with AI
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-2 inline" />
                      Reject All
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={handleRequestChanges}
                        className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                      >
                        <MessageSquare className="h-4 w-4 mr-2 inline" />
                        Request Changes
                      </button>
                      <button
                        onClick={handleApprove}
                        disabled={updateWorkflowStage.isPending}
                        className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 inline" />
                        Approve & Send to Client
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reject Modal */}
                {showRejectModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Submission</h3>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Please provide a reason for rejection..."
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        rows={4}
                      />
                      <div className="mt-4 flex justify-end gap-3">
                        <button
                          onClick={() => setShowRejectModal(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={!rejectionReason.trim()}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}