import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signOut } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

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

export type Message = {
  senderId: string
  text: string
  timestamp: Date
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