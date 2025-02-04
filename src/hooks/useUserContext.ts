import { useContext } from 'react'

import { UserContext } from '../contexts/UserContext'

export function useUserContext() {
  const userContext = useContext(UserContext)
  if (userContext == null) throw Error('Must call UserContext from with UserContextProvider')
  return userContext
}