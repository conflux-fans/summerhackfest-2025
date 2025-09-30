import { useState, useEffect } from "react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useWalletClient, usePublicClient, useSwitchChain } from "wagmi";
import { WalletConnectButton } from "../Buttons/WalletConnect";
import { NFT } from "./utils/types/types";
import { fetchNFTs } from "./utils/nftUtils";
import { ChainDropdown } from "../Common/NetworkDropdown";
import {
approveNFT,
bridgeNFT,
registerCollection,
checkIsApproved,
checkIsSupported,
} from "./utils/bridge/bridgeUtils";
import {
CONFLUX_CHAIN_ID,
BASE_CHAIN_ID,
// ETH_SEPOLIA_CHAIN_ID,
// BASE_SEPOLIA_CHAIN_ID,
ARBITRUM_CHAIN_ID,
CONFLUX_BRIDGE_ADDRESS,
BASE_BRIDGE_ADDRESS,
// ETH_SEPOLIA_BRIDGE_ADDRESS,
// BASE_SEPOLIA_BRIDGE_ADDRESS,
ARBITRUM_BRIDGE_ADDRESS,
} from "./utils/constants";
import { ArrowLeftRight, Image as ImageIcon, Check, CheckCircle, X, Loader2, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { fetchLzMessageStatus, LzMessageStatus, pollLzStatus } from "./utils/bridge/layerZeroScanUtils";
import { useNavigate } from "react-router-dom";
export function MainPage() {
const { address, isConnected } = useAppKitAccount();
const { chainId } = useAppKitNetwork();
const { data: walletClient } = useWalletClient();
const publicClient = usePublicClient();
const { switchChainAsync } = useSwitchChain();
const navigate = useNavigate();
const [ready, setReady] = useState(false);
const [tokenId, setTokenId] = useState("");
const [recipient, setRecipient] = useState("");
const [useCustomRecipient, setUseCustomRecipient] = useState(false);
const [txStatus, setTxStatus] = useState("");
const [isApproved, setIsApproved] = useState(false);
const [isApproving, setIsApproving] = useState(false);
const [isBridging, setIsBridging] = useState(false);
const [showNFTModal, setShowNFTModal] = useState(false);
const [nfts, setNfts] = useState<NFT[]>([]);
const [isLoadingNfts, setIsLoadingNfts] = useState(false);
const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
const [isSupported, setIsSupported] = useState(true);
const [isRegistering, setIsRegistering] = useState(false);
const [tokenContractAddress, setTokenContractAddress] = useState("");
const [destinationChainId, setDestinationChainId] = useState<number | null>(null);
const [bridgeStatus, setBridgeStatus] = useState<LzMessageStatus["status"] | null>(null);
const [estimatedRemainingMs, setEstimatedRemainingMs] = useState<number | null>(null);
const [dstTxHash, setDstTxHash] = useState<string | null>(null);
const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
const [bridgingTxHash, setBridgingTxHash] = useState<string | null>(null);
useEffect(() => {
const initialize = async () => {
if (isConnected && address && walletClient && publicClient) {
setReady(true);
setRecipient(address);
if (
![
CONFLUX_CHAIN_ID,
BASE_CHAIN_ID,
ARBITRUM_CHAIN_ID,
          ].includes(chainId || 0)
        ) {
setTxStatus("Please switch to a supported network");
setIsApproved(false);
        } else {
setTxStatus("");
if (!destinationChainId) {
setDestinationChainId(
chainId === CONFLUX_CHAIN_ID
? BASE_CHAIN_ID
: chainId === BASE_CHAIN_ID
? CONFLUX_CHAIN_ID
: chainId === ARBITRUM_CHAIN_ID
? BASE_CHAIN_ID
: CONFLUX_CHAIN_ID,
            );
          }
        }
if (tokenContractAddress && chainId) {
const bridgeAddress = getBridgeAddress(chainId);
const supported = await checkIsSupported(
publicClient,
tokenContractAddress as Address,
bridgeAddress as Address,
          );
setIsSupported(supported);
if (!supported) {
setTxStatus(
"Token contract not registered. Please register the collection to proceed.",
            );
          }
if (tokenId && supported) {
const approved = await checkIsApproved(
publicClient,
tokenId,
tokenContractAddress as Address,
bridgeAddress as Address,
            );
setIsApproved(approved);
if (approved) {
setTxStatus("NFT already approved");
            }
          }
        } else {
setIsSupported(true);
        }
      } else {
setReady(false);
setRecipient("");
setTxStatus("Please connect wallet to proceed");
setIsApproved(false);
      }
    };
initialize();
  }, [
isConnected,
address,
walletClient,
publicClient,
chainId,
tokenContractAddress,
tokenId,
  ]);
// Polling useEffect for LayerZero status
useEffect(() => {
if (bridgingTxHash && chainId && destinationChainId) {
const onUpdate = (status: LzMessageStatus) => {
setBridgeStatus(status.status);
setEstimatedRemainingMs(status.estimatedRemainingMs);
setDstTxHash(status.txHashes.dstTxHash || null);
      };
pollLzStatus(bridgingTxHash, chainId, destinationChainId, onUpdate);
// Cleanup on unmount or new tx
return () => {
if (pollInterval) clearInterval(pollInterval);
      };
    }
  }, [bridgingTxHash, chainId, destinationChainId, pollInterval]);
// Redirect after successful bridging
useEffect(() => {
if (bridgeStatus === "delivered" && bridgingTxHash) {
const timer = setTimeout(() => {
navigate(`/history/${bridgingTxHash}`);
      }, 3000); // Optional delay to show success message
return () => clearTimeout(timer);
    }
  }, [bridgeStatus, bridgingTxHash, navigate]);
const getBridgeAddress = (id: number): Address => {
switch (id) {
case CONFLUX_CHAIN_ID:
return CONFLUX_BRIDGE_ADDRESS;
case BASE_CHAIN_ID:
return BASE_BRIDGE_ADDRESS;
case ARBITRUM_CHAIN_ID:
return ARBITRUM_BRIDGE_ADDRESS;
default:
throw new Error("Unsupported chain");
    }
  };
const getChainInfo = (id: number) => {
switch (id) {
case CONFLUX_CHAIN_ID:
return {
name: "Conflux",
color: "from-emerald-400 to-teal-500",
logo: "CFX",
        };
case BASE_CHAIN_ID:
return {
name: "Base",
color: "from-blue-400 to-indigo-500",
logo: "BASE",
        };
case ARBITRUM_CHAIN_ID:
return {
name: "Arbitrum",
color: "from-blue-400 to-indigo-500",
logo: "ARB",
        };
default:
return {
name: "Unknown",
color: "from-gray-400 to-gray-500",
logo: "?",
        };
    }
  };
const getExplorerUrl = (id: number, txHash: string) => {
switch (id) {
case CONFLUX_CHAIN_ID:
return `https://confluxscan.io/tx/${txHash}`;
case BASE_CHAIN_ID:
return `https://basescan.org/tx/${txHash}`;
case ARBITRUM_CHAIN_ID:
return `https://arbiscan.io/tx/${txHash}`;
default:
return `#`;
    }
  };
const getLzScanUrl = (txHash: string) => {
return `https://layerzeroscan.com/tx/${txHash}`;
  };
const handleSwapNetworks = async () => {
if (!chainId || !destinationChainId) {
setTxStatus("Invalid network selection for swap");
return;
    }
const newOrigin = destinationChainId;
const newDestination = chainId;
if (newOrigin === chainId) {
setTxStatus("Networks are the same, no swap needed");
return;
    }
try {
await switchChainAsync({ chainId: newOrigin });
setDestinationChainId(newDestination);
setTxStatus("Networks swapped successfully");
// Reset NFT selection after swap
setTokenId("");
setTokenContractAddress("");
setSelectedNFT(null);
setIsApproved(false);
setIsSupported(true);
    } catch (error) {
console.error("[MainPage] Swap error:", error);
setTxStatus(`Failed to swap networks: ${error.message || "Unknown error"}`);
    }
  };
const handleFetchNFTs = () => {
if (!isConnected) {
setTxStatus("Please connect wallet to browse NFTs");
return;
    }
fetchNFTs(
publicClient,
address,
chainId,
setNfts,
setTxStatus,
setIsLoadingNfts,
    ).then(() => setShowNFTModal(true));
  };
const selectNFT = (nft: NFT) => {
setTokenId(nft.tokenId);
setTokenContractAddress(nft.contractAddress || "");
setSelectedNFT(nft);
setShowNFTModal(false);
setIsApproved(false);
setTxStatus("");
  };
const toggleCustomRecipient = () => {
setUseCustomRecipient(!useCustomRecipient);
setRecipient(!useCustomRecipient ? "" : address || "");
  };
const handleRegisterClick = async () => {
if (!chainId) return;
const bridgeAddress = getBridgeAddress(chainId);
try {
await registerCollection({
walletClient,
publicClient,
tokenAddress: tokenContractAddress as Address,
bridgeAddress: bridgeAddress as Address,
setTxStatus,
setIsSupported,
setIsRegistering,
      });
    } catch (error) {
console.error("[MainPage] Registering error:", error);
setTxStatus(
`Failed to register collection: ${error.message || "Unknown error"}`,
      );
    }
  };
const handleApproveClick = async () => {
if (!chainId) return;
const bridgeAddress = getBridgeAddress(chainId);
try {
await approveNFT({
walletClient,
publicClient,
tokenId,
tokenAddress: tokenContractAddress as Address,
bridgeAddress: bridgeAddress as Address,
setTxStatus,
setIsApproved,
setIsApproving,
      });
    } catch (error) {
console.error("[MainPage] Approval error:", error);
setTxStatus(`Failed to approve: ${error.message || "Unknown error"}`);
    }
  };
const handleBridgeClick = async () => {
if (!chainId || !destinationChainId) {
setTxStatus("Please select a valid destination chain");
return;
    }
if (chainId === destinationChainId) {
setTxStatus("Cannot bridge to the same chain");
return;
    }
try {
// Assuming bridgeNFT returns { txHash: Hash, ... } or similar
const bridgeResponse = await bridgeNFT(
        {
walletClient,
publicClient,
tokenIds: [tokenId],
localTokenAddress: tokenContractAddress as Address,
recipient: recipient as Address,
isApproved,
setTxStatus,
setIsApproved,
setTokenIds: (ids) => setTokenId(ids[0] || ""),
setIsBridging,
        },
destinationChainId,
      );
const txHash = bridgeResponse.txHash as string; // Extract txHash from response, assume string
if (txHash && chainId) {
setBridgingTxHash(txHash);
setTxStatus(`Bridge initiated. Tracking status... Tx: ${txHash}`);
      }
    } catch (error) {
console.error("[MainPage] Bridging error:", error);
setTxStatus(`Failed to bridge: ${error.message || "Unknown error"}`);
    }
  };
const currentChain = getChainInfo(chainId || 0);
const targetChain = getChainInfo(destinationChainId || 0);
return (
<div className="min-h-screen p-4">
<div className="fixed inset-0 overflow-hidden pointer-events-none">
<div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
<div className="absolute top-3/4 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
</div>
<div className="relative z-10 max-w-6xl mx-auto pt-8">
<div className="text-center mb-12">
<div className="flex items-center justify-center mb-6">
<div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mr-4">
<span className="text-2xl">🌉</span>
</div>
<h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent py-2">
              NFT Bridge
</h1>
</div>
<p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            Bridge any ERC-721 NFT between supported chains using LayerZero
            technology
</p>
</div>
<div className="grid lg:grid-cols-2 gap-8 items-start">
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
<div className="mb-8">
<div className="flex items-center justify-between mb-6">
<h3 className="text-white text-lg font-semibold flex items-center gap-3">
<span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Network Selection
</h3>
</div>
<div className="relative">
<div className="flex items-center justify-between gap-2">
<div className="flex-1">
<ChainDropdown
type="origin"
chainId={chainId}
destinationChainId={destinationChainId}
switchChainAsync={switchChainAsync}
setTxStatus={setTxStatus}
setTokenId={setTokenId}
setIsApproved={setIsApproved}
/>
</div>
<button
onClick={handleSwapNetworks}
className="text-purple-400 hover:text-purple-300 transition-colors p-2 mx-auto bg-white/5 border border-white/10 rounded-2xl p-2 cursor-pointer"
title="Swap networks"
>
<ArrowLeftRight className="w-6 h-6" />
</button>
<div className="flex-1 text-end">
<ChainDropdown
type="destination"
chainId={chainId}
destinationChainId={destinationChainId}
switchChainAsync={switchChainAsync}
setTxStatus={setTxStatus}
setTokenId={setTokenId}
setIsApproved={setIsApproved}
setDestinationChainId={setDestinationChainId}
/>
</div>
</div>
</div>
</div>
<div className="mb-8">
<h3 className="text-white text-lg font-semibold mb-6 flex items-center">
<span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
                Select NFT
</h3>
<button
onClick={handleFetchNFTs}
disabled={!ready || isLoadingNfts}
className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center ${
                  !ready || isLoadingNfts
                    ? "opacity-50 cursor-not-allowed hover:scale-100"
                    : ""
}`}
>
{isLoadingNfts ? (
<>
<Loader2 className="h-5 w-5 mr-3 text-white animate-spin" />
                    Scanning Collection...
</>
                ) : (
<>
<ImageIcon className="w-5 h-5 mr-3" />
                    Browse NFTs
</>
                )}
</button>
</div>
<div className="mb-8">
<h3 className="text-white text-lg font-semibold mb-6 flex items-center">
<span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 animate-pulse"></span>
                Recipient Address
</h3>
<div className="mb-4">
<label className="flex items-center text-gray-300 cursor-pointer">
<input
type="checkbox"
checked={useCustomRecipient}
onChange={toggleCustomRecipient}
className="sr-only"
disabled={!isConnected}
/>
<div
className={`w-6 h-6 rounded-lg border-2 mr-3 flex items-center justify-center transition-all ${useCustomRecipient ? "bg-purple-500 border-purple-500" : "border-gray-500"} ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
>
{useCustomRecipient && (
<Check className="w-4 h-4 text-white" />
                    )}
</div>
                  Use custom recipient address
</label>
</div>
{useCustomRecipient && (
<input
type="text"
placeholder="Recipient Address (0x...)"
value={recipient}
onChange={(e) => setRecipient(e.target.value)}
disabled={!isConnected}
className={`w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm ${
                    !isConnected
                      ? "opacity-50 cursor-not-allowed"
                      : ""
}`}
/>
              )}
</div>
<div className="space-y-4">
{!isSupported && (
<button
onClick={handleRegisterClick}
disabled={!ready || !tokenContractAddress || isRegistering}
className={`w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center ${
                    !ready || !tokenContractAddress || isRegistering
                      ? "opacity-50 cursor-not-allowed hover:scale-100"
                      : ""
}`}
>
{isRegistering ? (
<>
<Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      Registering...
</>
                  ) : (
<>
<CheckCircle className="w-5 h-5 mr-3" />
                      Register Collection
</>
                  )}
</button>
              )}
{isSupported && !isApproved && (
<button
onClick={handleApproveClick}
disabled={
                    !ready ||
                    !tokenId ||
                    !tokenContractAddress ||
isApproving
}
className={`w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center ${
                    !ready ||
                    !tokenId ||
                    !tokenContractAddress ||
isApproving
                      ? "opacity-50 cursor-not-allowed hover:scale-100"
                      : ""
}`}
>
{isApproving ? (
<>
<Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      Approving...
</>
                  ) : (
<>
<CheckCircle className="w-5 h-5 mr-3" />
                      Approve NFT
</>
                  )}
</button>
              )}
{isSupported && isApproved && (
<button
onClick={handleBridgeClick}
disabled={
                    !ready ||
                    !tokenId ||
                    !recipient ||
                    !tokenContractAddress ||
isBridging ||
                    !destinationChainId
}
className={`w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center ${
                    !ready ||
                    !tokenId ||
                    !recipient ||
                    !tokenContractAddress ||
isBridging ||
                    !destinationChainId
                      ? "opacity-50 cursor-not-allowed hover:scale-100"
                      : ""
}`}
>
{isBridging ? (
<>
<Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      Bridging NFT...
</>
                  ) : (
<>
<span className="mr-3">🌉</span>
                      Bridge to {targetChain.name}
</>
                  )}
</button>
              )}
</div>
{txStatus && (
<div
className={`mt-6 p-4 rounded-2xl border ${
txStatus.includes("Failed") ||
txStatus.includes("Please") ||
txStatus.includes("Invalid") ||
txStatus.includes("same chain")
                    ? "bg-red-500/10 border-red-500/20 text-red-300"
                    : "bg-green-500/10 border-green-500/20 text-green-300"
}`}
>
<p className="text-center font-medium">{txStatus}</p>
</div>
            )}
{/* LayerZero Status Display */}
{bridgeStatus && (
<div className="mt-6">
<h4 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
<span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  Bridge Status (LayerZero Scan)
</h4>
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3">
<div className="flex items-center justify-between">
<span className="text-gray-300 text-sm">Status:</span>
<span
className={`text-sm font-medium flex items-center gap-1 ${
bridgeStatus === "delivered"
                          ? "text-green-400"
                          : bridgeStatus === "failed"
                          ? "text-red-400"
                          : "text-yellow-400"
}`}
>
{bridgeStatus === "delivered" && <CheckCircle2 className="w-4 h-4" />}
{bridgeStatus === "failed" && <AlertCircle className="w-4 h-4" />}
{bridgeStatus === "pending" && <Clock className="w-4 h-4 animate-spin" />}
{bridgeStatus.charAt(0).toUpperCase() + bridgeStatus.slice(1)}
</span>
</div>
{bridgeStatus === "pending" && estimatedRemainingMs && (
<div className="flex items-center justify-between">
<span className="text-gray-300 text-sm">Est. Time Left:</span>
<span className="text-yellow-300 text-sm font-mono">
{Math.round(estimatedRemainingMs / 1000)}s
</span>
</div>
                  )}
{dstTxHash && destinationChainId && (
<div className="flex items-center justify-between">
<span className="text-gray-300 text-sm">Destination Tx:</span>
<a
href={getExplorerUrl(destinationChainId, dstTxHash)}
target="_blank"
rel="noopener noreferrer"
className="text-purple-300 text-sm hover:text-purple-200 underline"
>
                        View on Explorer
</a>
</div>
                  )}
<div className="pt-2">
<a
href={bridgingTxHash ? getLzScanUrl(bridgingTxHash) : '#'}
target="_blank"
rel="noopener noreferrer"
className="text-purple-400 text-xs hover:text-purple-300 underline block"
>
                      Track on LayerZero Scan
</a>
</div>
</div>
</div>
            )}
{bridgeStatus === "delivered" && (
<div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
<p className="text-green-300 text-center text-sm">NFT bridged and delivered! Check destination chain. Redirecting to history...</p>
</div>
            )}
{bridgeStatus === "failed" && (
<div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
<p className="text-red-300 text-center text-sm">Bridge failed. Check LayerZero Scan for details.</p>
</div>
            )}
</div>
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
<h3 className="text-white text-lg font-semibold mb-6 flex items-center">
<span className="w-2 h-2 bg-pink-400 rounded-full mr-3 animate-pulse"></span>
              Selected NFT
</h3>
{selectedNFT ? (
<div className="text-center">
<div className="relative mb-6">
<div className="w-full max-w-sm mx-auto aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl p-4 border border-white/10">
{selectedNFT.image ? (
<img
src={selectedNFT.image}
alt={`NFT ${selectedNFT.tokenId}`}
className="w-full h-full object-contain rounded-2xl"
onError={(e) => {
e.currentTarget.src =
"https://via.placeholder.com/400x400/6366f1/ffffff?text=NFT";
e.currentTarget.alt = "No image available";
                        }}
/>
                    ) : (
<div className="w-full h-full flex items-center justify-center rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800">
<div className="text-center">
<div className="text-6xl mb-4">🖼️</div>
<p className="text-gray-400">No image available</p>
</div>
</div>
                    )}
</div>
<div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    #{selectedNFT.tokenId}
</div>
</div>
<div className="bg-white/5 rounded-2xl p-6 border border-white/10">
<h4 className="text-white text-xl font-bold mb-2">
{selectedNFT.name || `Token #${selectedNFT.tokenId}`}
</h4>
<div className="text-gray-300 space-y-2">
<div className="flex justify-between">
<span>Token ID:</span>
<span className="font-mono text-purple-300">
                        #{selectedNFT.tokenId}
</span>
</div>
<div className="flex justify-between">
<span>Network:</span>
<span className="text-emerald-300">
{currentChain.name}
</span>
</div>
<div className="flex justify-between">
<span>Contract:</span>
<span className="font-mono text-xs text-cyan-300">
{selectedNFT.contractAddress
                          ? `${selectedNFT.contractAddress.slice(0, 6)}...${selectedNFT.contractAddress.slice(-4)}`
                          : "Not set"}
</span>
</div>
<div className="flex justify-between">
<span>Status:</span>
<span
className={`${isApproved ? "text-green-300" : "text-yellow-300"}`}
>
{isApproved ? "Approved" : "Pending Approval"}
</span>
</div>
</div>
</div>
</div>
            ) : (
<div className="text-center py-16">
<div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mb-6">
<span className="text-4xl text-gray-500">🖼️</span>
</div>
<h4 className="text-white text-xl font-semibold mb-2">
                  No NFT Selected
</h4>
<p className="text-gray-400">
                  Click "Browse NFTs" to select an NFT for bridging
</p>
</div>
            )}
</div>
</div>
</div>
{showNFTModal && (
<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
<div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-hidden">
<div className="flex items-center justify-between mb-8">
<h2 className="text-3xl font-bold text-white flex items-center">
🎨
                Select Your NFT
</h2>
<button
onClick={() => setShowNFTModal(false)}
className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl flex items-center justify-center text-red-300 hover:text-red-200 transition-all"
>
<X className="w-6 h-6" />
</button>
</div>
<div className="overflow-y-auto max-h-[calc(90vh-200px)]">
{nfts.length === 0 ? (
<div className="text-center py-16">
<div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mb-6">
<span className="text-3xl">😕</span>
</div>
<h3 className="text-white text-xl font-semibold mb-2">
                    No NFTs Found
</h3>
<p className="text-gray-400">
                    We couldn't find any NFTs in your wallet on this network.
</p>
</div>
              ) : (
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
{nfts.map((nft) => (
<div
key={`${nft.contractAddress}-${nft.tokenId}`}
className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-purple-500/50 cursor-pointer transition-all duration-300 transform hover:scale-105 group"
onClick={() => selectNFT(nft)}
>
<div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-2 mb-4 overflow-hidden">
{nft.image ? (
<img
src={nft.image}
alt={`NFT ${nft.tokenId}`}
className="w-full h-full object-contain rounded-lg group-hover:scale-110 transition-transform duration-300"
onError={(e) => {
e.currentTarget.src =
"https://via.placeholder.com/300x300/6366f1/ffffff?text=NFT";
e.currentTarget.alt = "No image available";
                            }}
/>
                        ) : (
<div className="w-full h-full flex items-center justify-center rounded-lg bg-gradient-to-br from-gray-700 to-gray-800">
<span className="text-4xl text-gray-500">🖼️</span>
</div>
                        )}
</div>
<div className="text-center">
<h4 className="text-white font-semibold text-lg mb-1">
{nft.name || `Token #${nft.tokenId}`}
</h4>
<p className="text-gray-400 text-sm font-mono truncate max-w-[200px]">
                          ID: {nft.tokenId}
</p>
<p className="text-gray-400 text-sm font-mono">
                          Contract:{" "}
{nft.contractAddress
                            ? `${nft.contractAddress.slice(0, 6)}...${nft.contractAddress.slice(-4)}`
                            : "Unknown"}
</p>
</div>
<div className="mt-4 bg-purple-500/20 rounded-lg p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
<span className="text-purple-300 text-sm font-medium">
                          Click to Select
</span>
</div>
</div>
                  ))}
</div>
              )}
</div>
</div>
</div>
      )}
</div>
  );
}