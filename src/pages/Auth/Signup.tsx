import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

import { auth, db } from '../../config/Firebase'

import { Button } from '../../components/Button'
import { Input } from '../../components/Input'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const navigate = useNavigate()

  async function handleEmailSignup(e: FormEvent) {
    e.preventDefault()

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email,
      displayName,
      messages: [],
      createdAt: new Date()
    })
      .then(() => {
        console.log('Logged')
        navigate('/dashboard')
      })
      .catch(console.error)
  }

  return (
    <div className='h-screen flex flex-col justify-center items-center'>
      <h2 className='mb-2 text-xl font-bold text-primary'>Sign Up</h2>

      {/* Email/Password Login */}
      <form className='flex flex-col justify-center items-center space-y-2' onSubmit={handleEmailSignup}>
        <Input className='shadow-md' type='email' placeholder='Email' onChange={e => setEmail(e.target.value)} />
        <Input className='shadow-md' type='password' placeholder='Password' onChange={e => setPassword(e.target.value)} />
        <Input className='shadow-md' type="text" placeholder='Display Name' onChange={e => setDisplayName(e.target.value)} />
        <Button className='w-full py-2' size='md' onClick={handleEmailSignup}>Sign Up</Button>
      </form>

      <p className='mt-2'>Already have an account? <Link className='text-blue-500 hover:text-blue-600 cursor-pointer' to='/login'>Login</Link></p>
    </div>
  )
}