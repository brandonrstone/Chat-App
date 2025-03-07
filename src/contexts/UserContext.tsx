import { createContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { signOut } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, onSnapshot, updateDoc } from 'firebase/firestore'

import { auth, db } from '../config/Firebase'
import { useAuthContext } from '../hooks/useAuthContext'

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
  loading: boolean
  updateDisplayName: (newDisplayName: string) => void
  logout: () => Promise<void>
}

export const UserContext = createContext<UserContextType | null>(null)

export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { authUser, loading: authLoading } = useAuthContext() || {}
  const [user, setUser] = useState<User | null>(null)
  const [recentChatroomUsers, setRecentChatroomUsers] = useState<User[]>([])
  const [newMessages, setNewMessages] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  /*
    This effect runs whenever there are changes to Authentication on the backend
    Heirarchy is: Auth -> User -> Chatroom
  */
  useEffect(() => {
    if (authLoading) return
    if (authUser) {
      const userDocRef = doc(db, 'users', authUser.uid)
      const fetchUser = async () => {
        const userSnap = await getDoc(userDocRef)
        if (userSnap.exists()) {
          setUser({
            uid: authUser.uid,
            displayName: userSnap.data().displayName,
            email: userSnap.data().email,
            createdAt: userSnap.data().createdAt,
            lastSeenTimestamp: userSnap.data().lastSeenTimestamp
          })
        }
        setLoading(false)
      }
      fetchUser()
    } else {
      setUser(null)
      setLoading(false)
    }
  }, [authUser, authLoading])


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

  async function updateDisplayName(newDisplayName: string) {
    if (!auth.currentUser || !newDisplayName) return

    // If the new display name is the same as the current one, just exit
    if (user?.displayName === newDisplayName) return

    try {
      // Check if the display name is already taken
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('displayName', '==', newDisplayName))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        toast.error('That display name is already taken.')
        return
      }

      // Update the user's display name in Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid)
      await updateDoc(userRef, { displayName: newDisplayName })

      // Reflect within local state
      setUser(prevUser => prevUser ? { ...prevUser, displayName: newDisplayName } : null)

      toast.success('Display name updated!')
    } catch (error) {
      console.error('Failed to update display name:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  async function logout() {
    await signOut(auth)
  }

  return (
    <UserContext.Provider value={{ user, recentChatroomUsers, newMessages, setNewMessages, loading, updateDisplayName, logout }}>
      {children}
    </UserContext.Provider>
  )
}
