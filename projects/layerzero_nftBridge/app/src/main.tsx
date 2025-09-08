import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppKitProvider } from './config/walletconnect'
import App from './App'

import "@fontsource/inter";              // defaults to weight 400
import "@fontsource/inter/400.css";      // normal weight
import "@fontsource/inter/700.css";      // bold (optional)
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