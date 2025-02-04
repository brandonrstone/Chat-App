import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { UserContextProvider } from './contexts/UserContext.tsx'

createRoot(document.getElementById('root') as HTMLElement)
  .render(
    <UserContextProvider>
      <App />
    </UserContextProvider>
  )
