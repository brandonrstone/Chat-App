import { createContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'

import { auth, db, User } from '../config/Firebase'

type UserContextType = {
  user: User | null
  recentChatroomUsers: User[]
  loading: boolean
  logout: () => Promise<void>
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [recentChatroomUsers, setRecentChatroomUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Handle user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Fetch document from Firestore
        const userDocRef = doc(db, 'users', authUser.uid)
        const userSnap = await getDoc(userDocRef)

        if (userSnap.exists()) {
          setUser({
            uid: authUser.uid,
            displayName: userSnap.data().displayName,
            email: userSnap.data().email,
            createdAt: userSnap.data().createdAt
          })
        } else {
          console.log('User document not found')
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // TODO: Get these to order correctly by the last activity
  useEffect(() => {
    if (!user) return

    const chatroomsRef = collection(db, 'chatrooms')
    const q = query(chatroomsRef, where('users', 'array-contains', user.uid), orderBy('lastActivity', 'desc'), limit(5))

    // Real-time listener for changes in chatrooms collection
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const otherUserIds = new Set<string>()

      snapshot.forEach(doc => {
        const chatroomData = doc.data()
        const participants: string[] = chatroomData.users
        const otherUserId = participants.find(uid => uid !== user.uid)

        if (otherUserId) otherUserIds.add(otherUserId)
      })

      // Fetch user details for each unique user ID
      if (otherUserIds.size > 0) {
        const usersRef = collection(db, 'users')
        const usersQuery = query(usersRef, where('uid', 'in', Array.from(otherUserIds)))
        const usersSnapshot = await getDocs(usersQuery)

        const usersList: User[] = usersSnapshot.docs.map(doc => doc.data() as User)
        setRecentChatroomUsers(usersList)
      } else {
        setRecentChatroomUsers([])
      }
    })

    return () => unsubscribe() // Clean up listener
  }, [user])

  async function logout() {
    await signOut(auth)
  }

  return (
    <UserContext.Provider value={{ user, recentChatroomUsers, loading, logout }}>
      {children}
    </UserContext.Provider>
  )
}

