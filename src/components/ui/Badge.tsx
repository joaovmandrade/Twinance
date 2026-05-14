import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  color?: 'purple' | 'green' | 'amber' | 'red' | 'blue' | 'gray'
}

const colorClasses = {
  purple: 'bg-primary-100 text-primary-700',
  green:  'bg-emerald-100 text-emerald-700',
  amber:  'bg-amber-100 text-amber-700',
  red:    'bg-red-100 text-red-700',
  blue:   'bg-blue-100 text-blue-700',
  gray:   'bg-gray-100 text-gray-600',
}

export function Badge({ children, color = 'gray' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        colorClasses[color],
      ].join(' ')}
    >
      {children}
    </span>
  )
}
