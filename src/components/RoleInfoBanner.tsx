import { Info } from 'lucide-react'

interface RoleInfoBannerProps {
  title: string
  description: string
  bulletPoints: string[]
  variant?: 'blue' | 'green' | 'purple'
}

export default function RoleInfoBanner({
  title,
  description,
  bulletPoints,
  variant = 'blue'
}: RoleInfoBannerProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          title: 'text-green-900',
          text: 'text-green-800'
        }
      case 'purple':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          icon: 'text-purple-600',
          title: 'text-purple-900',
          text: 'text-purple-800'
        }
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          text: 'text-blue-800'
        }
    }
  }

  const classes = getVariantClasses()

  return (
    <div className={`${classes.bg} border ${classes.border} rounded-lg p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <Info className={`h-5 w-5 ${classes.icon} flex-shrink-0 mt-0.5`} />
        <div className="text-sm">
          <p className={`font-medium mb-1 ${classes.title}`}>{title}</p>
          <p className={classes.text}>{description}</p>
          <ul className={`list-disc list-inside mt-1 ${classes.text}`}>
            {bulletPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
