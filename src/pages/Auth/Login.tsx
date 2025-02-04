import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'

import { auth } from '../../config/Firebase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  async function handleEmailLogin() {
    await signInWithEmailAndPassword(auth, email, password)
      .then(() => navigate('/dashboard'))
      .catch(console.error)
  }

  return (
    <div>
      <h2>Login</h2>

      {/* Email/Password Login */}
      <input type='email' placeholder='Email' onChange={e => setEmail(e.target.value)} />
      <input type='password' placeholder='Password' onChange={e => setPassword(e.target.value)} />
      <button onClick={handleEmailLogin}>Login</button>

      <p>Need an account? <Link to='/signup'>Signup</Link></p>
      {/* Google Login */}
      {/* <button onClick={authenticateUser}>
        Continue with Google
      </button> */}
    </div>
  )
}
