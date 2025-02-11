import { UserSearch } from '../features/UserSearch/components/UserSearch'

import { Header } from '../components/Header'

export default function Dashboard() {
  // const { chatrooms } = useChatroomsContext()

  return (
    <div className='h-screen flex flex-col justify-center items-center p-2'>
      <Header />
      <UserSearch />
    </div>
  )
}
