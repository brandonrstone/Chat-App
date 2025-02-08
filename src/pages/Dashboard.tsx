import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'

import { db, logout, User } from '../config/Firebase'
import { useUserContext } from '../hooks/useUserContext'

import { Button } from '../components/Button'
import { UserList } from '../components/UserList'

export default function Dashboard() {
  const { user, loading } = useUserContext()
  const [users, setUsers] = useState<User[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users')
      const usersSnapshot = await getDocs(usersCollection)
      const usersList = usersSnapshot.docs.map(doc => doc.data() as User)
      setUsers(usersList)
    }

    fetchUsers()
  }, [])

  function logoutUser() {
    logout()
      .then(() => navigate('/login'))
      .catch(console.error)
  }

  return (
    <div className='p-2'>
      {loading ? <h2>Loading...</h2> : <h2>Welcome, {user?.displayName || 'User'}</h2>}
      <UserList users={users} />
      <Button onClick={logoutUser}>Logout</Button>
    </div>
  )
}
