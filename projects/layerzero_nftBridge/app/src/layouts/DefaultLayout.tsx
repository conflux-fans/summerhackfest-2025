import { Outlet } from 'react-router-dom'
import { Header } from '../components/Main/Header'
import { Footer } from '../components/Main/Footer'

export function DefaultLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      {/* Container with max width */}
      <main className="flex-grow w-full">
        <div className="mx-auto max-w-[1400px] flex">
          {/* Main Content */}
          <div className="flex-grow p-4">
            <Outlet />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
