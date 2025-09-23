import { useState } from 'react';
import { CONFLUX_CHAIN_ID, BASE_CHAIN_ID, ETH_SEPOLIA_CHAIN_ID, BASE_SEPOLIA_CHAIN_ID } from '../Pages/utils/constants';
import { switchToChain } from '../Pages/utils/chainUtils';
import confluxLogo from "../../assets/logos/conflux.svg";
import baseLogo from "../../assets/logos/base.svg";
import ethereumLogo from "../../assets/logos/ethereum.svg";
import baseSepoliaLogo from "../../assets/logos/base-sepolia.svg";

interface NetworkOption {
  id: number;
  name: string;
  logo: string;
}

const networkOptions: NetworkOption[] = [
  { id: CONFLUX_CHAIN_ID, name: 'Conflux', logo: confluxLogo },
  { id: BASE_CHAIN_ID, name: 'Base', logo: baseLogo },
  { id: ETH_SEPOLIA_CHAIN_ID, name: 'Ethereum Sepolia', logo: ethereumLogo },
  { id: BASE_SEPOLIA_CHAIN_ID, name: 'Base Sepolia', logo: baseSepoliaLogo },
];

interface ChainDropdownProps {
  type: 'origin' | 'destination';
  chainId: number | undefined;
  destinationChainId?: number | null;
  switchChainAsync: any;
  setTxStatus: (status: string) => void;
  setTokenId: (tokenId: string) => void;
  setIsApproved: (approved: boolean) => void;
  setDestinationChainId?: (chainId: number) => void;
}

export function ChainDropdown({
  type,
  chainId,
  destinationChainId,
  switchChainAsync,
  setTxStatus,
  setTokenId,
  setIsApproved,
  setDestinationChainId,
}: ChainDropdownProps) {
  const [open, setOpen] = useState(false);

  const availableOptions = type === 'destination'
    ? networkOptions.filter(opt => opt.id !== chainId)
    : networkOptions;

  const currentNetwork = type === 'origin'
    ? (networkOptions.find(opt => opt.id === chainId) || { name: 'Select Network', logo: '' })
    : (networkOptions.find(opt => opt.id === destinationChainId) || { name: 'Select Destination', logo: '' });

  const handleSelect = async (selectedId: number) => {
    setOpen(false);
    if (type === 'origin') {
      if (selectedId === destinationChainId) {
        setTxStatus('Origin chain cannot be the same as destination chain');
        return;
      }
      await switchToChain(switchChainAsync, selectedId, setTxStatus, setTokenId, setIsApproved);
    } else {
      if (selectedId === chainId) {
        setTxStatus('Destination chain cannot be the same as origin chain');
        return;
      }
      setDestinationChainId?.(selectedId);
    }
  };

  return (
    <div className="relative inline-block text-left w-36">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full cursor-pointer text-white flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 backdrop-blur-xl transition text-sm font-medium"
      >
        {currentNetwork.logo && (
          <img src={currentNetwork.logo} alt={`${currentNetwork.name} logo`} className="h-5 w-5" />
        )}
        <span className="truncate max-w-[100px]">{currentNetwork.name}</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-full bg-white/90 border border-white/10 backdrop-blur-xl rounded-lg shadow-md z-50">
          {availableOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className="w-full cursor-pointer px-3 py-2 flex items-center gap-2 hover:bg-gray-100 transition text-sm"
            >
              <img src={opt.logo} alt={`${opt.name} logo`} className="h-5 w-5" />
              <span className="truncate max-w-[100px]">{opt.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}