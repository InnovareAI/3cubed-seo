import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import UnifiedReviewModal from './UnifiedReviewModal'
import { 
  Search,
  Hash,
  MessageSquare,
  TrendingUp,
  FileText,
  Bot,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface SEOReviewModalProps {
  isOpen: boolean
  onClose: () => void
  submission: any
}

export default function SEOReviewModal({ isOpen, onClose, submission }: SEOReviewModalProps) {
  const [keywordApprovals, setKeywordApprovals] = useState<Record<string, boolean>>({})
  const [internalNotes, setInternalNotes] = useState('')
  const [clientFeedback, setClientFeedback] = useState('')

  const submitReview = useMutation({
    mutationFn: async (decision: 'approve' | 'revise') => {
      const updates = {
        workflow_stage: decision === 'approve' ? 'Client_Review' : 'Revision_Requested',
        langchain_status: decision === 'approve' ? 'seo_approved' : 'revision_requested',
        seo_reviewed_at: new Date().toISOString(),
        seo_reviewed_by: 'SEO Specialist', // Would come from auth
        seo_keyword_approvals: keywordApprovals,
        seo_internal_notes: internalNotes,
        seo_client_feedback: clientFeedback
      }

      const { error } = await supabase
        .from('submissions')
        .update(updates)
        .eq('id', submission.id)

      if (error) throw error
    },
    onSuccess: () => {
      onClose()
    }
  })

  const sections = [
    {
      id: 'keywords',
      title: 'Keyword Strategy',
      icon: <Hash className="h-5 w-5" />,
      collapsible: false,
      defaultExpanded: true,
      content: (
        <div className="space-y-4">
          {/* Primary Keywords */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Primary Keywords</h4>
            <div className="space-y-2">
              {(submission.seo_keywords || []).map((keyword: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{keyword}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Search Vol: ~12K/mo</span>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={keywordApprovals[keyword] !== false}
                        onChange={(e) => setKeywordApprovals({
                          ...keywordApprovals,
                          [keyword]: e.target.checked
                        })}
                        className="rounded text-blue-600"
                      />
                      <span className="text-xs">Approve</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Long-tail Keywords */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Long-tail Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {(submission.long_tail_keywords || []).map((keyword: string, index: number) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'questions',
      title: 'Consumer Questions & Search Intent',
      icon: <MessageSquare className="h-5 w-5" />,
      collapsible: true,
      defaultExpanded: true,
      content: (
        <div className="space-y-3">
          {(submission.consumer_questions || []).map((question: string, index: number) => (
            <div key={index} className="flex items-start gap-2">
              <div className="mt-0.5 text-blue-500">
                <MessageSquare className="h-4 w-4" />
              </div>
              <p className="text-sm text-gray-700">{question}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'optimization',
      title: 'Content Optimization',
      icon: <TrendingUp className="h-5 w-5" />,
      collapsible: true,
      defaultExpanded: false,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Meta Title</h4>
            <p className="text-sm bg-gray-50 p-3 rounded">
              {submission.product_name}: Revolutionary {submission.therapeutic_area} Treatment | Brand Name
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Meta Description</h4>
            <p className="text-sm bg-gray-50 p-3 rounded">
              Discover {submission.product_name}, a breakthrough treatment for {submission.medical_indication}. 
              Learn about efficacy, safety, and patient outcomes. Healthcare professionals click here.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'geo',
      title: 'Generative Engine Optimization (GEO)',
      icon: <Bot className="h-5 w-5" />,
      collapsible: true,
      defaultExpanded: false,
      content: (
        <div className="space-y-3">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-purple-900">
              <span className="font-medium">AI Optimization Score:</span> 92/100
            </p>
            <p className="text-xs text-purple-700 mt-1">
              Content is well-structured for AI extraction and featured snippets
            </p>
          </div>
          <div className="space-y-2">
            {[
              'Clear Q&A format for voice search',
              'Structured data markup ready',
              'Concise, authoritative statements',
              'FAQ schema implementation'
            ].map((item, index) => (
              <label key={index} className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded text-purple-600" />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'feedback',
      title: 'Review Notes',
      icon: <FileText className="h-5 w-5" />,
      collapsible: false,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internal SEO Notes
            </label>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              placeholder="Technical notes for the SEO team..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback for Client
            </label>
            <textarea
              value={clientFeedback}
              onChange={(e) => setClientFeedback(e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              placeholder="Recommendations for content optimization..."
            />
          </div>
        </div>
      )
    }
  ]

  const actions = [
    {
      label: 'Request Revision',
      icon: <XCircle className="h-4 w-4" />,
      onClick: () => submitReview.mutate('revise'),
      variant: 'secondary' as const,
      disabled: submitReview.isPending
    },
    {
      label: 'Approve & Send to Client',
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: () => submitReview.mutate('approve'),
      variant: 'primary' as const,
      disabled: submitReview.isPending
    }
  ]

  return (
    <UnifiedReviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={`SEO Review: ${submission.product_name}`}
      subtitle={`${submission.therapeutic_area} • ${submission.stage}`}
      icon={<Search className="h-6 w-6 text-blue-600" />}
      headerBadge={
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          SEO Review
        </span>
      }
      sections={sections}
      actions={actions}
    />
  )
}
