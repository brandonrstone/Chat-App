import { useState } from 'react'

import { useUserContext } from '../hooks/useUserContext'

export function Header() {
  const { user } = useUserContext()

  return (
    <div className='w-full absolute top-0 flex justify-end items-center py-4 p-2 drop-shadow-lg bg-white'>
      <div className='flex justify-center items-center space-x-2'>
        <p className='font-bold'>{user?.displayName}</p>
        <Hamburger />
      </div>
    </div>
  )
}

function Hamburger() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleHamburger = () => setIsOpen(!isOpen)

  return (
    <div className="flex flex-col justify-evenly items-center w-6 h-4 cursor-pointer" onClick={toggleHamburger}>
      <div className={`w-full h-0.5 bg-black transition-all duration-150 ease-in-out ${isOpen ? 'rotate-45 translate-y-[0.20rem]' : ''}`} />
      <div className={`w-full h-0.5 bg-black transition-all duration-150 ease-in-out ${isOpen ? '-rotate-45 -translate-y-[0.20rem]' : ''}`} />
    </div>
  )
}