import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'

import { auth, db, logout } from '../config/Firebase'

export default function Dashboard() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState<string | null>(null)

  useEffect(() => {
    if (!auth.currentUser) return

    const userDocRef = doc(db, "users", auth.currentUser.uid)

    const unsubscribe = onSnapshot(userDocRef, docSnap => {
      if (docSnap.exists()) {
        setDisplayName(docSnap.data().displayName)
      } else {
        console.log("No such document!")
      }
    })

    return () => unsubscribe()
  }, [])

  function logoutUser() {
    logout()
      .then(() => navigate('/login'))
      .catch(console.error)
  }

  return (
    <div>
      <h2>Welcome, {displayName || 'User'}</h2>
      <button onClick={logoutUser}>Logout</button>
    </div>
  )
}