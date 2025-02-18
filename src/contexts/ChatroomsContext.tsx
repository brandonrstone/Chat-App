import { createContext, useState, ReactNode, useCallback, useEffect } from 'react'
import { Unsubscribe } from 'firebase/auth'
import { addDoc, collection, doc, DocumentData, FieldValue, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, Timestamp, where } from 'firebase/firestore'

import { db } from '../config/Firebase'

import type { User } from './UserContext'

import { useUserContext } from '../hooks/useUserContext'

export type Message = {
  id: string
  senderId: string
  text: string
  timestamp: FieldValue | Timestamp
}

type ChatroomsContextType = {
  chatrooms: DocumentData[]
  recipients: User[]
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  getOrCreateChatroom: (userId1: string, userId2: string) => Promise<string>
  fetchRecipients: (chatroomId: string) => Promise<void>
  fetchMessagesForChatroom: (chatroomId: string) => Unsubscribe | undefined
  sendMessage: (chatroomId: string, messageText: string) => Promise<void>
}

export const ChatroomsContext = createContext<ChatroomsContextType | null>(null)

export const ChatroomsContextProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUserContext()
  const [recipients, setRecipients] = useState<User[]>([])
  const [chatrooms, setChatrooms] = useState<DocumentData[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    async function fetchChatrooms() {
      const chatroomsRef = collection(db, 'chatrooms')
      const q = query(chatroomsRef, where('users', 'array-contains', user?.uid))
      const querySnapshot = await getDocs(q)

      const chatroomsWithUsers = await Promise.all(
        querySnapshot.docs.map(async (chatroomDoc) => {
          const chatroom = chatroomDoc.data()

          // Add the Firestore document ID (chatroom ID) to the object
          const chatroomId = chatroomDoc.id

          // Fetch user details for each uid in the chatroom
          const usersData = await Promise.all(
            chatroom.users.map(async (uid: string) => {
              const userRef = doc(db, 'users', uid)
              const userSnap = await getDoc(userRef)
              return userSnap.exists() ? { uid, ...userSnap.data() } : null
            })
          )

          return { id: chatroomId, ...chatroom, usersData: usersData.filter(Boolean) } // Include the ID
        })
      )

      setChatrooms(chatroomsWithUsers) // Update state once
    }

    fetchChatrooms()
  }, [user])


  const getOrCreateChatroom = useCallback(async (user1Id: string, user2Id: string) => {
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
  }, [])

  const fetchRecipients = useCallback(async (chatroomId: string) => {
    if (!chatroomId || !user) return

    // Clear previous chatroom users immediately to prevent flickering
    setRecipients([])

    const chatroomRef = doc(db, 'chatrooms', chatroomId)
    const chatroomSnap = await getDoc(chatroomRef)

    if (chatroomSnap.exists()) {
      const { users } = chatroomSnap.data()
      const otherUserIds = users.filter((uid: string) => uid !== user.uid)

      if (otherUserIds.length === 0) {
        setRecipients([])
        return
      }

      // Fetch all user documents in one go
      const userDocs = await Promise.all(
        otherUserIds.map((otherUserId: string) => getDoc(doc(db, 'users', otherUserId)))
      )

      // Extract valid user data
      const fetchedUsers = userDocs
        .filter(doc => doc.exists())
        .map(doc => ({ uid: doc.id, ...doc.data() } as User))

      // Update state with only the users in the current chatroom
      setRecipients(fetchedUsers)
    }
  }, [user])

  const fetchMessagesForChatroom = useCallback((chatroomId: string) => {
    if (!chatroomId) return

    // db --> chatrooms --> id --> messages collection
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

    // No need for manual UI update... I guess Firestore onSnapshot handles it :)
    await addDoc(collection(db, 'chatrooms', chatroomId, 'messages'), newMessageData)
  }

  return (
    <ChatroomsContext.Provider value={{ chatrooms, recipients, messages, setMessages, getOrCreateChatroom, fetchRecipients, fetchMessagesForChatroom, sendMessage }}>
      {children}
    </ChatroomsContext.Provider>
  )
}
