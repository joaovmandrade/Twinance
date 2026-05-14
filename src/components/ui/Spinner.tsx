import React from 'react'

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={[
        'inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600',
        className,
      ].join(' ')}
      role="status"
      aria-label="Carregando..."
    />
  )
}
