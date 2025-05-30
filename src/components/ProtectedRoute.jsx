import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/authContext'

const ProtectedRoute = () => {
  const { user, loading } = useAuth()
console.log(user)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0C0E15]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute