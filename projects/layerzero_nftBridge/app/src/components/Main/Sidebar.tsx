import { NavLink } from 'react-router-dom'
import { Home, User } from 'lucide-react'

interface SidebarItem {
  name: string
  to: string
  icon: React.ReactNode
}

const sidebarItems: SidebarItem[] = [
  { name: 'Portal', to: '/', icon: <Home size={20} /> },
  { name: 'Mint NFT', to: '/mint-nft', icon: <User size={20} /> }, // Added Mint NFT
]

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-gray-300 p-4 hidden md:flex flex-col sticky top-0 h-screen">
      <nav className="flex flex-col gap-2">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-black text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
