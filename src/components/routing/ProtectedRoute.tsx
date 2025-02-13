import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '../../hooks/useAuthContext'
import { LoadingEllipsis } from '../ui/LoadingEllipses'

export default function ProtectedRoute() {
  const { authUser, loading } = useAuthContext()

  if (loading) return <LoadingEllipsis />

  return authUser ? <Outlet /> : <Navigate to='/login' replace />
}