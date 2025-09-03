import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppKitProvider } from './config/walletconnect'
import App from './App'
import './App.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppKitProvider>
        <App />
      </AppKitProvider>
    </BrowserRouter>
  </StrictMode>
)