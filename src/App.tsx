import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import Signup from './pages/Auth/Signup'
import Login from './pages/Auth/Login'
import Chatroom from './features/Chatroom/components/Chatroom'
import ProtectedRoute from './components/routing/ProtectedRoute'
import TestVerificationSignUp from './pages/Auth/TestVerificationSignUp'

/*
TODO:

- If search results === 0 don't return a drop down
- Dark mode support
- Incorrect username/password feedback
- email verification codes for signup
- Profile
- Settings
- Make Brandon a contact show for all
- Don't allow duplicate user names
- Friend system

*/

export default function App() {
  return (
    <html className='text-black dark:text-white bg-white dark:bg-slate-800'>
      <Router>
        <Routes>
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/test-verification-signup' element={<TestVerificationSignUp />} />
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<Dashboard />} />
            <Route path='/chat/:chatroomId' element={<Chatroom />} />
          </Route>
        </Routes>
      </Router>
    </html>
  )
}
