import { Routes, Route } from 'react-router-dom'
import { DefaultLayout } from './layouts/DefaultLayout'
import { MainPage } from './components/Pages/MainPage'
import { Collections } from './components/Pages/Collections'
import { CollectionManagement } from './components/Pages/CollectionManagement';
function App() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collection/:address" element={<CollectionManagement />} />
      </Route>
    </Routes>
  )
}

export default App