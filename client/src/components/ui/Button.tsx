import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantClass: Record<string, string> = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-warm hover:shadow-warm-md focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-1',
  secondary: 'border border-surface-300 dark:border-gray-600 text-primary-500 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-surface-50 dark:hover:bg-gray-700 active:bg-surface-100 focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-1',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-warm focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-1',
  ghost: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-gray-400/50',
  icon: 'p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-accent-500/50',
}

const sizeClass: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg min-h-[32px]',
  md: 'px-4 py-2 text-sm rounded-xl min-h-[38px]',
  lg: 'px-5 py-2.5 text-base rounded-xl min-h-[44px]',
}

export function Button({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
