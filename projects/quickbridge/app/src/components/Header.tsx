import { NavLink } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react'; // Added for programmatic modal open
import { Home, Wallet, ArrowLeftRight, Zap, CheckCircle2 } from 'lucide-react';
function Header() {
const { address, isConnected } = useAccount();
const { open } = useAppKit(); // Hook to open the modal/popup
const handleButtonClick = () => {
open(); // Opens modal regardless of connection status
  };
return (
<header className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl">
<div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
{/* Logo/Brand */}
<div className="flex items-center space-x-2">
<div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg shadow-md">
<Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
</div>
<h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              QuickBridge
</h1>
</div>
{/* Navigation */}
<nav className="flex items-center gap-2">
<NavLink
to="/"
className={({ isActive }) => `flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-200 transition-all duration-200 ${isActive ? 'bg-white/10 text-gray-300' : 'hover:bg-white/10 hover:text-gray-300'}`}
>
<Home className="w-4 h-4" />
<span className="font-medium">Home</span>
</NavLink>
<NavLink
to="/bridge"
className={({ isActive }) => `flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-200 transition-all duration-200 ${isActive ? 'bg-white/10 text-gray-300' : 'hover:bg-white/10 hover:text-gray-300'}`}
>
<ArrowLeftRight className="w-4 h-4" />
<span className="font-medium">Bridge</span>
</NavLink>
</nav>
{/* Custom Wallet Button */}
<div className="flex items-center">
{isConnected ? (
<div
onClick={handleButtonClick} // Click opens modal for account/disconnect
className="cursor-pointer flex items-center space-x-2 bg-white px-4 py-2 rbackdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl transition-all duration-200"
>
<CheckCircle2 className="w-5 h-5 text-green-600" />
<div className="flex flex-col">
<span className="text-xs text-gray-100 font-medium">Connected</span>
<span className="text-sm font-mono text-gray-300 truncate max-w-[120px] sm:max-w-[150px]">
{address?.slice(0, 6)}...{address?.slice(-4)}
</span>
</div>
</div>
            ) : (
<button
onClick={handleButtonClick} // Click opens connect modal
className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
>
                Connect Wallet
</button>
            )}
</div>
</div>
</div>
</header>
  );
}
export default Header;