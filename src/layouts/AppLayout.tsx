import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from '../components/layout/BottomNav'
import { FAB } from '../components/layout/FAB'
import { AddExpenseModal } from '../components/expenses/AddExpenseModal'

export function AppLayout() {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="max-w-lg mx-auto pb-24 px-4">
        <Outlet />
      </main>
      <BottomNav />
      <FAB onClick={() => setAddOpen(true)} />
      <AddExpenseModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
