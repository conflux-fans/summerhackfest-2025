import { WalletConnectButton } from '../Buttons/WalletConnect'
export function MainPage() {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 min-h-[calc(100vh-64px)]">
        {/* Hero Heading */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
          Welcome to <span className="text-indigo-600">Eip-7702</span>
        </h1>
  
        {/* Subtext */}
        <p className="text-gray-700 text-lg md:text-xl mb-8 max-w-xl">
          Send and receive crypto seamlessly with EIP-7702. Enjoy fee-less transfers, swap tokens, and bridge assets across chains—all in one wallet.
        </p>
  
        {/* Call-to-action buttons */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
        <WalletConnectButton />
          <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition">
            Learn More
          </button>
        </div>
      </div>
    )
  }
  