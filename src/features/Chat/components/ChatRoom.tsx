import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'

import { db, auth } from '../../../config/Firebase'

type Message = {
  id: string
  senderId: string
  text: string
  timestamp: Date
}

export default function ChatRoom() {
  const { chatroomId } = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    if (!chatroomId) return

    // Get current messages from particular chatroom
    const messagesRef = collection(db, 'chatrooms', chatroomId, 'messages')
    const q = query(messagesRef, orderBy('timestamp', 'asc'))

    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)))
    })

    return () => unsubscribe()
  }, [chatroomId])

  const sendMessage = async () => {
    if (!newMessage.trim() || !auth.currentUser) return

    await addDoc(collection(db, 'chatrooms', chatroomId!, 'messages'), {
      senderId: auth.currentUser.uid,
      text: newMessage,
      timestamp: serverTimestamp()
    })

    setNewMessage('')
  }

  return (
    <div>
      <h2>Chatroom</h2>
      <div>
        {messages.map((msg) => (
          <p key={msg.id} style={{ color: msg.senderId === auth.currentUser?.uid ? 'blue' : 'black' }}>
            {msg.text}
          </p>
        ))}
      </div>
      <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder='Type a message...' />
      <button onClick={sendMessage}>Send</button>
    </div>
  )
}
