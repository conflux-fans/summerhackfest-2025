// BridgeTransactionDetail.tsx (new component)
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
Clock,
AlertCircle,
CheckCircle2,
ArrowRight,
Loader2,
Image as ImageIcon,
} from "lucide-react";
import {
CONFLUX_CHAIN_ID,
BASE_CHAIN_ID,
// ETH_SEPOLIA_CHAIN_ID,
// BASE_SEPOLIA_CHAIN_ID,
ARBITRUM_CHAIN_ID,
CHAIN_TO_EID,
EID_TO_NAME,
EID_TO_CHAIN,
} from "./utils/constants";
import confluxLogo from "../../assets/logos/conflux.svg";
import baseLogo from "../../assets/logos/base.svg";
// import ethereumLogo from "../../assets/logos/ethereum.svg";
// import baseSepoliaLogo from "../../assets/logos/base-sepolia.svg";
import arbitrumLogo from "../../assets/logos/arbitrum.svg";
import { decodeAbiParameters } from "viem";
interface Message {
pathway: {
srcEid: number;
dstEid: number;
  };
source: {
tx: {
txHash: string;
blockTimestamp: number;
payload: `0x${string}`;
    };
  };
destination: {
tx?: {
txHash: string;
blockTimestamp: number;
    };
  };
status: {
name: string;
message?: string;
  };
guid: string;
verification?: any; // Add if needed
config?: any; // Add if needed
}
export function BridgeTransactionDetail() {
const { txid } = useParams<{ txid: string }>();
const [message, setMessage] = useState<Message | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [txStatus, setTxStatus] = useState("Attempting to fetch message...");
const [pollCount, setPollCount] = useState(0);
const [decodedPayload, setDecodedPayload] = useState<any>(null);
const [detectedNetwork, setDetectedNetwork] = useState<"mainnet" | "testnet" | null>(null);
useEffect(() => {
const pollMessage = async () => {
const msg = await fetchMessage(txid || "", detectedNetwork);
if (msg) {
setMessage(msg);
setIsLoading(false);
decodePayload(msg.source.tx.payload);
if (["DELIVERED", "FAILED", "BLOCKED", "PAYLOAD_STORED", "APPLICATION_BURNED", "APPLICATION_SKIPPED", "UNRESOLVABLE_COMMAND", "MALFORMED_COMMAND"].includes(msg.status.name)) {
return; // Stop polling on final status
        }
      } else {
setPollCount((prev) => prev + 1);
      }
    };
pollMessage(); // Initial fetch
const interval = setInterval(pollMessage, 10000); // Poll every 5s
return () => clearInterval(interval);
  }, [txid, detectedNetwork]);
useEffect(() => {
if (pollCount > 20) { // ~100s
setTxStatus("Transaction not found or not a LayerZero message.");
setIsLoading(false);
    }
  }, [pollCount]);
const fetchMessage = async (txHash: string, preferredNetwork: "mainnet" | "testnet" | null): Promise<Message | null> => {
const networksToTry = preferredNetwork ? [preferredNetwork] : ["mainnet"];
let msg: Message | null = null;
for (const network of networksToTry) {
const baseDomain = network === "testnet" ? 'scan-testnet.layerzero-api.com' : 'scan.layerzero-api.com';
const originalUrl = `https://${baseDomain}/v1/messages/tx/${txHash}`;
const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`;
try {
const response = await fetch(proxyUrl);
if (response.ok) {
const data = await response.json();
if (data.data && data.data.length > 0) {
msg = data.data[0];
if (!detectedNetwork) {
setDetectedNetwork(network);
            }
break;
          }
        }
      } catch (error) {
console.error(`Failed to fetch from ${network}:`, error);
      }
    }
return msg;
  };
const decodePayload = (payload: `0x${string}`) => {
try {
const params = [
        { type: 'address', name: '_to' },
        { type: 'uint256[]', name: '_tokenIds' },
        { type: 'uint32', name: 'homeEid' },
        { type: 'address', name: 'canonicalAddr' },
        { type: 'string', name: 'collName' },
        { type: 'string', name: 'collSymbol' },
        { type: 'string[]', name: 'tokenURIs' },
      ] as const;
const decoded = decodeAbiParameters(params, payload);
setDecodedPayload({
to: decoded[0],
tokenIds: decoded[1],
homeEid: decoded[2],
canonicalAddr: decoded[3],
collName: decoded[4],
collSymbol: decoded[5],
tokenURIs: decoded[6],
      });
    } catch (error) {
console.error("Failed to decode payload:", error);
setDecodedPayload(null);
    }
  };
const getImageFromMetadata = (uri: string): string => {
if (uri.startsWith('data:application/json;base64,')) {
const base64 = uri.split(',')[1];
const jsonStr = atob(base64);
try {
const json = JSON.parse(jsonStr);
return getIpfsUrl(json.image || '');
      } catch (error) {
console.error("Failed to parse metadata JSON:", error);
return '';
      }
    }
return getIpfsUrl(uri);
  };
const getStatusIcon = (statusName: string) => {
if (statusName === "DELIVERED") return <CheckCircle2 className="w-4 h-4" />;
if (["FAILED", "BLOCKED", "PAYLOAD_STORED", "APPLICATION_BURNED", "APPLICATION_SKIPPED", "UNRESOLVABLE_COMMAND", "MALFORMED_COMMAND"].includes(statusName))
return <AlertCircle className="w-4 h-4" />;
return <Clock className="w-4 h-4 animate-spin" />;
  };
const getStatusColor = (statusName: string) => {
if (statusName === "DELIVERED")
return "bg-green-500/20 text-green-300 border-green-500/30";
if (["FAILED", "BLOCKED", "PAYLOAD_STORED", "APPLICATION_BURNED", "APPLICATION_SKIPPED", "UNRESOLVABLE_COMMAND", "MALFORMED_COMMAND"].includes(statusName))
return "bg-red-500/20 text-red-300 border-red-500/30";
return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
  };
const getExplorerUrl = (chainId: number, txHash: string) => {
switch (chainId) {
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
const getChainName = (eid: number) => EID_TO_NAME[eid] || "Unknown";
const getChainLogo = (eid: number) => {
const chainId = EID_TO_CHAIN[eid] || 0;
switch (chainId) {
case CONFLUX_CHAIN_ID:
return confluxLogo;
case BASE_CHAIN_ID:
return baseLogo;
// case ETH_SEPOLIA_CHAIN_ID:
// return ethereumLogo;
// case BASE_SEPOLIA_CHAIN_ID:
// return baseSepoliaLogo;
case ARBITRUM_CHAIN_ID:
return arbitrumLogo;
default:
return "";
    }
  };
const getIpfsUrl = (uri: string) => {
if (uri.startsWith('ipfs://')) {
return `https://ipfs.io/ipfs/${uri.replace('ipfs://', '')}`;
    }
return uri;
  };
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
<span className="text-2xl">🔍</span>
</div>
<h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent py-2">
              Transaction Detail
</h1>
</div>
<p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            View details of your NFT bridge transaction powered by LayerZero
</p>
</div>
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
{isLoading ? (
<div className="text-center py-16">
<Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
<p className="text-white">{txStatus}</p>
</div>
          ) : !message ? (
<div className="text-center py-16">
<div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mb-6">
<span className="text-4xl text-gray-500">❓</span>
</div>
<h4 className="text-white text-xl font-semibold mb-2">
                Transaction Not Found
</h4>
<p className="text-gray-400">
                No LayerZero message found for this transaction hash.
</p>
</div>
          ) : (
<div className="space-y-8">
<div className="bg-white/5 rounded-2xl p-6 border border-white/10">
<h3 className="text-white text-lg font-semibold mb-4 flex items-center">
<span className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"></span>
                  Overview
</h3>
<div className="grid md:grid-cols-2 gap-6">
<div className="flex items-center gap-4">
<img
src={getChainLogo(message.pathway.srcEid)}
alt={`${getChainName(message.pathway.srcEid)} logo`}
className="w-8 h-8 rounded-full shadow-sm"
/>
<div>
<p className="text-gray-400 text-sm">From</p>
<p className="text-white font-medium">{getChainName(message.pathway.srcEid)}</p>
</div>
<ArrowRight className="w-5 h-5 text-gray-400 mx-2" />
<img
src={getChainLogo(message.pathway.dstEid)}
alt={`${getChainName(message.pathway.dstEid)} logo`}
className="w-8 h-8 rounded-full shadow-sm"
/>
<div>
<p className="text-gray-400 text-sm">To</p>
<p className="text-white font-medium">{getChainName(message.pathway.dstEid)}</p>
</div>
</div>
<div>
<p className="text-gray-400 text-sm">Status</p>
<span
className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border mt-1 ${getStatusColor(
message.status.name
                      )}`}
>
{getStatusIcon(message.status.name)}
{message.status.name}
</span>
{message.status.message && (
<p className="text-gray-400 text-sm mt-2">{message.status.message}</p>
                    )}
</div>
</div>
<div className="grid md:grid-cols-2 gap-6 mt-6">
<div>
<p className="text-gray-400 text-sm">Source Transaction</p>
<a
href={getExplorerUrl(EID_TO_CHAIN[message.pathway.srcEid] || 0, message.source.tx.txHash)}
target="_blank"
rel="noopener noreferrer"
className="text-purple-300 hover:text-purple-200 underline font-mono text-sm block mt-1"
>
{message.source.tx.txHash.slice(0, 6)}...{message.source.tx.txHash.slice(-4)}
</a>
<p className="text-gray-400 text-sm mt-2">
                      Time: {new Date(message.source.tx.blockTimestamp * 1000).toLocaleString()}
</p>
</div>
<div>
<p className="text-gray-400 text-sm">Destination Transaction</p>
{message.destination?.tx?.txHash ? (
<a
href={getExplorerUrl(EID_TO_CHAIN[message.pathway.dstEid] || 0, message.destination.tx.txHash)}
target="_blank"
rel="noopener noreferrer"
className="text-purple-300 hover:text-purple-200 underline font-mono text-sm block mt-1"
>
{message.destination.tx.txHash.slice(0, 6)}...{message.destination.tx.txHash.slice(-4)}
</a>
                    ) : (
<span className="text-gray-500 italic mt-1 block">Pending</span>
                    )}
{message.destination?.tx?.blockTimestamp && (
<p className="text-gray-400 text-sm mt-2">
                        Time: {new Date(message.destination.tx.blockTimestamp * 1000).toLocaleString()}
</p>
                    )}
</div>
</div>
<div className="mt-6">
<p className="text-gray-400 text-sm">GUID</p>
<p className="text-white font-mono text-sm mt-1 break-all">{message.guid}</p>
</div>
</div>
{decodedPayload && (
<div className="bg-white/5 rounded-2xl p-6 border border-white/10">
<h3 className="text-white text-lg font-semibold mb-4 flex items-center">
<span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
                    Bridged NFTs
</h3>
<div className="space-y-4">
<div>
<p className="text-gray-400 text-sm">Collection</p>
<p className="text-white font-medium mt-1">
{decodedPayload.collName} ({decodedPayload.collSymbol})
</p>
</div>
<div>
<p className="text-gray-400 text-sm">Home Chain</p>
<p className="text-white mt-1">{getChainName(decodedPayload.homeEid)}</p>
</div>
<div>
<p className="text-gray-400 text-sm">Canonical Address</p>
<p className="text-white font-mono text-sm mt-1 break-all">{decodedPayload.canonicalAddr}</p>
</div>
<div>
<p className="text-gray-400 text-sm">Recipient</p>
<p className="text-white font-mono text-sm mt-1 break-all">{decodedPayload.to}</p>
</div>
<div>
<p className="text-gray-400 text-sm">Token IDs</p>
<p className="text-white mt-1">{decodedPayload.tokenIds.join(', ')}</p>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
{decodedPayload.tokenURIs.map((uri: string, index: number) => (
<div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
<div className="aspect-square mb-2">
<img
src={getImageFromMetadata(uri)}
alt={`NFT #${decodedPayload.tokenIds[index]}`}
className="w-full h-full object-cover rounded-lg"
onError={(e) => {
e.currentTarget.src = "https://via.placeholder.com/300x300/6366f1/ffffff?text=NFT";
                              }}
/>
</div>
<p className="text-white font-medium text-center">#{decodedPayload.tokenIds[index]}</p>
<a
href={uri}
target="_blank"
rel="noopener noreferrer"
className="text-purple-300 text-sm hover:text-purple-200 underline block text-center truncate"
>
                            View Metadata
</a>
</div>
                      ))}
</div>
</div>
</div>
              )}
{/* Add more sections if needed, e.g., Verification, Config */}
{txStatus && (
<div
className={`mt-6 p-4 rounded-2xl border ${
txStatus.includes("Failed") || txStatus.includes("not found")
                      ? "bg-red-500/10 border-red-500/20 text-red-300"
                      : "bg-green-500/10 border-green-500/20 text-green-300"
}`}
>
<p className="text-center font-medium">{txStatus}</p>
</div>
              )}
</div>
          )}
</div>
</div>
</div>
  );
}