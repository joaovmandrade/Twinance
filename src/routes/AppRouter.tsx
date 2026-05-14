import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { CoupleProvider } from '../contexts/CoupleContext'
import { ExpenseProvider } from '../contexts/ExpenseContext'
import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from '../layouts/AppLayout'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { CoupleSetupPage } from '../pages/CoupleSetupPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ExpensesPage } from '../pages/ExpensesPage'
import { ProfilePage } from '../pages/ProfilePage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CoupleProvider>
          <ExpenseProvider>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Semi-protected: needs auth but not couple */}
              <Route
                path="/couple-setup"
                element={
                  <ProtectedRoute>
                    <CoupleSetupPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected app */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Default */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </ExpenseProvider>
        </CoupleProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
