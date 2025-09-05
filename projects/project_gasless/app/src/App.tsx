import { Routes, Route } from 'react-router-dom'
import { DefaultLayout } from './layouts/DefaultLayout'
import { HomePage } from './pages/HomePage'
import { ManageContract } from './pages/ManageContract'
function App() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/manage" element={<ManageContract />} />
      </Route>
    </Routes>
  )
}

export default App