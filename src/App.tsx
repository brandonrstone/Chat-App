import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import Signup from './pages/Auth/Signup'
import Login from './pages/Auth/Login'
import Chatroom from './features/Chatroom/components/Chatroom'
import ProtectedRoute from './components/routing/ProtectedRoute'
import TestVerificationSignUp from './pages/Auth/TestVerificationSignUp'
import NotFound from './components/routing/NotFound'

/*
TODO:

- Dedicated colors for darkmode
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
    <div className='text-black dark:text-white bg-white dark:bg-slate-800'>
      <Router>
        <Routes>
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/test-verification-signup' element={<TestVerificationSignUp />} />
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<Dashboard />} />
            <Route path='/chat/:chatroomId' element={<Chatroom />} />
          </Route>
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  )
}
