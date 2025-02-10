import { createContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, onSnapshot } from 'firebase/firestore'

import { auth, db, Message } from '../config/Firebase'

interface ChatroomsContextType {
  chatrooms: Message[]
  setChatrooms: React.Dispatch<React.SetStateAction<Message[]>>
}

export const ChatroomsContext = createContext<ChatroomsContextType | undefined>(undefined)

export const ChatroomsContextProvider = ({ children }: { children: ReactNode }) => {
  const [chatrooms, setChatrooms] = useState<Message[]>([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, authUser => {
      if (authUser) {
        // Listen to the chatrooms for the authenticated user
        const chatroomsRef = collection(db, 'users', authUser.uid, 'chatrooms')
        const unsubChatrooms = onSnapshot(chatroomsRef, snapshot => {
          const fetchedChatrooms = snapshot.docs.map(doc => {
            const data = doc.data()

            return {
              id: doc.id,
              senderId: data.senderId || '',
              text: data.text || '',
              timestamp: data.timestamp || 0,
              ...data,
            } as Message
          })

          setChatrooms(fetchedChatrooms)
        })

        return () => unsubChatrooms()
      } else {
        // No user, so clear chatrooms
        setChatrooms([])
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <ChatroomsContext.Provider value={{ chatrooms, setChatrooms }}>
      {children}
    </ChatroomsContext.Provider>
  )
}
