import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListOrdered, User } from 'lucide-react'

const tabs = [
  { to: '/dashboard',  label: 'Início',   Icon: LayoutDashboard },
  { to: '/expenses',   label: 'Gastos',   Icon: ListOrdered },
  { to: '/profile',    label: 'Perfil',   Icon: User },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 safe-bottom">
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-3 text-xs font-medium transition-colors',
                isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'text-primary-600' : 'text-gray-400'}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
