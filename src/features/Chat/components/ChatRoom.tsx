import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { ArrowUp } from 'lucide-react'

import { db, auth, User } from '../../../config/Firebase'
import { useUserContext } from '../../../hooks/useUserContext'
import { formatTimestamp } from '../../../utils/formatters'

import { Button } from '../../../components/Button'
import { ChatroomHeader } from './ChatroomHeader'
import { Input } from '../../../components/Input'
import { LoadingEllipsis } from '../../../components/LoadingEllipses'

type Message = {
  id: string
  senderId: string
  text: string
  timestamp: Date
}

export default function Chatroom() {
  const { user } = useUserContext()
  const { chatroomId } = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const isInitialRender = useRef(true)

  // Handle scrolling window behavior
  useEffect(() => {
    // Prevent scroll when there are no messages
    if (messages.length === 0) return

    // First render --> scroll instantly
    if (isInitialRender.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
      isInitialRender.current = false // Set to false after first render
    } else {
      // On subsequent renders (new messages) --> use smooth scrolling
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Get current messages for a particular chatroom
  useEffect(() => {
    if (!chatroomId) return

    const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages')
    const q = query(messagesRef, orderBy('timestamp', 'asc'))

    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)))
    })

    return () => unsubscribe()
  }, [chatroomId])

  // Fetch the information of other user
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!chatroomId || !user) return

      const chatroomRef = doc(db, 'chatrooms', chatroomId)
      const chatroomSnap = await getDoc(chatroomRef)

      if (chatroomSnap.exists()) {
        const { users } = chatroomSnap.data()
        const otherUserId = users.find((uid: string) => uid !== user.uid)

        if (otherUserId) {
          const userRef = doc(db, 'users', otherUserId)
          const userSnap = await getDoc(userRef)

          if (userSnap.exists()) {
            setOtherUser(userSnap.data() as User)
          }
        }
      }
    }

    fetchOtherUser()
  }, [chatroomId, user])

  useEffect(() => {
    if (!chatroomId) return

    const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages')

    const q = query(messagesRef, orderBy('timestamp', 'asc'))

    // Subscribe to Firestore updates
    const unsubscribe = onSnapshot(q, snapshot => {
      const snapshotMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // This needs to be converted from FS timestamp to Date
        timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null
      }))
      setMessages(snapshotMessages as Message[])
    })

    return () => unsubscribe()
  }, [chatroomId])

  async function sendMessage() {
    if (!newMessage.trim() || !auth.currentUser) return

    const newMessageData: Message = {
      id: crypto.randomUUID(), // Temporary ID for React's key prop
      senderId: auth.currentUser.uid,
      text: newMessage,
      timestamp: new Date() // Set local timestamp immediately
    }

    // Optimistically update UI
    setMessages(prevMessages => [...prevMessages, newMessageData])

    // Send message to Firestore
    await addDoc(collection(db, 'chatrooms', chatroomId!, 'messages'), {
      senderId: auth.currentUser.uid,
      text: newMessage,
      timestamp: serverTimestamp() // Firestore will replace this later
    })

    setNewMessage('')
  }

  // Send message by hitting enter key
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && newMessage.trim() !== '') {
      sendMessage()
      setNewMessage('')
      e.preventDefault()
    }
  }

  return (
    <div className='h-screen flex flex-col justify-between'>
      <ChatroomHeader recipient={otherUser?.displayName} />

      <div className='flex-1 pb-6 p-2 overflow-x-scroll'>
        {messages.map(message => (
          <div key={message.id}>
            <div>
              <strong className={`${message.senderId === auth.currentUser?.uid ? 'text-primary' : 'text-black'}`}>{message.senderId === auth.currentUser?.uid ? user?.displayName : otherUser?.displayName}</strong>
              <span className='pl-2 text-sm text-slate-400'>{message.timestamp ? formatTimestamp(message.timestamp) : ''}</span>
            </div>
            <p>{message.text}</p>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>


      <div className='flex items-center'>
        <div className='w-full flex justify-center items-center mx-2 mb-2 px-2 bg-white border rounded-xl shadow-lg -translate-y-2'>
          <Input
            className='w-full h-full flex-1 shadow-none'
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)} placeholder={`Message @${otherUser?.displayName ?? <LoadingEllipsis />}`}
            onKeyDown={handleKeyDown}
          />
          <Button className='h-full flex items-center justify-center' pill onClick={sendMessage}>
            <ArrowUp />
          </Button>
        </div>
      </div>
    </div>
  )
}
