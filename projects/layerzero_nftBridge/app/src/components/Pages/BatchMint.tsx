import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useWalletClient, usePublicClient, useSwitchChain } from "wagmi";
import {
  Loader2,
  Network,
  Plus,
  Image as ImageIcon,
  ArrowLeft,
  Copy,
  Upload,
} from "lucide-react";
import { WalletConnectButton } from "../Buttons/WalletConnect";
import { batchMintNFT } from "./utils/collections/contract"; // Assuming this function is implemented in utils
import { validateIpfsCid, getIpfsUrl } from "./utils/collections/ipfs";
import { CONFLUX_CHAIN_ID } from "./utils/constants";
import { NFT_MANAGER_CONFLUX } from './utils/constants';
import { COLLECTION_ABI } from "./utils/abi/collectionAbi"; // Ensure this is imported

// Define interfaces for type safety
interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: { trait_type: string; value: string }[];
}

export function BatchMint() {
  const { address: collectionAddress } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const [ready, setReady] = useState(false);
  const [batchJson, setBatchJson] = useState("");
  const [metadatas, setMetadatas] = useState<NFTMetadata[]>([]);
  const [parseError, setParseError] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [generatedJson, setGeneratedJson] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [checkingOwner, setCheckingOwner] = useState(true);

  // Initialize and check owner
  useEffect(() => {
    if (
      isConnected &&
      address &&
      walletClient &&
      publicClient &&
      collectionAddress &&
      chainId === CONFLUX_CHAIN_ID
    ) {
      setReady(true);
      setTxStatus("");
      const checkOwner = async () => {
        setCheckingOwner(true);
        try {
          const owner = await publicClient.readContract({
            address: collectionAddress as `0x${string}`,
            abi: COLLECTION_ABI,
            functionName: "owner",
          }) as `0x${string}`;
          setIsOwner(owner.toLowerCase() === address.toLowerCase());
        } catch (err: any) {
          console.error("Failed to check collection owner:", err);
          setTxStatus(`Error checking collection ownership: ${err?.message || "Unknown error"}`);
          setIsOwner(false);
        } finally {
          setCheckingOwner(false);
        }
      };
      checkOwner();
    } else {
      setReady(false);
      setIsOwner(false);
      setTxStatus(
        !isConnected
          ? "Please connect wallet to proceed"
          : "Please switch to Conflux eSpace"
      );
    }
  }, [
    isConnected,
    address,
    walletClient,
    publicClient,
    chainId,
    collectionAddress,
  ]);

  // Update for batch mode
  useEffect(() => {
    try {
      const parsed = JSON.parse(batchJson);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array of metadata objects");
      }
      const validated = parsed.map((m: any) => {
        const cleanedCid = (m.image || "").replace("ipfs://", "");
        return {
          name: m.name,
          description: m.description,
          image: cleanedCid ? `ipfs://${cleanedCid}` : "",
          attributes: m.attributes,
        };
      });
      setMetadatas(validated);
      setGeneratedJson(JSON.stringify(validated, null, 2));
      setParseError("");
    } catch (err: any) {
      setParseError(`Invalid JSON: ${err.message}`);
      setMetadatas([]);
      setGeneratedJson("");
    }
  }, [batchJson]);

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

  const handleBatchMintNFT = async () => {
    if (
      !isConnected ||
      !walletClient ||
      !publicClient ||
      !collectionAddress ||
      chainId !== CONFLUX_CHAIN_ID
    ) {
      setTxStatus(
        !isConnected
          ? "Please connect wallet to mint NFT"
          : "Please switch to Conflux eSpace"
      );
      return;
    }
    if (!isOwner) {
      setTxStatus(
        "You are not the owner of this collection. If this is a wrapped collection, mint on the home chain and bridge over."
      );
      return;
    }
    if (metadatas.length === 0 || !!parseError) {
      setTxStatus("No valid metadata to mint.");
      return;
    }
    const uris = metadatas.map((metadata) => {
      const jsonStr = JSON.stringify(metadata);
      const encoder = new TextEncoder();
      const data = encoder.encode(jsonStr);
      const base64 = btoa(String.fromCharCode(...data));
      return `data:application/json;base64,${base64}`;
    });
    let hasInvalidImage = false;
    metadatas.forEach((m) => {
      const cleanedCid = (m.image || "").replace("ipfs://", "");
      if (cleanedCid && !validateIpfsCid(cleanedCid)) {
        hasInvalidImage = true;
      }
    });
    if (hasInvalidImage) {
      setTxStatus(
        "One or more invalid image IPFS CIDs (e.g., Qm... or bafy..., with or without ipfs://)."
      );
      return;
    }
    setIsMinting(true);
    try {
      // Simulate first to catch reverts early (e.g., not owner, though we already checked)
      await publicClient.simulateContract({
        address: NFT_MANAGER_CONFLUX,
        abi: COLLECTION_ABI,
        functionName: "batchMintNFT",
        args: [collectionAddress as `0x${string}`, address as `0x${string}`, uris],
        account: address as `0x${string}`,
      });
      await batchMintNFT(
        walletClient,
        publicClient,
        collectionAddress as `0x${string}`,
        address as `0x${string}`,
        uris,
        setTxStatus
      );
      setBatchJson("");
      navigate(`/collections/${collectionAddress}`);
    } catch (err: any) {
      console.error("Batch minting error:", err);
      setTxStatus(`Failed to batch mint NFTs: ${err?.message || "Unknown error"}`);
    } finally {
      setIsMinting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setBatchJson(text);
      };
      reader.onerror = (err) => {
        console.error("File read error:", err);
        setParseError("Failed to read JSON file.");
      };
      reader.readAsText(file);
    } else {
      setParseError("Please upload a valid JSON file.");
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(generatedJson);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8 md:mb-12">
          <button
            onClick={() => navigate(`/collections/${collectionAddress}`)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Collection
          </button>
          <WalletConnectButton />
        </header>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Batch Mint NFTs</h3>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Batch Metadata JSON (Array of objects)
                </label>
                <textarea
                  placeholder='[{"name": "NFT1", "description": "...", "image": "ipfs://Qm...", "attributes": [{"trait_type": "...", "value": "..."}]},{"name": "NFT2", ...}]'
                  value={batchJson}
                  onChange={(e) => setBatchJson(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all min-h-[300px] font-mono text-sm"
                />
                {parseError && <p className="text-red-300 mt-2">{parseError}</p>}
                <div className="mt-2">
                  <label
                    htmlFor="json-upload"
                    className="cursor-pointer bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium py-2 px-4 rounded-2xl transition-all flex items-center justify-center text-sm inline-flex"
                  >
                    <Upload className="w-3 h-3 mr-2" />
                    Upload JSON File
                  </label>
                  <input
                    id="json-upload"
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-gray-300 text-sm font-medium mb-2">
                  Preview
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-96">
                  {metadatas.map((m, idx) => {
                    const cleanedCid = (m.image || "").replace("ipfs://", "");
                    const previewUrl = cleanedCid && validateIpfsCid(cleanedCid) ? getIpfsUrl(cleanedCid) : "";
                    return (
                      <div key={idx} className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl p-2">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt={`NFT Preview ${idx + 1}`}
                            className="w-full aspect-square object-cover rounded-xl"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "https://via.placeholder.com/150?text=Preview";
                            }}
                          />
                        ) : (
                          <div className="aspect-square flex items-center justify-center text-center p-4">
                            <ImageIcon className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="text-gray-500 text-xs">
                              Enter image CID to preview
                            </p>
                          </div>
                        )}
                        {m.name && (
                          <p className="text-white text-sm font-medium mt-2 truncate">
                            {m.name}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {metadatas.length === 0 && (
                    <div className="text-center p-4 col-span-full">
                      <p className="text-gray-500 text-xs">
                        Enter valid JSON to preview
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Generated Metadata JSON
                </label>
                <pre className="bg-white/5 rounded-2xl p-4 text-white text-xs font-mono overflow-auto max-h-40">
                  {generatedJson}
                </pre>
                <button
                  onClick={copyJson}
                  className="w-full mt-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium py-2 rounded-2xl transition-all flex items-center justify-center text-sm"
                >
                  <Copy className="w-3 h-3 mr-2" />
                  {isCopied ? "Copied!" : "Copy JSON"}
                </button>
              </div>
            </div>
          </div>
          {!isOwner && !checkingOwner && (
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded-2xl">
              <p className="text-center font-medium">
                You are not the owner of this collection. This may be a wrapped collection from another chain. To mint new NFTs, please do so on the home chain and bridge them over using the DynamicONFTBridge.
              </p>
            </div>
          )}
          <div className="flex gap-4">
            <button
              onClick={handleBatchMintNFT}
              disabled={
                !ready ||
                chainId !== CONFLUX_CHAIN_ID ||
                isMinting ||
                metadatas.length === 0 ||
                !!parseError ||
                !isOwner ||
                checkingOwner
              }
              className={`flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                !ready ||
                chainId !== CONFLUX_CHAIN_ID ||
                isMinting ||
                metadatas.length === 0 ||
                !!parseError ||
                !isOwner ||
                checkingOwner
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {checkingOwner ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Checking Ownership...
                </>
              ) : isMinting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Minting...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Mint Batch NFTs
                </>
              )}
            </button>
            <button
              onClick={() => navigate(`/collections/${collectionAddress}`)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-2xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
        {txStatus && (
          <div className={`p-4 rounded-2xl border ${getTxStatusClasses()} mt-6`}>
            <p className="text-center font-medium">{txStatus}</p>
          </div>
        )}
        {chainId !== CONFLUX_CHAIN_ID && (
          <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
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
                  <div className="text-sm text-yellow-400">
                    Switch Required
                  </div>
                </div>
              </div>
              <span className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></span>
            </div>
            <button
              onClick={switchToBaseSepolia}
              disabled={isSwitching || !isConnected}
              className={`w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                isSwitching || !isConnected ? "opacity-50 cursor-not-allowed" : ""
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
          </div>
        )}
      </div>
    </div>
  );
}