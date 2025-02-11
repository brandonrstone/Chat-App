import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { auth, User } from './config/Firebase'

import Signup from './pages/Auth/Signup'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard'
import Chatroom from './features/Chat/components/Chatroom'

export default function App() {
  const [authUser, setAuthUser] = useState<User>()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(authUser => {
      if (authUser == null) return
      setAuthUser(authUser)
    })

    return () => unsubscribe()
  }, [])

  return (
    <Router>
      <Routes>
        <Route path='/' element={authUser ? <Dashboard /> : <Signup />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/chat/:chatroomId' element={<Chatroom />} />
      </Routes>
    </Router>
  )
}