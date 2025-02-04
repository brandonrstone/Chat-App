import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signOut } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAxXFDDJSH-0Xhjc5f75fBu3yEd6_cV1do',
  authDomain: 'chatroom-e85f5.firebaseapp.com',
  projectId: 'chatroom-e85f5',
  storageBucket: 'chatroom-e85f5.firebasestorage.app',
  messagingSenderId: '544748367029',
  appId: '1:544748367029:web:82c96a3db5c9c1727ce2fc',
  measurementId: 'G-3L3ZW82HCE'
}

// Initialization
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

export type User = {
  uid: string,
  email: string
  displayName: string
  messages: string[]
  createdAt: Date
}

export async function addUserToFirestore(user: User) {
  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || 'Anonymous',
      email: user.email,
      messages: [],
      createdAt: new Date()
    })
  }
}

// export async function signIn() {
//   const result = await signInWithPopup(auth, googleProvider)
//   await addUserToFirestore(result.user)
// }

export async function logout() {
  signOut(auth)
} 