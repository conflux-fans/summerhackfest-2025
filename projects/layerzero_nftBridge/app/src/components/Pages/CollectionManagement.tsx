// CollectionManagement.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useWalletClient, usePublicClient, useSwitchChain } from "wagmi";
import {
  Loader2,
  Network,
  Plus,
  Image as ImageIcon,
  Info,
  ArrowLeft,
  Trash2,
  Copy,
} from "lucide-react";
import { WalletConnectButton } from "../Buttons/WalletConnect";
import { fetchNfts } from "./utils/collections/contract";
import { getIpfsUrl } from "./utils/collections/ipfs";
import { CONFLUX_CHAIN_ID } from "./utils/constants";
import { COLLECTION_ABI } from "./utils/abi/collectionAbi";
// Define interfaces for type safety
interface NFT {
  tokenId: string;
  uri: string;
  image: string;
  name?: string;
}
export function CollectionManagement() {
  const { address: collectionAddress } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const [ready, setReady] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [collectionSymbol, setCollectionSymbol] = useState("");
  const [collectionImage, setCollectionImage] = useState("");
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [txStatus, setTxStatus] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);
  const [isLoadingCollection, setIsLoadingCollection] = useState(true);
  const [isLoadingNfts, setIsLoadingNfts] = useState(true);
  // Initialize and fetch collection details
  useEffect(() => {
    const initialize = async () => {
      if (
        isConnected &&
        address &&
        walletClient &&
        publicClient &&
        collectionAddress
      ) {
        setReady(true);
        if (chainId !== CONFLUX_CHAIN_ID) {
          setTxStatus("Please switch to Conflux eSpace");
        } else {
          setTxStatus("");
          setIsLoadingCollection(true);
          setIsLoadingNfts(true);
          try {
            const name = (await publicClient.readContract({
              address: collectionAddress as `0x${string}`,
              abi: COLLECTION_ABI,
              functionName: "name",
            })) as string;
            const symbol = (await publicClient.readContract({
              address: collectionAddress as `0x${string}`,
              abi: COLLECTION_ABI,
              functionName: "symbol",
            })) as string;
            const imageCid = (await publicClient.readContract({
              address: collectionAddress as `0x${string}`,
              abi: COLLECTION_ABI,
              functionName: "collectionImage",
            })) as string;
            setCollectionName(name);
            setCollectionSymbol(symbol);
            setCollectionImage(
              imageCid
                ? getIpfsUrl(imageCid.replace("ipfs://", ""))
                : "https://via.placeholder.com/150?text=Collection+Image",
            );
          } catch (err) {
            console.error("Failed to fetch collection details:", err);
            setTxStatus("Failed to load collection details");
          } finally {
            setIsLoadingCollection(false);
          }
          try {
            await fetchNfts(
              collectionAddress,
              address,
              publicClient,
              setNfts,
              setTxStatus,
            );
          } catch (err) {
            console.error("Failed to fetch NFTs:", err);
            setTxStatus("Failed to load NFTs");
          } finally {
            setIsLoadingNfts(false);
          }
        }
      } else {
        setReady(false);
        setTxStatus("Please connect wallet to proceed");
      }
    };
    initialize();
  }, [
    isConnected,
    address,
    walletClient,
    publicClient,
    chainId,
    collectionAddress,
  ]);
  const switchToBaseSepolia = async () => {
    if (!isConnected) {
      setTxStatus("Please connect wallet to switch networks");
      return;
    }
    setIsSwitching(true);
    try {
      await switchChainAsync({ chainId: CONFLUX_CHAIN_ID });
      setTxStatus("Successfully switched to Conflux eSpace!");
    } catch (err: any) {
      console.error("Failed to switch to Conflux eSpace:", err);
      setTxStatus(
        `Failed to switch to Conflux eSpace network: ${err?.message || "Unknown error"}`,
      );
    }
    setIsSwitching(false);
  };
  const getTxStatusClasses = () => {
    if (txStatus.includes("Failed") || txStatus.includes("Please")) {
      return "bg-red-500/10 border-red-500/20 text-red-300";
    }
    if (txStatus.includes("🎉") || txStatus.includes("Successfully")) {
      return "bg-green-500/10 border-green-500/20 text-green-300";
    }
    return "bg-blue-500/10 border-blue-500/20 text-blue-300";
  };
  const SkeletonLoader = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`}>
      <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/5"></div>
    </div>
  );
  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      <div className="relative z-10 w-full mx-auto">
        <header className="flex items-center justify-between mb-8 md:mb-12">
          <button
            onClick={() => navigate("/collections")}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Collections
          </button>
          <WalletConnectButton />
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              {isLoadingCollection ? (
                <>
                  <SkeletonLoader className="h-8 w-32 mb-4" />
                  <SkeletonLoader className="aspect-square mb-4" />
                  <div className="space-y-2">
                    <SkeletonLoader className="h-4" />
                    <SkeletonLoader className="h-4" />
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {collectionName || "Collection"}
                  </h2>
                  <div className="relative mb-4">
                    <img
                      src={collectionImage}
                      alt={collectionName}
                      className="w-full aspect-square object-cover rounded-2xl"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://via.placeholder.com/150?text=Collection+Image";
                      }}
                    />
                    {collectionSymbol && (
                      <div className="absolute top-2 right-2 bg-indigo-500/80 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {collectionSymbol}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Network:</span>
                      <span className="text-blue-300">Conflux eSpace</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Contract:</span>
                      <span className="font-mono text-purple-300 truncate">
                        {collectionAddress
                          ? `${collectionAddress.slice(0, 6)}...${collectionAddress.slice(-4)}`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Network className="w-5 h-5 mr-2 text-blue-400" />
                Network Status
              </h3>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                    B
                  </div>
                  <div>
                    <div className="text-white font-medium">Conflux eSpace</div>
                    <div
                      className={`text-sm ${chainId === CONFLUX_CHAIN_ID ? "text-green-400" : "text-yellow-400"}`}
                    >
                      {chainId === CONFLUX_CHAIN_ID
                        ? "Connected"
                        : "Switch Required"}
                    </div>
                  </div>
                </div>
                <span
                  className={`w-3 h-3 rounded-full ${chainId === CONFLUX_CHAIN_ID ? "bg-green-400" : "bg-yellow-400"} animate-pulse`}
                ></span>
              </div>
              {chainId !== CONFLUX_CHAIN_ID && (
                <button
                  onClick={switchToBaseSepolia}
                  disabled={isSwitching || !isConnected}
                  className={`w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                    isSwitching || !isConnected
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isSwitching ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Switching...
                    </>
                  ) : (
                    <>
                      <Network className="w-4 h-4 mr-2" />
                      Switch Network
                    </>
                  )}
                </button>
              )}
            </div>
            {txStatus && (
              <div className={`p-4 rounded-2xl border ${getTxStatusClasses()}`}>
                <p className="text-center font-medium">{txStatus}</p>
              </div>
            )}
          </div>
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-purple-400" />
                NFTs in Collection
              </h3>
              <button
                onClick={() => navigate(`/collections/${collectionAddress}/mint`)}
                disabled={!isConnected || chainId !== CONFLUX_CHAIN_ID}
                className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-2xl transition-all duration-300 flex items-center ${
                  !isConnected || chainId !== CONFLUX_CHAIN_ID
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Mint NFT
              </button>
            </div>
            {isLoadingNfts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <SkeletonLoader key={i} className="h-64" />
                ))}
              </div>
            ) : nfts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nfts.map((nft) => (
                  <div
                    key={nft.tokenId}
                    className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer group"
                  >
                    <img
                      src={nft.image}
                      alt={nft.name || `NFT ${nft.tokenId}`}
                      className="w-full aspect-square object-cover rounded-xl mb-3 group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://via.placeholder.com/150?text=NFT+Image";
                      }}
                    />
                    <p className="text-white text-sm font-medium mb-1 truncate">
                      {nft.name || `Token #${nft.tokenId}`}
                    </p>
                    <p className="text-gray-400 text-xs font-mono truncate">
                      URI: {nft.uri.slice(0, 20)}...
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                <p>No NFTs found in this collection yet.</p>
                <p className="text-sm mt-2">Mint your first one!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}