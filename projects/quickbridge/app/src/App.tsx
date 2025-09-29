import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import Home from './components/Home.tsx'; // New: Welcome/Home component
import ConnectWallet from './components/ConnectWallet.tsx'; // New: Wallet connect component
import MesonSwaps from './components/MesonSwaps.tsx'; // New: Meson integration placeholder
import SwapStatus from './components/SwapStatus.tsx'; // New: Swap status component
function App() {
return (
<BrowserRouter>
<div className="flex flex-col min-h-screen font-sans bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
">
<div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
<Header />
<main className="min-h-screen flex-1 flex items-center justify-center py-8">
<Routes>
<Route path="/" element={<Home />} />
<Route path="/connect" element={<ConnectWallet />} />
<Route path="/bridge" element={<MesonSwaps />} />
<Route path="/swap/:txid" element={<SwapStatus />} />
</Routes>
</main>
</div>
<Footer />
</div>
</BrowserRouter>
  );
}
export default App;