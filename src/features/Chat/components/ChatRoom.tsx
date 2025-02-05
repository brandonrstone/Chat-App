import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, doc, getDoc } from 'firebase/firestore'

import { db, auth, User } from '../../../config/Firebase'
import { useUserContext } from '../../../hooks/useUserContext'

import Input from '../../../components/Input'
import Button from '../../../components/Button'
import { ChevronLeft } from 'lucide-react'

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  return (
    <div className='h-screen flex flex-col justify-between'>
      <div className='flex justify-between py-4 p-2 shadow-md'>
        <Link to='/dashboard' >
          <ChevronLeft />
        </Link>
        <h2 className='font-bold'>Chatroom</h2>
        <div />
      </div>

      <div className='flex-1 p-2 overflow-x-scroll'>
        {messages.map(message => (
          <p key={message.id}>
            <strong style={{ color: message.senderId === auth.currentUser?.uid ? 'green' : 'black' }}>{message.senderId === auth.currentUser?.uid ? user?.displayName : otherUser?.displayName}</strong>: {message.text}
          </p>
        ))}

        <div ref={messagesEndRef} />
      </div>


      <div className='flex items-center'>
        <Input className='flex-1' value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder={`Message @${otherUser?.displayName}`} />
        <Button className='py-3' onClick={sendMessage}>Send</Button>
      </div>
    </div>
  )
}
