import { useEffect, useState } from 'react'
import { LogOut, Moon, Sun, User } from 'lucide-react'

type DropdownMenuProps = {
  logout: () => void
  fadeIn: boolean
}

// TODO: Dropdown is behind chat search
export function DropdownMenu({ logout, fadeIn }: DropdownMenuProps) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  return (
    <div className={`absolute -right-1.5 top-12 w-48 bg-white dark:bg-slate-800 border px-2 rounded-md shadow-md transition-opacity duration-300 z-50 ${fadeIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <DropdownItem Icon={User} label='Profile' />
      <div className='border-b' />
      <DropdownItem Icon={darkMode ? Moon : Sun} label={darkMode ? 'Dark' : 'Light'} onClick={() => setDarkMode(!darkMode)} />
      <div className='border-b' />
      <DropdownItem Icon={LogOut} label='Logout' onClick={logout} />
    </div>
  )
}

type DropdownItemProps = {
  // Type for Lucide Icon
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