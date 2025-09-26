import { Routes, Route } from 'react-router-dom'
import { DefaultLayout } from './layouts/DefaultLayout'
import { MainPage } from './components/Pages/MainPage'
import { Collections } from './components/Pages/Collections'
import { CollectionManagement } from './components/Pages/CollectionManagement';
import { BridgeTransactionDetail } from './components/Pages/BridgeTransactionDetail';
import { BridgeHistory } from './components/Pages/BridgeHistory'
function App() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:address" element={<CollectionManagement />} />
        <Route path="/history/:txid" element={<BridgeTransactionDetail />} />
        <Route path="/history" element={<BridgeHistory />} />
      </Route>
    </Routes>
  )
}

export default App