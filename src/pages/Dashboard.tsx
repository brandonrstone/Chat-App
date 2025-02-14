import { UserSearch } from '../components/ui/UserSearch'

import { Header } from '../components/ui/Header'
import { useUserContext } from '../hooks/useUserContext'

export default function Dashboard() {
  const { newMessages } = useUserContext()

  console.log(newMessages)

  return (
    <div className='h-screen flex flex-col justify-center items-center p-2'>
      <Header />
      <UserSearch />
    </div>
  )
}
