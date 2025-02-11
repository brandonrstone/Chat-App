import { useContext } from 'react'

import { AuthContext } from '../contexts/AuthContext'

export function useAuthContext() {
  const authContext = useContext(AuthContext)
  if (authContext == null) throw Error('Must call AuthContext from within AuthContext provider.')
  return authContext
}