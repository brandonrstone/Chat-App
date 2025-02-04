import React, { useEffect, useState, type ReactElement } from 'react'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'

import { auth, db, User } from '../config/Firebase'

type UserContextType = {
  user: User
}

export const UserContext = React.createContext<UserContextType | null>(null)

export const UserContextProvider = ({ children }: { children: ReactElement }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return // Ensure user is logged in

      // Reference to Firestore doc, one-time
      const userDocRef = doc(db, 'users', auth.currentUser.uid)
      const userSnap = await getDoc(userDocRef)

      if (userSnap.exists()) {
        setUser(prevUser => {
          if (prevUser == null) return null

          return {
            ...prevUser,
            createdAt: userSnap.data().createdAt,
            displayName: userSnap.data().displayName,
            email: userSnap.data().email,
            uid: userSnap.data().uid,
          }
        })
      } else {
        console.log('No such document!')
      }
    }

    fetchUserData()
  }, [])

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  )
}