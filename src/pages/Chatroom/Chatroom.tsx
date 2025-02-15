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

export default function Chatroom() {
  const { user } = useUserContext()
  const { newMessage, setNewMessage, fetchOtherChatroomUsers, otherUsers, sendMessage } = useChatroomsContext()
  const { chatroomId } = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
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

  // Scroll to the bottom of the chat when messages change
  useEffect(() => {
    if (messages.length === 0) return

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: isInitialRender.current ? 'auto' : 'smooth' })
    })

    isInitialRender.current = false
  }, [messages])

  // Fetch other chatroom users
  useEffect(() => {
    if (chatroomId) fetchOtherChatroomUsers(chatroomId)
  }, [chatroomId, fetchOtherChatroomUsers])

  // Send message by pressing enter key
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (chatroomId == null || newMessage.trim() === '') return

    if (e.key === 'Enter') {
      sendMessage(chatroomId, newMessage)
      setNewMessage('')
      e.preventDefault()
    }
  }

  return (
    <div className="h-screen flex flex-col justify-between">
      {/* Chatroom Header */}
      <ChatroomHeader recipients={otherUsers.map(user => user.displayName).join(', ')} />

      {/* Messages List */}
      <div className="flex-1 pb-6 p-2 mt-14 overflow-y-scroll">
        {messages.map((message) => (
          <div key={message.id}>
            <div>
              <strong className={`${message.senderId === auth.currentUser?.uid ? 'text-primary' : 'text-black dark:text-green-300'}`}>
                {message.senderId === auth.currentUser?.uid
                  ? user?.displayName
                  : otherUsers.find(u => u.uid === message.senderId)?.displayName || 'Unknown'}
              </strong>
              <span className="pl-2 text-sm text-slate-400">{message.timestamp ? formatTimestamp(message.timestamp) : ''}</span>
            </div>
            <p>{message.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="flex items-center">
        <div className="w-full flex justify-center items-center mx-2 mb-2 px-2 bg-white dark:bg-slate-800 border rounded-xl shadow-lg -translate-y-2">
          <Input
            className="w-full h-full flex-1 shadow-none border-none placeholder:text-slate-400 dark:placeholder:text-slate-400"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder={`Message @${otherUsers.length > 0 ? otherUsers[0].displayName : 'someone'}`}
            onKeyDown={handleKeyDown}
          />
          <Button
            size="sm"
            className="h-full flex items-center justify-center"
            pill
            onClick={() => {
              if (chatroomId && newMessage.trim() !== '') {
                sendMessage(chatroomId, newMessage)
                setNewMessage('')
              }
            }}
          >
            <ArrowUp className="text-black dark:text-white" />
          </Button>
        </div>
      </div>
    </div>
  )
}
