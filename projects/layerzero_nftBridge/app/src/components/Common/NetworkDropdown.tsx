// Common/NetworkDropdown.tsx
import { useState } from "react";
import {
CONFLUX_CHAIN_ID,
BASE_CHAIN_ID,
// ETH_SEPOLIA_CHAIN_ID,
// BASE_SEPOLIA_CHAIN_ID,
ARBITRUM_CHAIN_ID,
} from "../Pages/utils/constants";
import { switchToChain } from "../Pages/utils/chainUtils";
import confluxLogo from "../../assets/logos/conflux.svg";
import baseLogo from "../../assets/logos/base.svg";
// import ethereumLogo from "../../assets/logos/ethereum.svg";
// import baseSepoliaLogo from "../../assets/logos/base-sepolia.svg";
import arbitrumLogo from "../../assets/logos/arbitrum.svg";
import { ChevronDown } from "lucide-react";
interface NetworkOption {
id: number;
name: string;
logo: string;
}
const networkOptions: NetworkOption[] = [
  { id: CONFLUX_CHAIN_ID, name: "Conflux", logo: confluxLogo },
  { id: BASE_CHAIN_ID, name: "Base", logo: baseLogo },
  // { id: ETH_SEPOLIA_CHAIN_ID, name: "Ethereum Sepolia", logo: ethereumLogo },
  // { id: BASE_SEPOLIA_CHAIN_ID, name: "Base Sepolia", logo: baseSepoliaLogo },
  { id: ARBITRUM_CHAIN_ID, name: "Arbitrum", logo: arbitrumLogo },
];
interface ChainDropdownProps {
type: "origin" | "destination";
chainId: number | undefined;
destinationChainId?: number | null;
switchChainAsync: any;
setTxStatus: (status: string) => void;
setTokenId: (tokenId: string) => void;
setIsApproved: (approved: boolean) => void;
setDestinationChainId?: (chainId: number) => void;
includeAll?: boolean;
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
includeAll = false,
}: ChainDropdownProps) {
const [open, setOpen] = useState(false);
const availableOptions =
type === "destination"
? networkOptions.filter((opt) => opt.id !== chainId)
: networkOptions;
const currentNetwork =
type === "origin"
? networkOptions.find((opt) => opt.id === chainId) || {
name: "Select Network",
logo: "",
        }
: networkOptions.find((opt) => opt.id === destinationChainId) || {
name: "Select Destination",
logo: "",
        };
const handleSelect = async (selectedId: number) => {
setOpen(false);
if (type === "origin") {
if (selectedId === destinationChainId) {
setTxStatus("Origin chain cannot be the same as destination chain");
return;
      }
await switchToChain(
switchChainAsync,
selectedId,
setTxStatus,
setTokenId,
setIsApproved,
      );
    } else {
if (selectedId === chainId) {
setTxStatus("Destination chain cannot be the same as origin chain");
return;
      }
setDestinationChainId?.(selectedId);
    }
  };
return (
<div className="relative inline-block text-left w-36 lg:w-36">
{/* Trigger button */}
<button
onClick={() => setOpen(!open)}
className={`
          w-full cursor-pointer text-white flex items-center justify-between gap-2
          px-4 py-3 rounded-xl
          bg-gradient-to-r bg-white/5 backdrop-blur-xl border border-white/10
          transition-all duration-200 ease-out
          text-sm font-medium shadow-lg hover:shadow-xl
${open ? "ring-2 ring-blue-500/50 border-blue-500/50" : ""}
        `}
>
{currentNetwork.logo && (
<img
src={currentNetwork.logo}
alt={`${currentNetwork.name} logo`}
className="h-6 w-6 rounded-full shadow-sm"
/>
        )}
<span className="truncate max-w-[120px] lg:max-w-[160px] font-medium">
{currentNetwork.name}
</span>
<ChevronDown
className={`h-4 w-4 transition-transform duration-200 text-slate-400 ${open ? "rotate-180" : ""}`}
/>
</button>
{open && (
<>
{/* Backdrop */}
<div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
<div className="absolute right-0 mt-2 w-full bg-white/95 border border-white/20 backdrop-blur-xl rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
<div className="p-1">
{availableOptions.map((opt) => (
<button
key={opt.id}
onClick={() => handleSelect(opt.id)}
className="w-full cursor-pointer px-3 py-3 flex items-center gap-3 hover:bg-slate-50 transition-all duration-150 text-sm rounded-lg text-slate-700 font-medium group"
>
<img
src={opt.logo}
alt={`${opt.name} logo`}
className="h-6 w-6 rounded-full shadow-sm group-hover:scale-105 transition-transform"
/>
<span className="truncate max-w-[100px] lg:max-w-[140px]">
{opt.name}
</span>
</button>
              ))}
</div>
</div>
</>
      )}
</div>
  );
}