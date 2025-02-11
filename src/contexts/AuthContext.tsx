import { createContext, useEffect, useState } from 'react'
import { auth } from '../config/Firebase'
import type { User } from 'firebase/auth'

type AuthContextType = {
  authUser: User | null
}

export const AuthContext = createContext<AuthContextType>({ authUser: null })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null)

  useEffect(() => {
    // This must explicitly handle user state update
    const unsubscribe = auth.onAuthStateChanged(user => setAuthUser(user))

    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ authUser }}>
      {children}
    </AuthContext.Provider>
  )
}