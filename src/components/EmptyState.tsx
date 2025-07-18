import { ReactNode } from 'react'
import { Settings } from 'lucide-react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  showDemoButton?: boolean
  onShowDemo?: () => void
}

export default function EmptyState({
  icon,
  title,
  description,
  showDemoButton = false,
  onShowDemo
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <div className="h-12 w-12 text-gray-400 mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
      {showDemoButton && onShowDemo && (
        <button
          onClick={onShowDemo}
          className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Settings className="h-4 w-4 mr-2" />
          Show Demo Data
        </button>
      )}
    </div>
  )
}
