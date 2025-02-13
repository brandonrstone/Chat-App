import { useState } from 'react'
import { sendSignInLinkToEmail } from 'firebase/auth'

import { auth } from '../../config/Firebase'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export default function TestVerificationSignUp() {
  const [email, setEmail] = useState('')

  async function sendSignInEmail() {
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/verify-email`, // Redirect user after clicking the link
      handleCodeInApp: true
    }

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      // Store email locally for later verification
      window.localStorage.setItem('emailForSignIn', email)
      alert('Check your email for the sign-in link!')
    } catch (error) {
      console.error('Error sending email link: ', error)
    }
  }

  return (
    <div className='h-screen flex flex-col justify-center items-center'>
      <Input type='text' value={email} onChange={e => setEmail(e.target.value)} />
      <Button onClick={sendSignInEmail}>Send Code</Button>
    </div>
  )
}
