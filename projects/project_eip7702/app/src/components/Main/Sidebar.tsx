import { NavLink } from 'react-router-dom'
import {
  Home,
  Cpu,
  Github,
  CreditCard,
  ShoppingCart,
} from 'lucide-react'

interface SidebarItem {
  name: string
  to: string
  icon: React.ReactNode
}

const sidebarItems: SidebarItem[] = [
  { name: 'Portal', to: '/', icon: <Home size={20} /> },
  { name: 'Gas Topup', to: '/gas', icon: <Cpu size={20} /> },
  { name: 'Github', to: '/github', icon: <Github size={20} /> },
  { name: 'Wallet', to: '/wallet', icon: <CreditCard size={20} /> },
  { name: 'Buy Crypto', to: '/buy', icon: <ShoppingCart size={20} /> },
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
                  : 'text-gray-700 hover:bg-gray-200 hover:text-black'
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
