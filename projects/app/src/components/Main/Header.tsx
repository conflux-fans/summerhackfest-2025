import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { WalletConnectButton } from '../WalletConnectButton'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white text-black border-b border-gray-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-xl font-bold">
          <NavLink to="/" className="hover:text-gray-600 transition-colors">
            Conflux Wallet
          </NavLink>
        </h1>

        {/* Desktop Navigation (centered) */}
        <nav className="hidden md:flex items-center gap-8 mx-auto">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-2 py-1 font-medium transition-colors ${
                isActive ? 'text-black border-b-2 border-black' : 'text-gray-600 hover:text-black'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `px-2 py-1 font-medium transition-colors ${
                isActive ? 'text-black border-b-2 border-black' : 'text-gray-600 hover:text-black'
              }`
            }
          >
            About
          </NavLink>
        </nav>

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
