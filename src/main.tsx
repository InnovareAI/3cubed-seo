import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Temporary test app to diagnose CSS issue
function TestApp() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
            Pharma SEO Dashboard - Diagnostic Test
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Testing both inline styles and Tailwind CSS...
          </p>
          
          {/* Test with Tailwind classes */}
          <div className="bg-blue-500 text-white p-4 rounded mb-4">
            <h2 className="text-xl font-bold">Tailwind Test</h2>
            <p>If this box is blue with white text, Tailwind CSS is working!</p>
          </div>
          
          {/* Test with inline styles */}
          <div style={{ backgroundColor: '#10b981', color: 'white', padding: '16px', borderRadius: '4px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Inline Styles Test</h2>
            <p>This box uses inline styles - it should be green with white text.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

console.log('Main.tsx loaded - rendering test app...')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
)