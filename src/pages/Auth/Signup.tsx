import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'

import { auth, db } from '../../config/Firebase'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const navigate = useNavigate()

  async function handleEmailSignup() {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email,
      displayName,
      messages: [],
      createdAt: new Date()
    })
      .then(() => navigate('/dashboard'))
      .catch(console.error)
  }

  // async function authenticateUser() {
  //   await signIn()
  //   navigate('/dashboard')
  // }

  return (
    <div>
      <h2>Sign Up</h2>

      {/* Email/Password Login */}
      <input type='email' placeholder='Email' onChange={e => setEmail(e.target.value)} />
      <input type='password' placeholder='Password' onChange={e => setPassword(e.target.value)} />
      <input type="text" placeholder='Display Name' onChange={e => setDisplayName(e.target.value)} />
      <button onClick={handleEmailSignup}>Sign Up</button>

      <p>Already have an account? <Link to='/login'>Login</Link></p>
      {/* Google Login */}
      {/* <button onClick={authenticateUser}>
        Continue with Google
      </button> */}
    </div>
  )
}