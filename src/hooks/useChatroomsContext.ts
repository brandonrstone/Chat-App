import { useContext } from 'react'

import { ChatroomsContext } from '../contexts/ChatroomContext'

export function useChatroomsContext() {
  const chatroomsContext = useContext(ChatroomsContext)
  if (chatroomsContext == null) throw Error('Must call Chatrooms from with ChatroomsContextProvider')
  return chatroomsContext
}