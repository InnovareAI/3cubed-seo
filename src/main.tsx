import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// Add console log to verify app is loading
console.log('Main.tsx is loading...')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Add error boundary for debugging
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any) {
    console.error('Error caught by boundary:', error)
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error details:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <h1 style={{padding: '20px'}}>Something went wrong. Check console for details.</h1>
    }

    return this.props.children
  }
}

console.log('About to render app...')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

console.log('App render called')
