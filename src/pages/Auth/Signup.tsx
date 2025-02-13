import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { MessageCircleMore } from 'lucide-react'

import { auth, db } from '../../config/Firebase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { LoadingEllipsis } from '../../components/ui/LoadingEllipses'
import { FirebaseError } from 'firebase/app'

const SignupSchema = z.object({
  displayName: z.string().min(2, 'Display Name is not long enough.'),
  email: z.string().email('Email address is not valid.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string().min(6, 'Password confirmation is required.')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword']
})

type SignupFormData = z.infer<typeof SignupSchema>

export default function Signup() {
  const navigate = useNavigate()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<SignupFormData>({ resolver: zodResolver(SignupSchema) })

  async function handleEmailSignup(data: SignupFormData) {
    const { email, password, displayName } = data

    try {
      // Check if the displayName already exists in Firestore
      const usersRef = collection(db, 'users')
      const displayNameQuery = query(usersRef, where('displayName', '==', displayName))
      const querySnapshot = await getDocs(displayNameQuery)

      // If displayName is already taken, prevent signup
      if (!querySnapshot.empty) {
        return setError('displayName', { type: 'manual', message: 'Display name already taken.' })
      }

      // Proceed with user creation if the displayName is available
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Add the user to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName,
        createdAt: new Date()
      })

      navigate('/')
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          setError('password', { type: 'manual', message: 'Email already in use.' })
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

      <h2 className='mb-2 text-xl font-bold text-primary'>Sign Up</h2>

      {/* Email/Password Signup Form */}
      <form className='flex flex-col justify-center items-center space-y-1' onSubmit={handleSubmit(handleEmailSignup)}>
        <Input type='text' placeholder='Display Name' {...register('displayName')} />
        <Input type='email' placeholder='Email' {...register('email')} />
        <Input type='password' placeholder='Password' {...register('password')} />
        <Input type='password' placeholder='Confirm Password' {...register('confirmPassword')} />
        <Button className='w-full py-2' size='md' type='submit' disabled={isSubmitting}>{isSubmitting ? <LoadingEllipsis /> : 'Sign Up'}</Button>
      </form>

      <div className='relative flex justify-center'>
        <p className='mt-2'>Already have an account? <Link className='text-blue-500 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer' to='/login'>Login</Link></p>
        <div className='absolute top-10'>
          {errors.displayName && <p className='text-xs text-red-400'>{errors.displayName.message}</p>}
          {errors.email && <p className='text-xs text-red-400'>{errors.email.message}</p>}
          {errors.password && <p className='text-xs text-red-400'>{errors.password.message}</p>}
          {errors.confirmPassword && <p className='text-xs text-red-400'>{errors.confirmPassword.message}</p>}
        </div>
      </div>
    </div>
  )
}
