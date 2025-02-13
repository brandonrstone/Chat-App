import { useContext } from 'react'

import { ThemeContext } from '../contexts/ThemeContext'

export function useThemeContext() {
  const themeContext = useContext(ThemeContext)
  if (themeContext == null) throw Error('Must call ThemeContext from within ThemeContextProvider')
  return themeContext
}