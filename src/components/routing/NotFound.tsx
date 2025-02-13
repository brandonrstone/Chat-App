import { Link } from 'react-router-dom'

import { Button } from '../ui/Button'

export default function NotFound() {
  return (
    <div className='h-screen flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800'>
      <h1 className='text-6xl font-bold text-black dark:text-gray-200'>404</h1>
      <p className='text-xl text-gray-600 dark:text-gray-400'>Oops! Page not found 🤯</p>
      <Link to='/'>
        <Button>Take me home!</Button>
      </Link>
    </div>
  )
}
