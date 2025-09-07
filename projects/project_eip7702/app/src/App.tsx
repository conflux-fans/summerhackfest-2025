import { Routes, Route } from 'react-router-dom'
import { DefaultLayout } from './layouts/DefaultLayout'
import { MainPage } from './components/Pages/MainPage'
function App() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<MainPage />} />
      </Route>
    </Routes>
  )
}

export default App