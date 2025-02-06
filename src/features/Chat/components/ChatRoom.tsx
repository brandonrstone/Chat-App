import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { format } from 'date-fns'
import { ArrowUp, ChevronLeft } from 'lucide-react'

import { db, auth, User } from '../../../config/Firebase'
import { useUserContext } from '../../../hooks/useUserContext'

import Input from '../../../components/Input'
import Button from '../../../components/Button'

type Message = {
  id: string
  senderId: string
  text: string
  timestamp: Date
}

export default function ChatRoom() {
  const { user } = useUserContext()
  const { chatroomId } = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Scroll to the end of a div upon sending a message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Get current messages from particular chatroom
  useEffect(() => {
    if (!chatroomId) return

    const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages')
    const q = query(messagesRef, orderBy('timestamp', 'asc'))

    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)))
    })

    return () => unsubscribe()
  }, [chatroomId])

  async function sendMessage() {
    if (!newMessage.trim() || !auth.currentUser) return

    await addDoc(collection(db, 'chatrooms', chatroomId!, 'messages'), {
      senderId: auth.currentUser.uid,
      text: newMessage,
      timestamp: serverTimestamp()
    })

    setNewMessage('')
  }

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

  const formatTimestamp = (timestamp: Date) => {
    if (!timestamp) return ''

    const messageDate = new Date(timestamp)
    const now = new Date()

    const isToday = messageDate.toDateString() === now.toDateString()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = messageDate.toDateString() === yesterday.toDateString()

    const timeFormat = format(messageDate, 'h:mm a') // e.g., '11:10 AM'

    if (isToday) return `Today at ${timeFormat}`
    if (isYesterday) return `Yesterday at ${timeFormat}`

    // Return format as --> '2/2/2024 at 7:00PM'
    return format(messageDate, "M/d/yyyy 'at' h:mm a")
  }

  // Use enter key to send message
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && newMessage.trim() !== '') {
      sendMessage()
      setNewMessage('')
      event.preventDefault()
    }
  }

  return (
    <div className='h-screen flex flex-col justify-between'>
      <div className='w-full absolute top-0 flex justify-between py-4 p-2 drop-shadow-lg bg-white'>
        <Link to='/dashboard' >
          <ChevronLeft className='text-center text-primary hover:text-primary/90 active:scale-90' />
        </Link>
        <h2 className='font-bold'>Chatroom</h2>
        <div />
      </div>

      <div className='flex-1 pb-6 p-2 overflow-x-scroll'>
        {messages.map(message => (
          <>
            <div key={message.id}>
              <strong className={`${message.senderId === auth.currentUser?.uid ? 'text-primary' : 'text-black'}`}>{message.senderId === auth.currentUser?.uid ? user?.displayName : otherUser?.displayName}</strong>
              <span className='pl-2 text-sm text-slate-400'>{message.timestamp ? formatTimestamp(message.timestamp) : ''}</span>
            </div>
            <p>{message.text}</p>
          </>
        ))}

        <div ref={messagesEndRef} />
      </div>


      <div className='flex items-center'>
        <div className='w-full flex justify-center items-center mx-2 mb-2 px-2 bg-white border rounded-lg shadow-lg -translate-y-2'>
          <Input
            className='h-full flex-1 shadow-none'
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)} placeholder={`Message @${otherUser?.displayName}`}
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
