import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { useThemeContext } from './hooks/useThemeContext'

import Signup from './pages/Auth/Signup'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard'
import Chatroom from './pages/Chatroom/Chatroom'
import TestVerificationSignUp from './pages/Auth/TestVerificationSignUp'
import Profile from './pages/Profile'
import ProtectedRoute from './components/routing/ProtectedRoute'
import NotFound from './components/routing/NotFound'

/*
TODO:
- Enable Firebase functions to do 2FA Code
- Dedicated colors for darkmode
- Make Brandon a contact show for all
- Friend system
- Display multiple users if there are multiple in a chat
*/

export default function App() {
  const { darkMode } = useThemeContext()

  return (
    <div className='text-black dark:text-white bg-white dark:bg-slate-800'>
      <ToastContainer position='top-center' autoClose={4000} hideProgressBar={false} newestOnTop={true} closeButton={true} toastStyle={{ backgroundColor: darkMode ? 'rgb(30 41 59 / var(--tw-bg-opacity, 1))' : 'white', color: darkMode ? 'white' : '#b590ff' }} />
      <Router>
        <Routes>
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/test-verification-signup' element={<TestVerificationSignUp />} />
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<Dashboard />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/chat/:chatroomId' element={<Chatroom />} />
          </Route>
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  )
}
