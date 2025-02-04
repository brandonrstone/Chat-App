import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'

import { db } from '../../../config/Firebase'

export async function getOrCreateChatroom(user1Id: string, user2Id: string) {
  const chatroomsRef = collection(db, 'chatrooms')

  // Query for an existing chatroom between these two users
  const q = query(chatroomsRef, where('users', 'array-contains', user1Id))
  const querySnapshot = await getDocs(q)

  for (const doc of querySnapshot.docs) {
    const chatroom = doc.data()
    if (chatroom.users.includes(user2Id)) {
      return doc.id
    }
  }

  // If no chatroom exists, create a new one
  const newChatroomRef = await addDoc(chatroomsRef, {
    users: [user1Id, user2Id],
    createdAt: serverTimestamp()
  })

  return newChatroomRef.id
}
