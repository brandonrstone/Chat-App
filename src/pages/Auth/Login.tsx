import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { MessageCircleMore } from 'lucide-react'

import { auth } from '../../config/Firebase'

import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { LoadingEllipsis } from '../../components/ui/LoadingEllipses'

const LoginSchema = z.object({
  email: z.string().email('Email address is not valid.'),
  password: z.string().min(6, 'Invalid password.')
})

type LoginFormData = z.infer<typeof LoginSchema>

export default function Login() {
  const navigate = useNavigate()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginFormData>({ resolver: zodResolver(LoginSchema) })
  const location = useLocation()

  async function handleEmailLogin(data: LoginFormData) {
    const { email, password } = data
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate(location.state?.from?.pathname || '/')
    } catch (error) {
      if (error instanceof FirebaseError) {
        // Handle specific Firebase authentication errors
        if (error.code === 'auth/invalid-credential') {
          setError('password', { type: 'manual', message: 'Invalid email or password.' })
        } else {
          setError('email', { type: 'manual', message: 'An unexpected error occurred. Please try again.' })
        }
      }
    }
  }

  return (
    <div className='h-screen flex flex-col justify-center items-center'>
      <div className='relative flex justify-center items-center mb-12'>
        <h1 className='font-poppins text-5xl font-extrabold'>Chat.</h1>
        <MessageCircleMore className='absolute bottom-6 left-32 w-12 h-12 text-primary' />
      </div>

      <h2 className='mb-2 text-xl font-semibold text-primary'>Login</h2>

      <form className='flex flex-col justify-center items-center space-y-2' onSubmit={handleSubmit(handleEmailLogin)}>
        <Input type='text' placeholder='Email' {...register('email')} />
        <Input type='password' placeholder='Password' {...register('password')} />
        <Button className='w-full py-2' size='md' type='submit' disabled={isSubmitting}>
          {isSubmitting ? <LoadingEllipsis /> : 'Login'}
        </Button>
      </form>

      <div className='relative flex justify-center'>
        <p className='mt-2'>Need an account? <Link className='text-blue-500 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all' to='/signup'>Sign Up</Link></p>
        <div className='absolute top-10'>
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>
      </div>
    </div>
  )
}
