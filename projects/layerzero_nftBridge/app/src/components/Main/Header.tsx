import { useState } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { Menu, X, Home, Palette, Zap, Users, Settings } from 'lucide-react';
import { WalletConnectButton } from "../Buttons/WalletConnect";

const mobileNavItems = [
  { name: 'Collections', to: '/collections', icon: <Palette size={18} /> },
  { name: 'Bridge', to: '/', icon: <Zap size={18} /> },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-purple-500/10">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none"></div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <RouterNavLink to="/" className="group flex items-center space-x-3 hover:scale-105 transition-all duration-300">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-white font-bold text-lg">L0</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl opacity-30 group-hover:animate-ping"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
               NftBridge
              </h1>
              <p className="text-gray-400 text-xs">NFT Ecosystem</p>
            </div>
          </RouterNavLink>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {mobileNavItems.slice(0, 3).map((item) => (
              <RouterNavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
                {item.name === 'Mint NFT' && (
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </RouterNavLink>
            ))}
          </nav>

          {/* Right side - Wallet + Mobile Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-medium">Online</span>
            </div>

            <div className="hidden md:block">
              <WalletConnectButton />
            </div>

            <button
              className="md:hidden relative w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
  <>
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
    <div className="fixed top-0 left-0 h-120 w-full bg-slate-900 border-b border-white/10 z-50 md:hidden transform translate-x-0 transition-transform duration-300">
      <div className="relative z-10 flex flex-col h-full">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">L0</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">NftBridge</h2>
                <p className="text-gray-400 text-xs">Mobile Navigation</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              aria-label="Close mobile menu"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>
        <nav className="flex-1 p-6" role="navigation">
          <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Navigation
          </div>
          <div className="space-y-4">
            {mobileNavItems.map((item) => (
              <RouterNavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-slate-800 text-white border border-purple-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-slate-700'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label={`Navigate to ${item.name}`}
              >
                <div className="text-purple-300">{item.icon}</div>
                <span className="font-medium flex-1">{item.name}</span>
                {item.name === 'Mint NFT' && (
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </RouterNavLink>
            ))}
          </div>
        </nav>
        <div className="p-6 border-t border-white/10">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 p-3 bg-slate-800 border border-white/10 rounded-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-medium">All Systems Online</span>
            </div>
            <div className="w-full">
              <WalletConnectButton className="w-full bg-slate-800 border border-white/10 rounded-xl text-white hover:bg-slate-700 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
)}
    </header>
  );
}
