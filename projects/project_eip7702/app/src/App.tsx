import { Routes, Route } from 'react-router-dom'
import { DefaultLayout } from './layouts/DefaultLayout'
import { MainPage } from './components/Pages/MainPage'
import { WalletPage } from './components/Pages/Wallet'

function App() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/wallet" element={<WalletPage />} />
      </Route>
    </Routes>
  )
}

export default App