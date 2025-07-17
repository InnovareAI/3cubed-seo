import { Routes, Route } from 'react-router-dom'
import DashboardLayout from './components/DashboardLayout'
import CurrentProjects from './pages/CurrentProjects'
import SEORequests from './pages/SEORequests'
import SEOReview from './pages/SEOReview'
import ClientReview from './pages/ClientReview'
import RevisionRequests from './pages/RevisionRequests'
import MLRReview from './pages/MLRReview'
import Compliance from './pages/Compliance'
import ClientManagement from './pages/ClientManagement'
// import SEOContentHub from './pages/SEOContentHub'
// import ContentHub from './pages/ContentHub'
import AuditTrail from './pages/AuditTrail'
import Administration from './pages/Administration'
import ClientDashboard from './pages/ClientDashboard'
import SubmissionDetail from './pages/SubmissionDetail'

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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<CurrentProjects />} />
          <Route path="seo-requests" element={<SEORequests />} />
          <Route path="seo-requests/:id" element={<SubmissionDetail />} />
          <Route path="seo-review" element={<SEOReview />} />
          <Route path="client-review" element={<ClientReview />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="revision-requests" element={<RevisionRequests />} />
          <Route path="mlr-review" element={<MLRReview />} />
          <Route path="content-hub" element={<ComingSoon title="SEO Content Hub" />} />
          <Route path="audit" element={<AuditTrail />} />
          <Route path="admin" element={<Administration />} />
          <Route path="admin/clients" element={<ClientManagement />} />
          <Route path="projects/:clientName" element={<ClientDashboard />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
