import React from 'react'
import { getInitials } from '../../utils/format'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  className?: string
}

const sizeClasses = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

export function Avatar({ name, size = 'md', color = 'bg-primary-600', className = '' }: AvatarProps) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded-full font-bold text-white select-none',
        color,
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {getInitials(name)}
    </span>
  )
}
