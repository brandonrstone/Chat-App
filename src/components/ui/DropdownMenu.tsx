import { LogOut, User } from 'lucide-react'

import { useThemeContext } from '../../hooks/useThemeContext'

import { ThemeToggleButton } from './ThemeToggleButton'

type DropdownMenuProps = {
  logout: () => void
  fadeIn: boolean
}

export function DropdownMenu({ logout, fadeIn }: DropdownMenuProps) {
  const { darkMode } = useThemeContext()

  return (
    <div className={`absolute -right-1.5 top-12 w-48 bg-white dark:bg-slate-800 border px-2 rounded-md shadow-md transition-opacity duration-300 z-50 ${fadeIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <DropdownItem Icon={User} label='Profile' />
      <div className='border-b' />
      <div className='flex items-center space-x-2 my-2 p-1'>
        <ThemeToggleButton />
        <p>{darkMode ? 'Dark' : 'Light'}</p>
      </div>
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
