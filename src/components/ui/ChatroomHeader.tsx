import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

import { LoadingEllipsis } from './LoadingEllipses'

type HeaderProps = {
  recipient?: string
}

export function ChatroomHeader({ recipients }: { recipients?: string }) {
  return (
    <div className='w-full absolute top-0 flex justify-between items-center py-4 p-2 drop-shadow-lg bg-white dark:bg-slate-800'>
      <Link to='/' >
        <ChevronLeft className='text-center text-primary hover:text-primary/90 active:scale-90 transition-all duration-300' />
      </Link>

      {recipients ? (
        <h2 className='font-bold'>Chat with {recipients}</h2>
      ) : (
        <LoadingEllipsis />
      )}

      <div />
    </div>
  )
}