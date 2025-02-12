import { useEffect, useState } from 'react'
import { LogOut, Moon, Sun, User } from 'lucide-react'

type DropdownMenuProps = {
  logout: () => void
  fadeIn: boolean
}

export function DropdownMenu({ logout, fadeIn }: DropdownMenuProps) {
  const [darkMode, setDarkMode] = useState<boolean>(false)

  // Set dark mode state based on localStorage on initial load
  useEffect(() => {
    // Check localStorage value and set initial state
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, []) // Run once on component mount

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode
      // Store the theme in localStorage and apply the corresponding class
      localStorage.setItem('theme', newMode ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', newMode)
      return newMode
    })
  }

  return (
    <div className={`absolute -right-1.5 top-12 w-48 bg-white dark:bg-slate-800 border px-2 rounded-md shadow-md transition-opacity duration-300 z-50 ${fadeIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <DropdownItem Icon={User} label='Profile' />
      <div className='border-b' />
      <DropdownItem Icon={darkMode ? Moon : Sun} label={darkMode ? 'Dark' : 'Light'} onClick={toggleDarkMode} />
      <div className='border-b' />
      <DropdownItem Icon={LogOut} label='Logout' onClick={logout} />
    </div>
  )
}

type DropdownItemProps = {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
}

const DropdownItem = ({ Icon, label, onClick }: DropdownItemProps) => (
  <div className='flex items-center my-2 p-1 rounded-md hover:bg-primary/20 cursor-pointer' onClick={onClick}>
    <Icon className='w-5 h-5 mr-2' />
    <span>{label}</span>
  </div>
)
