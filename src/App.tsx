import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { auth, User } from './config/Firebase'
import Dashboard from './pages/Dashboard'
import Signup from './pages/Auth/Signup'
import Login from './pages/Auth/Login'
import ChatRoom from './features/Chat/components/ChatRoom'

export default function App() {
  const [user, setUser] = useState<User>()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(authUser => {
      setUser(authUser)
    })
    return () => unsubscribe()
  }, [])

  console.log('Current user: ', auth.currentUser)

  return (
    <Router>
      <Routes>
        <Route path='/' element={user ? <Dashboard /> : <Signup />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path="/chat/:chatroomId" element={<ChatRoom />} />
      </Routes>
    </Router>
  )
}