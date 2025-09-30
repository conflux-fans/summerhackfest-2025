import { ArrowRight, Zap, Shield, Clock, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-5xl w-full space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse py-2">
            Cross-Chain Bridge
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
            Powered by Meson Protocol: Seamlessly transfer assets between Base and Conflux eSpace with lightning speed and top-tier security.
          </p>
          <Link
            to="/bridge"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Start Bridging Now <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6 space-y-4 text-center">
            <Zap className="w-12 h-12 text-yellow-400 mx-auto" />
            <h3 className="text-2xl font-bold">Lightning Fast</h3>
            <p className="text-gray-300">Complete transfers in just 1-3 minutes.</p>
          </div>
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6 space-y-4 text-center">
            <Shield className="w-12 h-12 text-green-400 mx-auto" />
            <h3 className="text-2xl font-bold">Secure</h3>
            <p className="text-gray-300">State-of-the-art security protocols protect your assets.</p>
          </div>
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-6 space-y-4 text-center">
            <Clock className="w-12 h-12 text-blue-400 mx-auto" />
            <h3 className="text-2xl font-bold">Efficient</h3>
            <p className="text-gray-300">Low fees and high efficiency for all your cross-chain needs.</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-4 bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
          <Wallet className="w-16 h-16 text-purple-400 mx-auto" />
          <h2 className="text-3xl font-bold">Ready to Bridge?</h2>
          <p className="text-gray-300">Connect your wallet and start transferring assets seamlessly.</p>
          <Link
            to="/bridge"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-full hover:from-blue-500 hover:to-blue-400 transition-all duration-300"
          >
            Go to Bridge <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;