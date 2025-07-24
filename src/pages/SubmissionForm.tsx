import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { THERAPEUTIC_AREAS } from '../constants/therapeuticAreas'
import { 
  Send,
  AlertCircle
} from 'lucide-react'

export default function SubmissionForm() {
  const [formData, setFormData] = useState({
    product_name: '',
    therapeutic_area: '',
    stage: 'Phase III',
    priority_level: 'Medium',
    medical_indication: '',
    mechanism_of_action: '',
    target_audience: ['Healthcare Professionals'],
    key_differentiators: [] as string[],
    submitter_name: '',
    submitter_email: '',
    geography: 'United States'
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      // Create submission in database
      const { data, error } = await supabase
        .from('submissions')
        .insert({
          ...formData,
          workflow_stage: 'form_submitted',
          langchain_status: 'needs_processing',
          ai_processing_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Trigger n8n webhook
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/3cubed-seo-webhook'
      
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            submission_id: data.id
          })
        })

        if (!response.ok) {
          console.error('Webhook failed:', response.statusText)
        }
      } catch (webhookError) {
        console.error('Webhook error:', webhookError)
        // Don't fail the submission if webhook fails
      }

      setMessage({ 
        type: 'success', 
        text: 'Submission created successfully! SEO content generation has started.' 
      })
      
      // Reset form
      setFormData({
        product_name: '',
        therapeutic_area: '',
        stage: 'Phase III',
        priority_level: 'Medium',
        medical_indication: '',
        mechanism_of_action: '',
        target_audience: ['Healthcare Professionals'],
        key_differentiators: [],
        submitter_name: '',
        submitter_email: '',
        geography: 'United States'
      })
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to submit. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New SEO Content Submission</h1>
        <p className="text-sm text-gray-600 mt-1">Submit pharmaceutical product information for SEO content generation</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Product Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Therapeutic Area *
              </label>
              <select
                required
                value={formData.therapeutic_area}
                onChange={(e) => setFormData({ ...formData, therapeutic_area: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select therapeutic area</option>
                {THERAPEUTIC_AREAS.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Development Stage *
              </label>
              <select
                required
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Phase III">Phase III</option>
                <option value="Pre-Launch">Pre-Launch (Market Shaping)</option>
                <option value="Market Launch">Market Launch</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority Level
              </label>
              <select
                value={formData.priority_level}
                onChange={(e) => setFormData({ ...formData, priority_level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Indication *
              </label>
              <textarea
                required
                rows={3}
                value={formData.medical_indication}
                onChange={(e) => setFormData({ ...formData, medical_indication: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the medical condition or indication this product treats"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mechanism of Action
              </label>
              <textarea
                rows={3}
                value={formData.mechanism_of_action}
                onChange={(e) => setFormData({ ...formData, mechanism_of_action: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Explain how the drug works"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Differentiators
              </label>
              <textarea
                rows={2}
                value={formData.key_differentiators.join('\n')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  key_differentiators: e.target.value.split('\n').filter(d => d.trim()) 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter key differentiators (one per line)"
              />
            </div>
          </div>
        </div>

        {/* Submitter Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Submitter Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.submitter_name}
                onChange={(e) => setFormData({ ...formData, submitter_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Email *
              </label>
              <input
                type="email"
                required
                value={formData.submitter_email}
                onChange={(e) => setFormData({ ...formData, submitter_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {!isSubmitting && <Send className="h-4 w-4 mr-2" />}
            {isSubmitting ? 'Submitting...' : 'Submit for SEO Generation'}
          </button>
        </div>
      </form>
    </div>
  )
}