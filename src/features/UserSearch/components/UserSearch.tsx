import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { ChevronRight } from 'lucide-react'

import { db, type User } from '../../../config/Firebase'

import { getOrCreateChatroom } from '../../Chatroom/service/ChatService'
import { useUserContext } from '../../../hooks/useUserContext'

import { Input } from '../../../components/ui/Input'
import { Pill } from '../../../components/ui/Pill'

export function UserSearch() {
  const { user, recentChatroomUsers } = useUserContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [userSuggestions, setUserSuggestions] = useState<User[]>([])
  const navigate = useNavigate()

  async function handleUserSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const queryText = e.target.value
    setSearchQuery(queryText)

    if (queryText.length > 1) {
      // Perform the Firestore query
      const q = query(
        collection(db, 'users'),
        where('displayName', '>=', queryText),
        where('displayName', '<=', queryText + '\uf8ff') // This should match case-insensitive search
      )

      const querySnapshot = await getDocs(q)
      const suggestedUsers: User[] = []
      querySnapshot.forEach(doc => {
        if (doc.data().uid === user?.uid) return

        const userData = doc.data()
        suggestedUsers.push(userData as User)
      })

      setUserSuggestions(suggestedUsers)
    } else {
      // Clear if input < 1 char
      setUserSuggestions([])
    }
  }

  async function startChat(otherUserId: string) {
    if (!user) return
    const chatroomId = await getOrCreateChatroom(user.uid, otherUserId)
    navigate(`/chat/${chatroomId}`)
  }

  return (
    <div className='relative sm:w-[300px] md:w-[400px] flex flex-col justify-center items-center'>
      <div className='mb-2 font-semibold'>Chat App v1.0</div>
      <Input className='w-full rounded-full bg-white dark:bg-slate-800 shadow-md placeholder:text-black dark:outline-white dark:border outline-0 dark:placeholder:text-white placeholder:text-sm' onChange={handleUserSearch} value={searchQuery} placeholder='Search by username...' />

      <div className='absolute top-[5rem] w-full flex justify-center items-center'>
        {searchQuery.length > 1 ? (
          <div className='w-full max-h-60 mt-2 p-2 bg-white dark:bg-slate-800 border rounded-md shadow-md overflow-y-auto'>
            {userSuggestions.map((user, index) => (
              <div key={index} className='flex justify-between items-center py-1 px-2 rounded-md hover:bg-primary/20 cursor-pointer group' onClick={() => startChat(user.uid)}>
                <span>@{user.displayName}</span>
                <ChevronRight className='w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-[-10px] transition-all duration-300 ease-out' />
              </div>
            ))}
          </div>
        ) : (
          // If not searching, render recent chat users
          <div className='w-full max-h-60 flex justify-center items-center flex-wrap mt-2 rounded-md'>
            {recentChatroomUsers
              .map(user => (
                <Pill key={user.uid} displayName={user.displayName} userId={user.uid} onClick={() => startChat(user.uid)} />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
