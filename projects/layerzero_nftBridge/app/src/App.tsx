import { Routes, Route } from 'react-router-dom'
import { DefaultLayout } from './layouts/DefaultLayout'
import { MainPage } from './components/Pages/MainPage'
import { Collections } from './components/Pages/Collections'
import { CollectionManagement } from './components/Pages/CollectionManagement';
import { BridgeHistory } from './components/Pages/BridgeHistory'
function App() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collection/:address" element={<CollectionManagement />} />
        <Route path="/history" element={<BridgeHistory />} />
      </Route>
    </Routes>
  )
}

export default App