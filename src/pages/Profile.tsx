import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronLeft, Edit, X } from 'lucide-react'

import { useUserContext } from '../hooks/useUserContext'

import { Input } from '../components/ui/Input'
import { SkeletonText } from '../components/ui/SkeletonText'

export default function Profile() {
  const { user, loading, updateDisplayName } = useUserContext()
  const [isEditing, setIsEditing] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState(user?.displayName || '')

  async function handleUpdateDisplayName() {
    const sanitizedDisplayName = newDisplayName.replace(/[^a-z0-9_]/g, '').toLowerCase()

    if (user?.displayName === sanitizedDisplayName) {
      setIsEditing(false)
      return
    }

    await updateDisplayName(sanitizedDisplayName)
    setIsEditing(false)
  }

  return (
    <div className='h-screen p-2'>
      <div className='flex justify-between items-center mb-12'>
        <Link to='/' >
          <ChevronLeft className='text-center text-primary hover:text-primary/90 active:scale-90 transition-all duration-300' />
        </Link>
        <h1 className='text-center text-3xl font-semibold'>Profile</h1>
        <div />
      </div>

      <h2 className='text-lg'>Display Name</h2>
      {!isEditing ? (
        <div className='flex items-center space-x-2 mt-2'>
          {loading ? <SkeletonText className='w-24' /> : <p className='text-lg'>{user?.displayName}</p>}
          {loading ? null : <Edit className='w-5 h-5 cursor-pointer' onClick={() => setIsEditing(true)} />}
        </div>
      ) : (
        <div className='flex items-center space-x-1'>
          <Input className='py-1.5' value={newDisplayName} onChange={e => setNewDisplayName(e.target.value.replace(/[^a-z0-9_]/g, '').toLowerCase())} />
          <Check className='text-green-300 hover:text-green-300/80 cursor-pointer transition-all ease-in-out' onClick={handleUpdateDisplayName} />
          <X className='text-red-300 hover:text-red-300/80 cursor-pointer transition-all ease-in-out' onClick={() => setIsEditing(false)} />
        </div>
      )}
    </div>
  )
}
