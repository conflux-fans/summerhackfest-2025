import { useState } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Palette,
  Zap,
  Users,
  Settings,
  FileText,
  Clock,
} from "lucide-react";
import { WalletConnectButton } from "../Buttons/WalletConnect";
import { ChainDropdown } from "../Common/NetworkDropdown";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useSwitchChain } from "wagmi";
const mobileNavItems = [
  { name: "Bridge", to: "/", icon: <Zap size={18} /> },
  { name: "Collections", to: "/collections", icon: <Palette size={18} /> },
  { name: "History", to: "/history", icon: <Clock size={18} /> },
  {
    name: "Audit Report",
    to: "https://github.com/0xfdbu/summerhackfest-2025/blob/main/projects/layerzero_nftBridge/Audit.md",
    icon: <FileText size={18} />,
    external: true, // Flag for external link
  },
];
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { chainId } = useAppKitNetwork();
  const { switchChain: switchChainAsync } = useSwitchChain();
  const dummySet = () => {}; // Dummy functions for non-bridge pages
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-purple-500/10">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none"></div>
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <RouterNavLink
            to="/"
            className="group flex items-center space-x-3 hover:scale-105 transition-all duration-300"
          >
            <div className="hidden sm:block">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                AstrumGate
              </h1>
            </div>
          </RouterNavLink>
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4">
            {mobileNavItems.slice(0, 4).map((item) =>
              item.external ? (
                <a
                  key={item.name}
                  href={item.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 text-gray-300 hover:text-white hover:bg-white/5"
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </a>
              ) : (
                <RouterNavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`
                  }
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </RouterNavLink>
              ),
            )}
          </nav>
          {/* Right side - Wallet + Mobile Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-medium">Online</span>
            </div>
            <div className="hidden md:block">
              <ChainDropdown
                type="origin"
                chainId={chainId}
                destinationChainId={null}
                switchChainAsync={switchChainAsync}
                setTxStatus={dummySet}
                setTokenId={dummySet}
                setIsApproved={dummySet}
              />
            </div>
            <div className="hidden md:block">
              <WalletConnectButton />
            </div>
            <button
              className="md:hidden relative w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X size={20} className="text-white" />
              ) : (
                <Menu size={20} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="fixed top-0 left-0 h-150 w-full bg-slate-900 border-b border-white/10 z-50 md:hidden transform translate-x-0 transition-transform duration-300">
            <div className="relative z-10 flex flex-col h-full">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h2 className="text-white font-bold text-lg">
                        AstrumGate
                      </h2>
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
                  {mobileNavItems.map((item) =>
                    item.external ? (
                      <a
                        key={item.name}
                        href={item.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 text-gray-300 hover:text-white hover:bg-slate-700"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="text-purple-300">{item.icon}</div>
                        <span className="font-medium flex-1">{item.name}</span>
                      </a>
                    ) : (
                      <RouterNavLink
                        key={item.name}
                        to={item.to}
                        className={({ isActive }) =>
                          `group flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                            isActive
                              ? "bg-slate-800 text-white border border-purple-500/30"
                              : "text-gray-300 hover:text-white hover:bg-slate-700"
                          }`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label={`Navigate to ${item.name}`}
                      >
                        <div className="text-purple-300">{item.icon}</div>
                        <span className="font-medium flex-1">{item.name}</span>
                      </RouterNavLink>
                    ),
                  )}
                </div>
              </nav>
              <div className="p-6 border-t border-white/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 p-3 bg-slate-800 border border-white/10 rounded-xl">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 text-sm font-medium">
                      All Systems Online
                    </span>
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
