import { Routes, Route } from 'react-router-dom'
import DashboardLayout from './components/DashboardLayout'
import ProjectsOverview from './pages/ProjectsOverview'
import SEORequests from './pages/SEORequests'
import SEOReview from './pages/SEOReview'
import ClientReview from './pages/ClientReview'
import Compliance from './pages/Compliance'
import RevisionRequests from './pages/RevisionRequests'
import MLRReview from './pages/MLRReview'
import SEOContentHub from './pages/SEOContentHub'
import AuditTrail from './pages/AuditTrail'
import Administration from './pages/Administration'
import ClientDashboard from './pages/ClientDashboard'
import SubmissionDetail from './pages/SubmissionDetail'

function App() {
  console.log('App component rendered')
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<ProjectsOverview />} />
          <Route path="seo-requests" element={<SEORequests />} />
          <Route path="seo-requests/:id" element={<SubmissionDetail />} />
          <Route path="seo-review" element={<SEOReview />} />
          <Route path="client-review" element={<ClientReview />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="revision-requests" element={<RevisionRequests />} />
          <Route path="mlr-review" element={<MLRReview />} />
          <Route path="content-hub" element={<SEOContentHub />} />
          <Route path="audit" element={<AuditTrail />} />
          <Route path="admin" element={<Administration />} />
          <Route path="projects/:clientName" element={<ClientDashboard />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App