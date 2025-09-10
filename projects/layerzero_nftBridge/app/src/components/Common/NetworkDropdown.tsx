import { useState } from 'react';
import { CONFLUX_CHAIN_ID, BASE_CHAIN_ID } from '../Pages/utils/constants';
import { switchToConflux, switchToBase } from '../Pages/utils/chainUtils';

// traditional image imports
import confluxLogo from "../../assets/logos/conflux.svg";
import baseLogo from "../../assets/logos/base.svg";

export function NetworkDropdown({
  chainId,
  switchChainAsync,
  setTxStatus,
  setTokenId,
  setIsApproved,
}: any) {
  const [open, setOpen] = useState(false);

  const handleSelect = async (network: 'conflux' | 'base') => {
    setOpen(false);
    if (network === 'conflux') {
      await switchToConflux(switchChainAsync, setTxStatus, setTokenId, setIsApproved);
    } else {
      await switchToBase(switchChainAsync, setTxStatus, setTokenId, setIsApproved);
    }
  };

  return (
    <div className="relative inline-block text-left w-36">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full cursor-pointer text-white flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 backdrop-blur-xl transition text-sm font-medium"
      >
        {chainId === CONFLUX_CHAIN_ID && (
          <>
            <img src={confluxLogo} alt="Conflux logo" className="h-5 w-5" />
            Conflux
          </>
        )}
        {chainId === BASE_CHAIN_ID && (
          <>
            <img src={baseLogo} alt="Base logo" className="h-5 w-5" />
            Base
          </>
        )}
        {chainId !== CONFLUX_CHAIN_ID && chainId !== BASE_CHAIN_ID && <span>Select Network</span>}
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
          <button
            onClick={() => handleSelect('conflux')}
            className="w-full cursor-pointer px-3 py-2 flex items-center gap-2 hover:bg-gray-100 transition text-sm"
          >
            <img src={confluxLogo} alt="Conflux logo" className="h-5 w-5" />
            Conflux
          </button>
          <button
            onClick={() => handleSelect('base')}
            className="w-full cursor-pointer px-3 py-2 flex items-center gap-2 hover:bg-gray-100 transition text-sm"
          >
            <img src={baseLogo} alt="Base logo" className="h-5 w-5" />
            Base
          </button>
        </div>
      )}
    </div>
  );
}
