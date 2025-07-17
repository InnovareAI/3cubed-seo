import { Routes, Route } from 'react-router-dom'
import DashboardLayout from './components/DashboardLayout'
import Submissions from './pages/Submissions'
import SubmissionDetail from './pages/SubmissionDetail'
import Analytics from './pages/Analytics'
import ContentLibrary from './pages/ContentLibrary'
import Compliance from './pages/Compliance'
import HITLReview from './pages/HITLReview'
import ProjectsOverview from './pages/ProjectsOverview'
import ClientDashboard from './pages/ClientDashboard'
import ContentGeneration from './pages/ContentGeneration'
import ContentRequests from './pages/ContentRequests'
import AuditTrail from './pages/AuditTrail'
import Administration from './pages/Administration'

function App() {
  console.log('App component rendered')
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<ProjectsOverview />} />
          <Route path="projects" element={<ProjectsOverview />} />
          <Route path="projects/:clientName" element={<ClientDashboard />} />
          <Route path="content-generation/:clientName" element={<ContentGeneration />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="submissions/:id" element={<SubmissionDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="content" element={<ContentLibrary />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="review" element={<HITLReview />} />
          <Route path="requests" element={<ContentRequests />} />
          <Route path="audit" element={<AuditTrail />} />
          <Route path="admin" element={<Administration />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
