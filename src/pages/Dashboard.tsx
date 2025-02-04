import { useNavigate } from 'react-router-dom'

import { logout } from '../config/Firebase'
import { useUserContext } from '../hooks/useUserContext'

export default function Dashboard() {
  const { user, loading } = useUserContext()
  const navigate = useNavigate()

  function logoutUser() {
    logout()
      .then(() => navigate('/login'))
      .catch(console.error)
  }

  return (
    <div>
      {loading ? <h2>Loading...</h2> : <h2>Welcome, {user?.displayName || 'User'}</h2>}
      <button onClick={logoutUser}>Logout</button>
    </div>
  )
}