import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { WalletConnectButton } from '../Buttons/WalletConnect'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white text-black border-b border-gray-300">
      <div className="mx-auto max-w-[1300px] px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-xl font-bold">
          <NavLink to="/" className="hover:text-gray-600 transition-colors">
          Eip-7702
          </NavLink>
        </h1>

        {/* Wallet Button (right side) */}
        <div className="hidden md:block">
          <WalletConnectButton />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-2xl focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-300 px-4 py-2">
          <div className="flex flex-col gap-2 text-center">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `py-2 font-medium transition-colors ${
                  isActive ? 'text-black border-b border-black' : 'text-gray-600 hover:text-black'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `py-2 font-medium transition-colors ${
                  isActive ? 'text-black border-b border-black' : 'text-gray-600 hover:text-black'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </NavLink>
            <div className="py-2">
              <WalletConnectButton />
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
