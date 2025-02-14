import { createContext, useEffect, useState } from 'react'
import { auth } from '../config/Firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'

type AuthContextType = {
  authUser: User | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setAuthUser(user)
      // Stop loading when auth state is resolved
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ authUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}