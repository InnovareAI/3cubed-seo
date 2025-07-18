import { ReactNode } from 'react'
import { Settings } from 'lucide-react'

interface StatusIndicator {
  color: string
  label: string
}

interface ReviewPageHeaderProps {
  title: string
  description: string
  icon: ReactNode
  queueCount: number
  showDemoToggle?: boolean
  isDemoMode?: boolean
  onDemoToggle?: () => void
  statusIndicators?: StatusIndicator[]
}

export default function ReviewPageHeader({
  title,
  description,
  icon,
  queueCount,
  showDemoToggle = false,
  isDemoMode = false,
  onDemoToggle,
  statusIndicators = []
}: ReviewPageHeaderProps) {
  return (
    <div className="bg-white shadow rounded-lg px-6 py-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            {icon}
            {title}
            {isDemoMode && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Demo Data
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {queueCount} {queueCount === 1 ? 'item' : 'items'}
            </span>
          </h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {showDemoToggle && onDemoToggle && (
            <button
              onClick={onDemoToggle}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              {isDemoMode ? 'Live Data' : 'Demo Data'}
            </button>
          )}
          
          {statusIndicators.length > 0 && (
            <div className="flex items-center gap-6 text-sm">
              {statusIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${indicator.color} rounded-full`}></div>
                  <span className="text-gray-600">{indicator.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
