import React from 'react'
import { Plus } from 'lucide-react'

interface FABProps {
  onClick: () => void
}

export function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Adicionar gasto"
      className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 active:scale-95 transition-all duration-150 flex items-center justify-center"
    >
      <Plus size={26} strokeWidth={2.5} />
    </button>
  )
}
