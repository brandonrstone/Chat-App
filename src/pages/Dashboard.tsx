import { UserSearch } from '../components/ui/UserSearch'

import { Header } from '../components/ui/Header'

export default function Dashboard() {
  return (
    <div className='h-screen flex flex-col justify-center items-center p-2'>
      <Header />
      <UserSearch />
    </div>
  )
}
