import { createContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

import { auth, db, User } from '../config/Firebase'

interface UserContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async authUser => {
      if (authUser) {

        // Fetch document from Firestore, *getDock is one-time fetch
        const userDocRef = doc(db, 'users', authUser.uid)
        const userSnap = await getDoc(userDocRef)

        if (userSnap.exists()) {
          setUser({
            uid: authUser.uid,
            displayName: userSnap.data().displayName,
            email: userSnap.data().email,
            createdAt: userSnap.data().createdAt,
            messages: []
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  async function logout() {
    signOut(auth)
  }

  return (
    <UserContext.Provider value={{ user, loading, logout }}>
      {children}
    </UserContext.Provider>
  )
}
