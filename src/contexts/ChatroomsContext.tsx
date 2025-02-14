import { createContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { addDoc, collection, getDocs, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore'

import { auth, db, Message } from '../config/Firebase'

type ChatroomsContextType = {
  chatrooms: Message[]
  setChatrooms: React.Dispatch<React.SetStateAction<Message[]>>
  getOrCreateChatroom: (userId1: string, userId2: string) => Promise<string>
}

export const ChatroomsContext = createContext<ChatroomsContextType | null>(null)

export const ChatroomsContextProvider = ({ children }: { children: ReactNode }) => {
  const [chatrooms, setChatrooms] = useState<Message[]>([])

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

    // Query for an existing chatroom between these two users
    const q = query(chatroomsRef, where('users', 'array-contains', user1Id))
    const querySnapshot = await getDocs(q)

    for (const doc of querySnapshot.docs) {
      const chatroom = doc.data()
      if (chatroom.users.includes(user2Id)) {
        return doc.id
      }
    }

    // If no chatroom exists, create a new one
    const newChatroomRef = await addDoc(chatroomsRef, {
      users: [user1Id, user2Id],
      createdAt: serverTimestamp()
    })

    return newChatroomRef.id
  }

  return (
    <ChatroomsContext.Provider value={{ chatrooms, setChatrooms, getOrCreateChatroom }}>
      {children}
    </ChatroomsContext.Provider>
  )
}
