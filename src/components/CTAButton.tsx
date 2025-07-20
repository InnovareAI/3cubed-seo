import React from 'react'
import { Loader2 } from 'lucide-react'

interface CTAButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  loading?: boolean
  disabled?: boolean
  className?: string
}

export default function CTAButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  className = ''
}: CTAButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}