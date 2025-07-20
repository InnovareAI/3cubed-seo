import { Routes, Route } from 'react-router-dom'
import DashboardLayout from './components/DashboardLayout'
import ErrorBoundary from './components/ErrorBoundary'
import ProjectsOverview from './pages/ProjectsOverview'
import SEORequests from './pages/SEORequests'
import SEOReview from './pages/SEOReview'
import ClientReview from './pages/ClientReview'
import Compliance from './pages/Compliance'
import RevisionDashboard from './pages/RevisionDashboard'
import MLRReview from './pages/MLRReview'
import ClientManagement from './pages/ClientManagement'
import CurrentProjects from './pages/CurrentProjects'
import HITLReview from './pages/HITLReview'
import Submissions from './pages/Submissions'
import AuditTrail from './pages/AuditTrail'
import Administration from './pages/Administration'
import ClientDashboard from './pages/ClientDashboard'
import SubmissionDetail from './pages/SubmissionDetail'
import SEOReviewDetail from './pages/SEOReviewDetail'
import ClientReviewDetail from './pages/ClientReviewDetail'
import MLRReviewDetail from './pages/MLRReviewDetail'

// Temporary placeholder component for missing pages
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500">This page is under development</p>
      </div>
    </div>
  )
}

function App() {
  console.log('App component rendered')
  console.log('Env mode:', import.meta.env.MODE)
  console.log('All env vars:', Object.keys(import.meta.env))
  console.log('Supabase URL exists:', !!import.meta.env.VITE_SUPABASE_URL)
  console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
  
  // Check if environment variables are missing
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-700 mb-4">
            The application is missing required environment variables.
          </p>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <p className="text-sm font-mono text-gray-800">
              Missing: {!import.meta.env.VITE_SUPABASE_URL && 'VITE_SUPABASE_URL'}
              {!import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_ANON_KEY && ', '}
              {!import.meta.env.VITE_SUPABASE_ANON_KEY && 'VITE_SUPABASE_ANON_KEY'}
            </p>
          </div>
          <div className="bg-gray-100 p-4 rounded text-xs">
            <p className="font-bold mb-2">Debug Info:</p>
            <p>Mode: {import.meta.env.MODE}</p>
            <p>Available vars: {Object.keys(import.meta.env).join(', ')}</p>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Please add these environment variables in Netlify's site settings.
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<ProjectsOverview />} />
            <Route path="seo-requests" element={<SEORequests />} />
            <Route path="submissions" element={<Submissions />} />
            <Route path="submissions/:id" element={<SubmissionDetail />} />
            <Route path="hitl-review" element={<HITLReview />} />
            <Route path="seo-review" element={<SEOReview />} />
            <Route path="seo-review/:id" element={<SEOReviewDetail />} />
            <Route path="client-review" element={<ClientReview />} />
            <Route path="client-review/:id" element={<ClientReviewDetail />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="revisions" element={<RevisionDashboard />} />
            <Route path="mlr-review" element={<MLRReview />} />
            <Route path="mlr-review/:id" element={<MLRReviewDetail />} />
            <Route path="client-management" element={<ClientManagement />} />
            <Route path="admin/clients" element={<ClientManagement />} />
            <Route path="current-projects" element={<CurrentProjects />} />
            <Route path="content-hub" element={<ComingSoon title="SEO Content Hub" />} />
            <Route path="audit" element={<AuditTrail />} />
            <Route path="admin" element={<Administration />} />
            <Route path="projects/:clientName" element={<ClientDashboard />} />
          </Route>
        </Routes>
      </div>
    </ErrorBoundary>
  )
}

export default App
