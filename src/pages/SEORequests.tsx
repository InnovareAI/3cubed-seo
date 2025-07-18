import { SubmissionForm } from '../components/SubmissionForm'

export default function SEORequests() {
  const handleFormSuccess = () => {
    // Form submitted successfully
    // Could show a success message or redirect
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">SEO Content Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Submit new pharmaceutical SEO content generation requests
        </p>
      </div>

      {/* Submission Form - Always Visible */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Create New SEO Content Request</h2>
        <SubmissionForm onSuccess={handleFormSuccess} />
      </div>
    </div>
  )
}