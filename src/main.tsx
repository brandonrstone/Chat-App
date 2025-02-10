import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { UserContextProvider } from './contexts/UserContext.tsx'
import { ChatroomsContextProvider } from './contexts/ChatroomsContext.tsx'

createRoot(document.getElementById('root') as HTMLElement)
  .render(
    <UserContextProvider>
      <ChatroomsContextProvider>
        <App />
      </ChatroomsContextProvider>
    </UserContextProvider>
  )
