import { createContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { onAuthStateChanged, Unsubscribe } from 'firebase/auth'
import { addDoc, collection, doc, FieldValue, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, Timestamp, where } from 'firebase/firestore'

import { auth, db } from '../config/Firebase'

import type { User } from './UserContext'
import { useUserContext } from '../hooks/useUserContext'

export type Message = {
  id: string
  senderId: string
  text: string
  timestamp: FieldValue | Timestamp
}

type ChatroomsContextType = {
  chatrooms: Message[]
  setChatrooms: React.Dispatch<React.SetStateAction<Message[]>>
  otherUsers: User[]
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  newMessage: string
  setNewMessage: React.Dispatch<React.SetStateAction<string>>
  getOrCreateChatroom: (userId1: string, userId2: string) => Promise<string>
  fetchOtherChatroomUsers: (chatroomId: string) => Promise<void>
  fetchMessagesForChatroom: (chatroomId: string) => Unsubscribe | undefined
  sendMessage: (chatroomId: string, messageText: string) => Promise<void>
}

export const ChatroomsContext = createContext<ChatroomsContextType | null>(null)

export const ChatroomsContextProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUserContext()
  const [otherUsers, setOtherUsers] = useState<User[]>([])
  const [chatrooms, setChatrooms] = useState<Message[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')

  const setChatroomsMemo = useCallback((newChatrooms: Message[]) => {
    setChatrooms(newChatrooms)
  }, [])

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, authUser => {
      if (authUser) {
        const chatroomsRef = collection(db, 'users', authUser.uid, 'chatrooms')
        const unsubChatrooms = onSnapshot(chatroomsRef, snapshot => {
          const fetchedChatrooms = snapshot.docs.map(doc => {
            const data = doc.data()

            return {
              id: doc.id,
              senderId: data.senderId || '',
              text: data.text || '',
              timestamp: data.timestamp ? data.timestamp.toDate() : new Date(0),
              ...data,
            } as Message
          })
          setChatroomsMemo(fetchedChatrooms)
        })

        return unsubChatrooms
      } else {
        setChatroomsMemo([])
      }
    })

    return unsubscribeAuth
  }, [setChatroomsMemo])

  async function getOrCreateChatroom(user1Id: string, user2Id: string) {
    const chatroomsRef = collection(db, 'chatrooms')

    // Query for an existing chatroom between these two users (first step)
    const q = query(chatroomsRef, where('users', 'array-contains', user1Id))

    const querySnapshot = await getDocs(q)

    // Check if user2 is in the chatroom users array
    for (const doc of querySnapshot.docs) {
      const chatroom = doc.data()
      if (chatroom.users.includes(user2Id)) {
        return doc.id
      }
    }

    // If no chatroom exists, create a new one
    const newChatroomRef = await addDoc(chatroomsRef, {
      users: [user1Id, user2Id],
      createdAt: serverTimestamp(),
      lastActivity: new Date(),
      chatroomName: '',
      isPrivate: true,
      isActive: true,
      chatroomType: 'direct'
    })

    return newChatroomRef.id
  }

  async function fetchOtherChatroomUsers(chatroomId: string) {
    if (!chatroomId || !user) return

    const chatroomRef = doc(db, 'chatrooms', chatroomId)
    const chatroomSnap = await getDoc(chatroomRef)

    if (chatroomSnap.exists()) {
      const { users } = chatroomSnap.data()
      // Filter out the current user's ID from the list of users
      const otherUserIds = users.filter((uid: string) => uid !== user.uid)

      // Loop through each user in the chatroom (except the current user)
      for (const otherUserId of otherUserIds) {
        const userRef = doc(db, 'users', otherUserId)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          setOtherUsers(prevOtherUsers => {
            const newUser = userSnap.data() as User
            // Prevent adding the same user multiple times
            if (!prevOtherUsers.some(u => u.uid === newUser.uid)) {
              return [...prevOtherUsers, newUser]
            }
            return prevOtherUsers
          })
        }
      }
    }
  }

  const fetchMessagesForChatroom = useCallback((chatroomId: string) => {
    if (!chatroomId) return

    const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages')
    const q = query(messagesRef, orderBy('timestamp', 'asc'))

    const unsubscribe = onSnapshot(q, snapshot => {
      const snapshotMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null
      }))
      setMessages(snapshotMessages as Message[])
    })

    return unsubscribe
  }, [])

  async function sendMessage(chatroomId: string, messageText: string) {
    if (!user || !messageText.trim()) return

    const newMessageData = {
      senderId: user.uid,
      text: messageText,
      timestamp: serverTimestamp()
    }

    // No need for manual UI update; Firestore `onSnapshot` will handle it
    await addDoc(collection(db, 'chatrooms', chatroomId, 'messages'), newMessageData)

    setNewMessage('')
  }


  return (
    <ChatroomsContext.Provider value={{ chatrooms, setChatrooms, otherUsers, messages, setMessages, newMessage, setNewMessage, getOrCreateChatroom, fetchOtherChatroomUsers, fetchMessagesForChatroom, sendMessage }}>
      {children}
    </ChatroomsContext.Provider>
  )
}
