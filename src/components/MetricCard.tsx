import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  icon: ReactNode
  trend?: 'up' | 'down'
  status?: 'success' | 'warning' | 'danger'
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  trend,
  status = 'success' 
}: MetricCardProps) {
  const statusColors = {
    success: 'text-green-600 bg-green-50',
    warning: 'text-yellow-600 bg-yellow-50',
    danger: 'text-red-600 bg-red-50'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
              {trend === 'down' && <TrendingDown className="h-4 w-4 text-green-600" />}
              <span className="text-sm text-gray-600">{change}</span>
            </div>
          )}
        </div>
        <div className={`rounded-lg p-3 ${statusColors[status]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
