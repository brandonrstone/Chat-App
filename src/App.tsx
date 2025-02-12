import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import Signup from './pages/Auth/Signup'
import Login from './pages/Auth/Login'
import Chatroom from './features/Chatroom/components/Chatroom'
import ProtectedRoute from './components/routing/ProtectedRoute'
import TestVerificationSignUp from './pages/Auth/TestVerificationSignUp'

/*
TODO:

1.) In SignUp/Login, put an icon or some branding
2.) Dark mode support
3.) email verification codes for signup
4.) Profile
5.) Settings
6.) Make Brandon a contact show for all
7.) Don't allow duplicate user names

*/

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/test-verification-signup' element={<TestVerificationSignUp />} />
        <Route element={<ProtectedRoute />}>
          <Route path='/' element={<Dashboard />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/chat/:chatroomId' element={<Chatroom />} />
        </Route>
      </Routes>
    </Router>
  )
}
