import { useState } from 'react';
import { CONFLUX_CHAIN_ID, BASE_CHAIN_ID } from '../Pages/utils/constants';
import { switchToConflux, switchToBase } from '../Pages/utils/chainUtils';

export function NetworkDropdown({ chainId, switchChainAsync, setTxStatus, setTokenId, setIsApproved }: any) {
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
    <div className="relative inline-block text-left w-full max-w-md">
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-white border border-gray-300 rounded-md px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-2">
          {chainId === CONFLUX_CHAIN_ID && (
            <>
              <img src="/src/assets/logos/conflux.svg" alt="Conflux logo" className="h-5 w-5" />
              Conflux
            </>
          )}
          {chainId === BASE_CHAIN_ID && (
            <>
              <img src="/src/assets/logos/base.svg" alt="Base logo" className="h-5 w-5" />
              Base
            </>
          )}
          {chainId !== CONFLUX_CHAIN_ID && chainId !== BASE_CHAIN_ID && <span>Select Network</span>}
        </div>
        <svg
          className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50">
          <button
            onClick={() => handleSelect('conflux')}
            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition"
          >
            <img src="/src/assets/logos/conflux.svg" alt="Conflux logo" className="h-5 w-5" />
            Conflux
          </button>
          <button
            onClick={() => handleSelect('base')}
            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition"
          >
            <img src="/src/assets/logos/base.svg" alt="Base logo" className="h-5 w-5" />
            Base
          </button>
        </div>
      )}
    </div>
  );
}
