import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
    <input
      ref={ref}
      className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-150 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 ${error ? 'border-red-300 focus:ring-red-500/30 focus:border-red-500' : 'border-surface-200 dark:border-gray-600 hover:border-surface-300 dark:hover:border-gray-500'} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
))
Input.displayName = 'Input'
