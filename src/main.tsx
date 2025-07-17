import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// Add error handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Query error:', error)
      },
    },
  },
})

console.log('Pharma SEO Dashboard initializing...')
console.log('Environment:', import.meta.env.MODE)
console.log('Base URL:', import.meta.env.BASE_URL)

try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found!')
  }
  
  console.log('Root element found, rendering app...')
  
  const root = ReactDOM.createRoot(rootElement)
  
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  )
  
  console.log('App rendered successfully')
} catch (error) {
  console.error('Failed to initialize app:', error)
  // Show error in the UI
  const errorEl = document.getElementById('error-message')
  if (errorEl) {
    errorEl.style.display = 'block'
    errorEl.textContent = `Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}