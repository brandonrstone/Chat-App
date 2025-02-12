import { Navigate, Outlet } from 'react-router-dom'

import { useAuthContext } from '../../hooks/useAuthContext'

export default function ProtectedRoute() {
  const { authUser } = useAuthContext()
  return authUser ? <Outlet /> : <Navigate to='/login' replace />
}