import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'

import { auth } from '../../config/Firebase'

import { Input } from '../../components/Input'
import { Button } from '../../components/Button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  console.log(email, password)

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault()
    console.log('Logged 1')
    await signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        console.log('Logged 2')
        navigate('/dashboard')
      })
      .catch(console.error)
  }

  return (
    <div className='h-screen flex flex-col justify-center items-center'>
      <h2 className='mb-2 text-xl font-bold text-green-400'>Login</h2>

      <form className='flex flex-col justify-center items-center space-y-2' onSubmit={handleEmailLogin}>
        <Input type='email' placeholder='Email' onChange={e => setEmail(e.target.value)} />
        <Input type='password' placeholder='Password' onChange={e => setPassword(e.target.value)} />
        <Button className='w-full py-2' size='md'>Login</Button>
      </form>

      <p className='mt-2'>Need an account? <Link className='text-blue-500 hover:text-blue-600 cursor-pointer' to='/signup'>Sign Up</Link></p>
    </div>
  )
}
