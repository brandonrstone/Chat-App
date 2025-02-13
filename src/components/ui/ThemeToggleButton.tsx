import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'

import { useThemeContext } from '../../hooks/useThemeContext'

export function ThemeToggleButton() {
  const { darkMode, setDarkMode } = useThemeContext()

  return (
    <div className='flex items-center justify-center'>
      <button className='relative w-14 h-6 bg-green-300 dark:bg-slate-700 rounded-full p-1 flex items-center' onClick={() => setDarkMode(!darkMode)}>
        <Moon className='absolute w-5 h-5 text-black dark:text-white' />
        <Sun className='absolute right-1 w-5 h-5 text-black dark:text-white' />
        <motion.div
          className='w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow-md'
          initial={{ x: darkMode ? 24 : 0 }}
          animate={{ x: darkMode ? 28 : -4 }}
          transition={{ stiffness: 300, damping: 20 }}
        />
      </button>
    </div>
  )
}
