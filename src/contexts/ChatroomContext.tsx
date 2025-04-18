import { createContext, useState, useCallback, useEffect } from 'react'
import { Unsubscribe } from 'firebase/auth'
import { addDoc, collection, doc, FieldValue, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, Timestamp, where } from 'firebase/firestore'

import { db } from '../config/Firebase'

import type { User } from './UserContext'

import { useUserContext } from '../hooks/useUserContext'

type Chatroom = {
  id: string
  chatroomName: string
  chatroomType: 'direct' | 'group'
  createdAt: Timestamp
  isActive: boolean
  isPrivate: boolean
  lastActivity: Timestamp
  users: string[]
  usersData: User[]
}

export type Message = {
  id: string
  senderId: string
  text: string
  timestamp: FieldValue | Timestamp
}

type ChatroomsContextType = {
  currentUserChatrooms: Chatroom[]
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  getOrCreateChatroom: (userId1: string, userId2: string) => Promise<string>
  fetchMessagesForChatroom: (chatroomId: string) => Unsubscribe | undefined
  sendMessage: (chatroomId: string, messageText: string) => Promise<void>
}

export const ChatroomsContext = createContext<ChatroomsContextType | null>(null)

export const ChatroomsContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUserContext()
  const [currentUserChatrooms, setCurrentUserChatrooms] = useState<Chatroom[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  // Fetch all chatrooms user is currently in
  useEffect(() => {
    async function fetchCurrentUserChatrooms() {
      if (!user) return

      const chatroomsQuerySnapshot = await getDocs(query(
        collection(db, 'chatrooms'),
        where('users', 'array-contains', user?.uid))
      )

      const chatroomsWithUsers = await Promise.all(
        chatroomsQuerySnapshot.docs.map(async chatroomDoc => {
          const chatroom = chatroomDoc.data()
          const chatroomId = chatroomDoc.id

          // Fetch user details for each uid in the chatroom
          const usersData = await Promise.all(
            chatroom.users.map(async (uid: string) => {
              const userRef = doc(db, 'users', uid)
              const userSnap = await getDoc(userRef)
              return userSnap.exists() ? { uid, ...userSnap.data() } : null
            })
          )

          return { id: chatroomId, ...chatroom, usersData: usersData.filter(Boolean) }
        })
      )

      setCurrentUserChatrooms(chatroomsWithUsers as Chatroom[]) // Update state once
    }

    fetchCurrentUserChatrooms()
  }, [user])

  // Create or get existing chatroom; immediately update the state
  const getOrCreateChatroom = useCallback(async (user1Id: string, user2Id: string) => {
    // Query for an existing chatroom between these two users
    const querySnapshot = await getDocs(query(collection(db, 'chatrooms'), where('users', 'array-contains', user1Id)))

    for (const doc of querySnapshot.docs) {
      const chatroom = doc.data()
      if (chatroom.users.includes(user2Id)) {
        return doc.id
      }
    }

    // If there is no existing chatroom, create one
    const newChatroomRef = await addDoc(collection(db, 'chatrooms'), {
      users: [user1Id, user2Id],
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp(),
      chatroomName: '',
      isPrivate: true,
      isActive: true,
      chatroomType: 'direct'
    })

    const newChatroomId = newChatroomRef.id

    // Fetch user details for both users
    const userRefs = [doc(db, 'users', user1Id), doc(db, 'users', user2Id)]
    const userDocs = await Promise.all(userRefs.map(ref => getDoc(ref)))
    const usersData = userDocs.map(docSnap => (docSnap.exists() ? { uid: docSnap.id, ...docSnap.data() } : null)).filter(Boolean)

    // Update chatroom list before Firestore updates; could be improved
    setCurrentUserChatrooms(prevChatrooms => [
      ...prevChatrooms,
      {
        id: newChatroomId,
        users: [user1Id, user2Id],
        createdAt: new Date(),
        lastActivity: new Date(),
        chatroomName: '',
        isPrivate: true,
        isActive: true,
        chatroomType: 'direct',
        usersData
      }
    ] as Chatroom[])

    return newChatroomId
  }, [])

  const fetchMessagesForChatroom = useCallback((chatroomId: string) => {
    if (!chatroomId) return

    // Query order: db --> chatrooms --> id --> messages collection
    const messagesQuery = query(collection(db, 'chatrooms', chatroomId, 'messages'), orderBy('timestamp', 'asc'))

    const unsubscribe = onSnapshot(messagesQuery, snapshot => {
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

    // No need for manual UI update... I guess Firestore onSnapshot handles it :)
    await addDoc(collection(db, 'chatrooms', chatroomId, 'messages'), newMessageData)
  }

  return (
    <ChatroomsContext.Provider value={{ currentUserChatrooms, messages, setMessages, getOrCreateChatroom, fetchMessagesForChatroom, sendMessage }}>
      {children}
    </ChatroomsContext.Provider>
  )
}
