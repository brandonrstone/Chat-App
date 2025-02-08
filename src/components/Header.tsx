import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

type HeaderProps = {
  recipient?: string
}

export function Header({ recipient }: HeaderProps) {
  return (
    <div className='w-full absolute top-0 flex justify-between py-4 p-2 drop-shadow-lg bg-white'>
      <Link to='/dashboard' >
        <ChevronLeft className='text-center text-primary hover:text-primary/90 active:scale-90 transition-all duration-300' />
      </Link>
      <h2 className='font-bold'>Chat with {recipient}</h2>
      <div />
    </div>
  )
}
