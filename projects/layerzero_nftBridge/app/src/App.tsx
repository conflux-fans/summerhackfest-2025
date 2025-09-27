import { Routes, Route } from 'react-router-dom'
import { DefaultLayout } from './layouts/DefaultLayout'
import { MainPage } from './components/Pages/MainPage'
import { Collections } from './components/Pages/Collections'
import { CollectionManagement } from './components/Pages/CollectionManagement';
import { MintNFT } from './components/Pages/MintNFT';
import { BatchMint } from './components/Pages/BatchMint'; // New import
import { BridgeTransactionDetail } from './components/Pages/BridgeTransactionDetail';
import { BridgeHistory } from './components/Pages/BridgeHistory'

function App() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:address" element={<CollectionManagement />} />
        <Route path="/collections/:address/mint" element={<MintNFT />} />
        <Route path="/collections/:address/batch-mint" element={<BatchMint />} />
        <Route path="/history/:txid" element={<BridgeTransactionDetail />} />
        <Route path="/history" element={<BridgeHistory />} />
      </Route>
    </Routes>
  )
}

export default App