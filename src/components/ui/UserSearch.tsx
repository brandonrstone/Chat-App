import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { ChevronRight, MessageCircleMore } from 'lucide-react'

import { db, type User } from '../../config/Firebase'

import { useUserContext } from '../../hooks/useUserContext'

import { Input } from './Input'
import { Pill } from './Pill'
import { SkeletonPill } from './SkeletonPill'
import { useChatroomsContext } from '../../hooks/useChatroomsContext'

export function UserSearch() {
  const { user, recentChatroomUsers } = useUserContext()
  const { getOrCreateChatroom } = useChatroomsContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [userSuggestions, setUserSuggestions] = useState<User[]>([])
  const navigate = useNavigate()

  async function handleUserSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const queryText = e.target.value
    setSearchQuery(queryText)

    if (queryText.length > 0) {
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
      <div className='relative flex justify-center items-center mb-3'>
        <h1 className='font-poppins text-5xl font-extrabold'>Chat.</h1>
        <MessageCircleMore className='absolute bottom-6 left-32 w-12 h-12 text-primary' />
      </div>

      <Input className='w-full rounded-full placeholder:text-slate-400 dark:placeholder:text-slate-400' onChange={handleUserSearch} value={searchQuery} placeholder='Search by username...' />

      {/* Render either a queried user list or users of recent chats */}
      {user ? (
        <div className='absolute top-[7rem] w-full flex justify-center items-center'>
          {searchQuery.length > 0 && userSuggestions.length > 0 ? (
            <div className='w-full max-h-60 mt-2 p-2 bg-white dark:bg-slate-800 border rounded-md shadow-md overflow-y-auto'>
              {userSuggestions.map((user, index) => (
                <div key={index} className='flex justify-between items-center py-1 px-2 rounded-md hover:bg-primary/20 dark:hover:bg-green-300/50 cursor-pointer group' onClick={() => startChat(user.uid)}>
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
      ) : (
        <div className='absolute top-[7rem] w-full flex justify-center items-center'>
          <div className='w-full max-h-60 flex justify-center items-center flex-wrap mt-2 rounded-md'>
            <SkeletonPill width='w-28' />
            <SkeletonPill width='w-20' />
            <SkeletonPill width='w-32' />
            <SkeletonPill width='w-32' />
            <SkeletonPill width='w-24' />
          </div>
        </div>
      )}
    </div>
  )
}
