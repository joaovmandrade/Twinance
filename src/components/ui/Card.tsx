import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export function Card({ children, className = '', onClick, padding = 'md' }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        'bg-white rounded-3xl shadow-card',
        paddingClasses[padding],
        onClick ? 'cursor-pointer hover:shadow-card-hover transition-shadow duration-200' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
