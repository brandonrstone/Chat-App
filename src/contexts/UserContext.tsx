import { createContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'

import { auth, db } from '../config/Firebase'

export type User = {
  uid: string,
  email: string
  displayName: string
  createdAt: Date
  lastSeenTimestamp: Date
}


type UserContextType = {
  user: User | null
  recentChatroomUsers: User[]
  newMessages: Record<string, number>
  setNewMessages: React.Dispatch<React.SetStateAction<Record<string, number>>>
  resetUnreadMessages: (chatroomId: string) => void
  loading: boolean
  logout: () => Promise<void>
}

export const UserContext = createContext<UserContextType | null>(null)

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [recentChatroomUsers, setRecentChatroomUsers] = useState<User[]>([])
  const [newMessages, setNewMessages] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  // Initial use of handling the Auth user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async authUser => {
      if (authUser) {
        const userDocRef = doc(db, 'users', authUser.uid)
        const userSnap = await getDoc(userDocRef)

        if (userSnap.exists()) {
          setUser({
            uid: authUser.uid,
            displayName: userSnap.data().displayName,
            email: userSnap.data().email,
            createdAt: userSnap.data().createdAt,
            lastSeenTimestamp: userSnap.data().lastSeenTimestamp // Ensure correct field name
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

  // Fetch recent chatroom then tally up and return unread message count
  useEffect(() => {
    if (!user) return

    const chatroomsRef = collection(db, 'chatrooms')
    const q = query(chatroomsRef, where('users', 'array-contains', user.uid), orderBy('lastActivity', 'desc'), limit(5))

    // Real-time listener for changes in chatrooms collection
    const unsubscribe = onSnapshot(q, async snapshot => {
      const otherUserIds = new Set<string>()

      snapshot.forEach(doc => {
        const chatroomData = doc.data()
        const participants: string[] = chatroomData.users
        const otherUserId = participants.find(uid => uid !== user.uid)

        if (otherUserId) otherUserIds.add(otherUserId)

        // Handle unread message count based on last message timestamp in Firestore
        const chatroomId = doc.id
        const lastMessageTimestamp = chatroomData.lastMessageTimestamp
        if (lastMessageTimestamp && lastMessageTimestamp > user.lastSeenTimestamp) {
          setNewMessages(prev => ({ ...prev, [chatroomId]: (prev[chatroomId] || 0) + 1 }))
        }
      })

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

    return () => unsubscribe() // Cleanup listener
  }, [user])

  // This resets unread messages count when visiting a chatroom
  const resetUnreadMessages = (chatroomId: string) => {
    setNewMessages(prev => {
      const newState = { ...prev }

      // Remove the unread count for this chatroom
      delete newState[chatroomId]
      return newState
    })
  }

  async function logout() {
    await signOut(auth)
  }

  return (
    <UserContext.Provider value={{ user, recentChatroomUsers, newMessages, setNewMessages, resetUnreadMessages, loading, logout }}>
      {children}
    </UserContext.Provider>
  )
}
