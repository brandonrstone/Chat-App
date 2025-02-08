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
          u.uid !== user?.uid
            ? <UserCard key={u.uid} user={u} startChat={startChat} />
            : null
        )}
      </ul>
    </div>
  )
}

type UserCardProps = {
  user: User
  startChat: (uid: string) => void
}

function UserCard({ user, startChat }: UserCardProps) {

  return (
    <div className='p-4 shadow-md cursor-pointer' onClick={() => startChat(user.uid)}>
      {user.displayName}
    </div>
  )
}