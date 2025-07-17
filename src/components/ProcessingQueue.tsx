import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
// import { format } from 'date-fns'
import { supabase, type Submission } from '@/lib/supabase'
import { Clock, Loader2 } from 'lucide-react'

export default function ProcessingQueue() {
  const [realtimeSubmissions, setRealtimeSubmissions] = useState<Submission[]>([])
  
  const { data: initialSubmissions } = useQuery({
    queryKey: ['processing-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .in('langchain_status', ['needs_processing', 'processing'])
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data as Submission[]
    }
  })

  useEffect(() => {
    if (initialSubmissions) {
      setRealtimeSubmissions(initialSubmissions)
    }
  }, [initialSubmissions])

  useEffect(() => {
    const channel = supabase
      .channel('processing-queue')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions',
          filter: 'langchain_status=in.(needs_processing,processing)'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRealtimeSubmissions(prev => [...prev, payload.new as Submission])
          } else if (payload.eventType === 'UPDATE') {
            setRealtimeSubmissions(prev => 
              prev.map(sub => sub.id === payload.new.id ? payload.new as Submission : sub)
            )
          } else if (payload.eventType === 'DELETE') {
            setRealtimeSubmissions(prev => 
              prev.filter(sub => sub.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getEstimatedTime = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000)
    const remaining = Math.max(45 - diffMinutes, 5) // Assume 45 min processing time
    
    return `~${remaining} min remaining`
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phase
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Est. Time
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {realtimeSubmissions.map((submission) => (
            <tr key={submission.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {submission.product_identifier}
                </div>
                <div className="text-sm text-gray-500">
                  {submission.medical_indication}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {submission.your_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {submission.langchain_status === 'processing' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-blue-600">Processing</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Queued</span>
                    </>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {submission.langchain_phase || 'phase1'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getEstimatedTime(submission.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {(!realtimeSubmissions || realtimeSubmissions.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No submissions in queue</p>
        </div>
      )}
    </div>
  )
}
