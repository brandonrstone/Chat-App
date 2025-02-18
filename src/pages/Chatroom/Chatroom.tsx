import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { ArrowUp } from 'lucide-react'

import { db, auth } from '../../config/Firebase'
import type { Message } from '../../contexts/ChatroomsContext'

import { useUserContext } from '../../hooks/useUserContext'
import { useChatroomsContext } from '../../hooks/useChatroomsContext'

import { formatTimestamp } from '../../utils/formatters'
import { Button } from '../../components/ui/Button'
import { ChatroomHeader } from '../../components/ui/ChatroomHeader'
import { Input } from '../../components/ui/Input'
import { SkeletonText } from '../../components/ui/SkeletonText'

export default function Chatroom() {
  const { user } = useUserContext()
  const { chatrooms, fetchRecipients, recipients, sendMessage } = useChatroomsContext()
  const { chatroomId } = useParams()
  const [currentChatroom] = chatrooms.filter(chatroom => chatroom.id === chatroomId)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesDivEndpoint = useRef<HTMLDivElement | null>(null)
  const isInitialRender = useRef(true)

  // Firestore message listener
  useEffect(() => {
    if (!chatroomId) return

    const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages')
    const q = query(messagesRef, orderBy('timestamp', 'asc'))

    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)))
    })

    return () => unsubscribe()
  }, [chatroomId])

  // Handle the visuals of messages in the chatroom
  useEffect(() => {
    if (messages.length === 0) return

    // On initial render, scroll instantly
    if (isInitialRender.current) {
      messagesDivEndpoint.current?.scrollIntoView({ behavior: 'auto' })
      isInitialRender.current = false
    } else {
      // After initial render, scroll smoothly
      messagesDivEndpoint.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Fetch other chatroom users
  useEffect(() => {
    if (chatroomId) fetchRecipients(chatroomId)
  }, [chatroomId, fetchRecipients])

  // Send message by pressing enter key
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (chatroomId == null || newMessage.trim() === '') return

    if (e.key === 'Enter') {
      sendMessage(chatroomId, newMessage)
      setNewMessage('')
      e.preventDefault()
    }
  }

  function handleButtonSubmit() {
    if (chatroomId && newMessage.trim() !== '') {
      sendMessage(chatroomId, newMessage)
      setNewMessage('')
    }
  }

  return (
    <div className='h-screen flex flex-col justify-between'>
      {/* Chatroom Header */}
      <ChatroomHeader recipients={currentChatroom.usersData.filter(chatUsers => chatUsers?.displayName !== user?.displayName).map(u => u.displayName).join(', ')} />

      {/* Messages List */}
      <div className='flex-1 pb-6 p-2 mt-14 overflow-y-scroll'>
        {messages.map(message => (
          <div key={message.id}>
            <div>
              <strong className={`${message.senderId === auth.currentUser?.uid ? 'text-primary' : 'text-black dark:text-green-300'}`}>
                {message.senderId === auth.currentUser?.uid
                  ? user?.displayName
                  : currentChatroom.usersData.find(u => u.uid === message.senderId)?.displayName || <SkeletonText width='54px' height='10px' />}
              </strong>
              <span className='pl-2 text-sm text-slate-400'>{message.timestamp ? formatTimestamp(message.timestamp) : ''}</span>
            </div>
            <p>{message.text}</p>
          </div>
        ))}
        <div ref={messagesDivEndpoint} />
      </div>

      {/* Input Field */}
      <div className='flex items-center'>
        <div className='w-full flex justify-center items-center mx-2 mb-2 px-2 bg-white dark:bg-slate-800 border rounded-xl shadow-lg -translate-y-2'>
          <Input
            className='w-full h-full flex-1 shadow-none border-none placeholder:text-slate-400 dark:placeholder:text-slate-400'
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder={`Message @${recipients.length > 0 ? recipients[0].displayName : 'someone'}`}
            onKeyDown={handleKeyDown}
          />
          <Button size='sm' className='h-full flex items-center justify-center' pill onClick={handleButtonSubmit} >
            <ArrowUp className='text-black dark:text-white' />
          </Button>
        </div>
      </div>
    </div>
  )
}
