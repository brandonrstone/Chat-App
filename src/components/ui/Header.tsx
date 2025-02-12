import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useUserContext } from '../../hooks/useUserContext'
import { DropdownMenu } from './DropdownMenu'

export function Header() {
  const { user, logout } = useUserContext()
  const [isOpen, setIsOpen] = useState(false)
  const [fadeIn, setFadeIn] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Handles propagation on hamburger - weird but it works when clicking off the ref
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setFadeIn(true)
    } else {
      // Fade out before hiding completely
      setTimeout(() => setFadeIn(false), 300)
    }
  }, [isOpen])

  function handleToggle(e: React.MouseEvent<Element, MouseEvent>) {
    e.stopPropagation()
    setIsOpen(prev => !prev)
  }

  return (
    <div className='w-full absolute top-0 flex justify-between items-center p-4 bg-white dark:bg-slate-800 drop-shadow-lg z-50'>
      <p className='text-slate-400 font-bold'>@{user?.displayName}</p>
      <div ref={menuRef} className='relative'>
        <Hamburger isOpen={isOpen} toggle={handleToggle} />
        {isOpen && <DropdownMenu fadeIn={fadeIn} logout={() => logout().then(() => navigate('/login'))} />}
      </div>
    </div>
  )
}

type HamburgerProps = {
  isOpen: boolean
  toggle: (e: React.MouseEvent) => void
}

const Hamburger = ({ isOpen, toggle }: HamburgerProps) => (
  <div className='flex flex-col justify-evenly items-center w-6 h-4 cursor-pointer' onClick={toggle}>
    <div className={`w-full h-0.5 bg-black dark:bg-white transition-all duration-150 ease-in-out ${isOpen ? 'rotate-45 translate-y-[0.20rem]' : ''}`} />
    <div className={`w-full h-0.5 bg-black dark:bg-white transition-all duration-150 ease-in-out ${isOpen ? '-rotate-45 -translate-y-[0.20rem]' : ''}`} />
  </div>
)