// BridgeHistory.tsx (new component)
import { useState, useEffect } from "react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { usePublicClient } from "wagmi";
import { ChainDropdown } from "../Common/NetworkDropdown";
import {
  CONFLUX_CHAIN_ID,
  BASE_CHAIN_ID,
  ETH_SEPOLIA_CHAIN_ID,
  BASE_SEPOLIA_CHAIN_ID,
  CHAIN_TO_EID,
  EID_TO_NAME,
  EID_TO_CHAIN,
} from "./utils/constants";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  fetchLzMessages,
  getLzNetwork,
} from "./utils/bridge/layerZeroScanUtils";
interface Message {
  pathway: {
    srcEid: number;
    dstEid: number;
  };
  source: {
    tx: {
      txHash: string;
      blockTimestamp: number;
    };
  };
  destination: {
    tx?: {
      txHash: string;
    };
  };
  status: {
    name: string;
  };
  guid: string;
}
export function BridgeHistory() {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const publicClient = usePublicClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState<number>(0); // 0 for all
  const [txStatus, setTxStatus] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (isConnected && address && chainId) {
      setReady(true);
      fetchHistory(address, chainId);
    } else {
      setReady(false);
      setTxStatus("Please connect wallet to view history");
    }
  }, [isConnected, address, chainId]);
  const fetchHistory = async (addr: string, chId: number) => {
    setIsLoading(true);
    setTxStatus("");
    try {
      const network = getLzNetwork(chId);
      const msgs = await fetchLzMessages(addr, network);
      setMessages(msgs);
    } catch (error) {
      setTxStatus("Failed to fetch bridge history");
    } finally {
      setIsLoading(false);
    }
  };
  const filteredMessages = messages.filter(
    (msg) =>
      selectedChainId === 0 ||
      msg.pathway.srcEid === CHAIN_TO_EID[selectedChainId],
  );
  const getStatusIcon = (statusName: string) => {
    if (statusName === "DELIVERED")
      return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    if (
      [
        "FAILED",
        "BLOCKED",
        "PAYLOAD_STORED",
        "APPLICATION_BURNED",
        "APPLICATION_SKIPPED",
        "UNRESOLVABLE_COMMAND",
        "MALFORMED_COMMAND",
      ].includes(statusName)
    )
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    return <Clock className="w-5 h-5 text-yellow-400 animate-spin" />;
  };
  const getExplorerUrl = (chId: number, txHash: string) => {
    switch (chId) {
      case ETH_SEPOLIA_CHAIN_ID:
        return `https://sepolia.etherscan.io/tx/${txHash}`;
      case BASE_SEPOLIA_CHAIN_ID:
        return `https://sepolia.basescan.org/tx/${txHash}`;
      case CONFLUX_CHAIN_ID:
        return `https://confluxscan.io/tx/${txHash}`;
      case BASE_CHAIN_ID:
        return `https://basescan.org/tx/${txHash}`;
      default:
        return `#`;
    }
  };
  const getChainName = (eid: number) => EID_TO_NAME[eid] || "Unknown";
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
              <span className="text-2xl">📜</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Bridge History
            </h1>
          </div>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            View your past NFT bridges across chains powered by LayerZero
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {isLoading ? (
            <div className="text-center py-16">
              <Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-white">Loading bridge history...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mb-6">
                <span className="text-4xl text-gray-500">📭</span>
              </div>
              <h4 className="text-white text-xl font-semibold mb-2">
                No Bridges Found
              </h4>
              <p className="text-gray-400">
                You haven't made any NFT bridges yet or no data available.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-300">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4">From → To</th>
                    <th className="py-3 px-4">Source Tx</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((msg) => {
                    const srcChain = EID_TO_CHAIN[msg.pathway.srcEid] || 0;
                    const dstChain = EID_TO_CHAIN[msg.pathway.dstEid] || 0;
                    const time = new Date(
                      msg.source.tx.blockTimestamp * 1000,
                    ).toLocaleString();
                    return (
                      <tr
                        key={msg.guid}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="py-3 px-4 flex items-center">
                          {getChainName(msg.pathway.srcEid)}{" "}
                          <ArrowRight className="w-4 h-4 mx-2" />{" "}
                          {getChainName(msg.pathway.dstEid)}
                        </td>
                        <td className="py-3 px-4">
                          <a
                            href={getExplorerUrl(
                              srcChain,
                              msg.source.tx.txHash,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-300 hover:text-purple-200 underline font-mono text-sm"
                          >
                            {msg.source.tx.txHash.slice(0, 6)}...
                            {msg.source.tx.txHash.slice(-4)}
                          </a>
                        </td>
                        <td className="py-3 px-4 flex items-center gap-2">
                          {getStatusIcon(msg.status.name)}
                          {msg.status.name}
                        </td>
                        <td className="py-3 px-4 text-sm">{time}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {txStatus && (
            <div
              className={`mt-6 p-4 rounded-2xl border ${
                txStatus.includes("Failed")
                  ? "bg-red-500/10 border-red-500/20 text-red-300"
                  : "bg-green-500/10 border-green-500/20 text-green-300"
              }`}
            >
              <p className="text-center font-medium">{txStatus}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
