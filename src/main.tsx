import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { UserContextProvider } from './contexts/UserContext.tsx'
import { ChatroomsContextProvider } from './contexts/ChatroomsContext.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { ThemeContextProvider } from './contexts/ThemeContext.tsx'

createRoot(document.getElementById('root') as HTMLElement)
  .render(
    <ThemeContextProvider>
      <AuthProvider>
        <UserContextProvider>
          <ChatroomsContextProvider>
            <App />
          </ChatroomsContextProvider>
        </UserContextProvider>
      </AuthProvider>
    </ThemeContextProvider>
  )