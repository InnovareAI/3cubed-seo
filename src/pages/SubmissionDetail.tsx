import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase, type Submission } from '../lib/mockData'
import { Tabs, Tab } from '@/components/Tabs'
import { FileText, Shield, Clock, BarChart3 } from 'lucide-react'

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>()
  
  const { data: submission, isLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Submission
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-gray-900">Submission not found</h2>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {submission.product_name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Compliance ID: {submission.compliance_id}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <Tabs>
          <Tab label="Generated Content" icon={<FileText className="h-4 w-4" />}>
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">SEO Content</h3>
              {submission.ai_output ? (
                <div className="prose max-w-none">
                  <pre className="bg-gray-50 p-4 rounded overflow-auto">
                    {JSON.stringify(submission.ai_output, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-gray-500">Content not yet generated</p>
              )}
            </div>
          </Tab>
          
          <Tab label="Compliance" icon={<Shield className="h-4 w-4" />}>
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Compliance Status</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">FDA Compliance</dt>
                  <dd className="mt-1 text-sm text-gray-900">{submission.workflow_stage}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">QA Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">{submission.langchain_status}</dd>
                </div>
              </dl>
            </div>
          </Tab>
          
          <Tab label="History" icon={<Clock className="h-4 w-4" />}>
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Version History</h3>
              <p className="text-gray-500">Version history will be displayed here</p>
            </div>
          </Tab>
          
          <Tab label="Analytics" icon={<BarChart3 className="h-4 w-4" />}>
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Performance Analytics</h3>
              <p className="text-gray-500">Analytics data will be displayed here</p>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  )
}