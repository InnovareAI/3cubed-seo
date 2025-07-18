import { ReactNode } from 'react'
import { 
  ChevronRight,
  Clock,
  Target,
  Building2
} from 'lucide-react'
import { format } from 'date-fns'

interface ReviewCardProps {
  submission: any
  onClick: () => void
  statusBadge: ReactNode
  priorityLevel: 'High' | 'Medium' | 'Low'
  highlights?: {
    label: string
    items: string[]
    icon: ReactNode
    colorClass: string
  }[]
  metrics?: {
    label: string
    value: string | number
    icon: ReactNode
  }[]
  roleSpecificContent?: ReactNode
  expandedView?: boolean
}

export default function ReviewCard({
  submission,
  onClick,
  statusBadge,
  priorityLevel,
  highlights,
  metrics,
  roleSpecificContent,
  expandedView = false
}: ReviewCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {submission.product_name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {submission.therapeutic_area} • {submission.stage}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(priorityLevel)}`}>
              {priorityLevel}
            </span>
          </div>
        </div>

        {/* Role-specific content */}
        {roleSpecificContent}

        {/* Key Information Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Audience:</span>
            <span className="font-medium text-gray-900 truncate">
              {submission.target_audience?.join(', ') || 'Not specified'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Submitted:</span>
            <span className="font-medium text-gray-900">
              {format(new Date(submission.created_at), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Submitter:</span>
            <span className="font-medium text-gray-900 truncate">
              {submission.submitter_name}
            </span>
          </div>
        </div>

        {/* Metrics */}
        {metrics && metrics.length > 0 && (
          <div className="flex items-center gap-4 mb-4 text-sm">
            {metrics.map((metric, index) => (
              <div key={index} className="flex items-center gap-1">
                {metric.icon}
                <span className="text-gray-600">{metric.label}:</span>
                <span className="font-semibold text-gray-900">{metric.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Highlights */}
        {highlights && highlights.length > 0 && (
          <div className="space-y-2 mb-4">
            {highlights.map((highlight, index) => (
              <div key={index}>
                <div className="flex items-center gap-2 mb-1">
                  {highlight.icon}
                  <span className="text-xs font-medium text-gray-700">{highlight.label}:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {highlight.items.slice(0, expandedView ? undefined : 3).map((item, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${highlight.colorClass}`}
                    >
                      {item}
                    </span>
                  ))}
                  {!expandedView && highlight.items.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{highlight.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Medical Indication if present */}
        {submission.medical_indication && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm">
              <span className="font-medium text-gray-700">Medical Indication:</span>{' '}
              <span className="text-gray-900">{submission.medical_indication}</span>
            </p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClick}
          className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <span>Begin Review</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
