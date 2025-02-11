import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'

import { db, type User } from '../../../config/Firebase'

import { getOrCreateChatroom } from '../../Chat/service/ChatService'
import { useUserContext } from '../../../hooks/useUserContext'

import { Input } from '../../../components/Input'
import { ChevronRight } from 'lucide-react'

export function UserSearch() {
  const { user } = useUserContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [userSuggestions, setUserSuggestions] = useState<User[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users')
      const usersSnapshot = await getDocs(usersCollection)
      const usersList = usersSnapshot.docs.map(doc => doc.data() as User)
      setUserSuggestions(usersList)
    }

    fetchUsers()
  }, [])

  async function handleUserSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const queryText = e.target.value
    setSearchQuery(queryText)

    if (queryText.length > 1) {
      // Perform the Firestore query
      const q = query(
        collection(db, 'users'),
        where('displayName', '>=', queryText),
        where('displayName', '<=', queryText + '\uf8ff') // to match case-insensitive search
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
      <Input className='w-full rounded-full shadow-md' onChange={handleUserSearch} value={searchQuery} placeholder='Search by username...' />

      {searchQuery.length > 1 && (
        <div className='absolute top-[5rem] w-full max-h-60 mt-2 p-2 bg-white border rounded-md shadow-md overflow-y-auto'>
          {userSuggestions.map((user, index) => (
            <div key={index} className='flex justify-between items-center py-1 px-2 rounded-md hover:bg-primary/20 cursor-pointer group' onClick={() => startChat(user.uid)} >
              <span>@{user.displayName}</span>
              <ChevronRight className='w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-[-10px] transition-all duration-300 ease-out' />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
