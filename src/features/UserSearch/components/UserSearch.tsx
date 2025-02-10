import { useState } from 'react'
import { Input } from '../../../components/Input'
import { db } from '../../../config/Firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

export function UserSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [userSuggestions, setUserSuggestions] = useState<string[]>([])

  async function handleUserSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const queryText = e.target.value
    setSearchQuery(queryText)

    if (queryText.length >= 2) {
      // Perform the Firestore query when the input has at least 3 characters
      const q = query(
        collection(db, 'users'),
        where('displayName', '>=', queryText),
        where('displayName', '<=', queryText + '\uf8ff') // to match case-insensitive search
      )

      const querySnapshot = await getDocs(q)
      const suggestions: string[] = []

      querySnapshot.forEach(doc => {
        const userData = doc.data()
        suggestions.push(userData.displayName)
      })

      setUserSuggestions(suggestions)
    } else {
      setUserSuggestions([]) // Clear suggestions if input is less than 3 characters
    }
  }

  return (
    <div className='flex flex-col justify-center items-center'>
      <Input
        className='rounded-full shadow-md'
        onChange={handleUserSearch}
        value={searchQuery}
        placeholder='Search by username...'
      />
      {searchQuery.length > 1 && (
        <div className='mt-2 p-2 bg-white border rounded-md shadow-md max-h-60 overflow-y-auto'>
          {userSuggestions.map((username, index) => (
            <div key={index} className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>
              {username}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
