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
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition text-sm font-medium"
      >
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
        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-md z-50">
          <button
            onClick={() => handleSelect('conflux')}
            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-100 transition text-sm"
          >
            <img src="/src/assets/logos/conflux.svg" alt="Conflux logo" className="h-5 w-5" />
            Conflux
          </button>
          <button
            onClick={() => handleSelect('base')}
            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-100 transition text-sm"
          >
            <img src="/src/assets/logos/base.svg" alt="Base logo" className="h-5 w-5" />
            Base
          </button>
        </div>
      )}
    </div>
  );
}
