import { Routes, Route } from 'react-router-dom'
import { DefaultLayout } from './layouts/DefaultLayout'
import { MainPage } from './components/Pages/MainPage'
import { MintNFT } from './components/Pages/MintNFT'

function App() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/mint-nft" element={<MintNFT />} />
      </Route>
    </Routes>
  )
}

export default App