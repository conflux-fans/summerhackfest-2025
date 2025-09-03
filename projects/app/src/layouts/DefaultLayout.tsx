import { Outlet } from 'react-router-dom'
import { Header } from '../components/Main/Header'
import { Footer } from '../components/Main/Footer'

export function DefaultLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}