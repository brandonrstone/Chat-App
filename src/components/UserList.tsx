import { useNavigate } from 'react-router-dom'

import { getOrCreateChatroom } from '../features/Chat/service/ChatService'
import { useUserContext } from '../hooks/useUserContext'
import { User } from '../config/Firebase'

export function UserList({ users }: { users: User[] }) {
  const { user } = useUserContext()
  const navigate = useNavigate()

  // Navigate to chatroom
  async function startChat(otherUserId: string) {
    if (!user) return
    const chatroomId = await getOrCreateChatroom(user.uid, otherUserId)
    navigate(`/chat/${chatroomId}`)
  }

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map(u =>
          u.uid !== user?.uid ? (
            <li key={u.uid} onClick={() => startChat(u.uid)} style={{ cursor: "pointer" }}>
              {u.displayName}
            </li>
          ) : null
        )}
      </ul>
    </div>
  )
}