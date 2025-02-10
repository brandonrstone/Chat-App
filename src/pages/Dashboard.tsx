import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'

import { db, logout, User } from '../config/Firebase'

import { useUserContext } from '../hooks/useUserContext'

import { Button } from '../components/Button'
import { UserList } from '../components/UserList'
import { useChatroomsContext } from '../hooks/useChatroomsContext'

import { UserSearch } from '../features/UserSearch/components/UserSearch'

export default function Dashboard() {
  const { user, loading } = useUserContext()
  const { chatrooms } = useChatroomsContext()
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

  console.log(chatrooms)

  return (
    <div className='p-2'>
      {loading ? <h2>Loading...</h2> : <h2>Welcome, {user?.displayName || 'User'}</h2>}
      <UserSearch />
      <UserList users={users} />
      <h1>My Conversations</h1>
      <Button onClick={logoutUser}>Logout</Button>
    </div>
  )
}
