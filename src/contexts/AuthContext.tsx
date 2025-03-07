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

  // Loads the user and handles previous auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setAuthUser(user)
      setLoading(false)
    })

    if (!auth.currentUser) {
      console.error('User is not signed in. Firestore access denied.');
    }

    console.log('Auth: ', auth)

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ authUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}