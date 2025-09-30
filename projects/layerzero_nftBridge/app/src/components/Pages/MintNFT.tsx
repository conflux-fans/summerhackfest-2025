// MintNFT.tsx (Updated for single mint only, with button to batch)
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
  Trash2,
  Copy,
} from "lucide-react";
import { WalletConnectButton } from "../Buttons/WalletConnect";
import { mintNFT } from "./utils/collections/contract";
import { validateIpfsCid, getIpfsUrl } from "./utils/collections/ipfs";
import { CONFLUX_CHAIN_ID } from "./utils/constants";

// Define interfaces for type safety
interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: { trait_type: string; value: string }[];
}

export function MintNFT() {
  const { address: collectionAddress } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const [ready, setReady] = useState(false);
  const [metadataName, setMetadataName] = useState("");
  const [description, setDescription] = useState("");
  const [imageCid, setImageCid] = useState("");
  const [attributes, setAttributes] = useState<
    { trait_type: string; value: string }[]
  >([]);
  const [txStatus, setTxStatus] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewName, setPreviewName] = useState("");
  const [generatedJson, setGeneratedJson] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Initialize
  useEffect(() => {
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
      }
    } else {
      setReady(false);
      setTxStatus("Please connect wallet to proceed");
    }
  }, [
    isConnected,
    address,
    walletClient,
    publicClient,
    chainId,
    collectionAddress,
  ]);

  // Update preview and generated JSON based on form inputs
  useEffect(() => {
    const cleanedCid = imageCid.replace("ipfs://", "");
    const metadata: NFTMetadata = {
      name: metadataName,
      description,
      image: cleanedCid ? `ipfs://${cleanedCid}` : "",
      attributes,
    };
    setGeneratedJson(JSON.stringify(metadata, null, 2));
    setPreviewName(metadataName);
    setPreviewUrl(
      cleanedCid && validateIpfsCid(cleanedCid) ? getIpfsUrl(cleanedCid) : "",
    );
  }, [metadataName, description, imageCid, attributes]);

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

  const handleMintNFT = async () => {
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
          : "Please switch to Conflux eSpace",
      );
      return;
    }
    if (!metadataName) {
      setTxStatus("Please enter NFT name.");
      return;
    }
    const cleanedCid = imageCid.replace("ipfs://", "");
    if (!cleanedCid || !validateIpfsCid(cleanedCid)) {
      setTxStatus(
        "Please enter a valid image IPFS CID (e.g., Qm... or bafy..., with or without ipfs://).",
      );
      return;
    }
    const metadata: NFTMetadata = {
      name: metadataName,
      description,
      image: `ipfs://${cleanedCid}`,
      attributes,
    };
    const jsonStr = JSON.stringify(metadata);
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonStr);
    const base64 = btoa(String.fromCharCode(...data));
    const uri = `data:application/json;base64,${base64}`;
    setIsMinting(true);
    try {
      await mintNFT(
        walletClient,
        publicClient,
        collectionAddress,
        address,
        uri,
        () => {}, // Placeholder since we don't need to update nfts here
        () => {}, // Placeholder
        setTxStatus,
      );
      setMetadataName("");
      setDescription("");
      setImageCid("");
      setAttributes([]);
      navigate(`/collections/${collectionAddress}`);
    } catch (err: any) {
      console.error("Minting error:", err);
      setTxStatus(`Failed to mint NFT: ${err?.message || "Unknown error"}`);
    } finally {
      setIsMinting(false);
    }
  };

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: "", value: "" }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (
    index: number,
    field: "trait_type" | "value",
    value: string,
  ) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/collections/${collectionAddress}/batch-mint`)}
              className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center"
            >
              Batch Mint
            </button>
            <WalletConnectButton />
          </div>
        </header>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Mint New NFT</h3>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  NFT Name
                </label>
                <input
                  type="text"
                  placeholder="Enter NFT name (e.g., My Cool NFT)"
                  value={metadataName}
                  onChange={(e) => setMetadataName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter NFT description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Image IPFS CID
                </label>
                <input
                  type="text"
                  placeholder="Enter IPFS CID for image (e.g., Qm... or bafy...)"
                  value={imageCid}
                  onChange={(e) => setImageCid(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Attributes
                </label>
                <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
                  {attributes.map((attr, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Trait type (e.g., Background)"
                        value={attr.trait_type}
                        onChange={(e) =>
                          updateAttribute(index, "trait_type", e.target.value)
                        }
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g., Blue)"
                        value={attr.value}
                        onChange={(e) =>
                          updateAttribute(index, "value", e.target.value)
                        }
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all text-sm"
                      />
                      <button
                        onClick={() => removeAttribute(index)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-300 transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addAttribute}
                  className="w-full bg-white/5 hover:bg-white/10 text-blue-300 font-medium py-2 rounded-2xl transition-all flex items-center justify-center text-sm"
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Add Attribute
                </button>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-gray-300 text-sm font-medium mb-2">
                  Preview
                </p>
                <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="NFT Preview"
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://via.placeholder.com/150?text=Preview";
                      }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-500 text-xs">
                        Enter image CID to preview
                      </p>
                    </div>
                  )}
                </div>
                {previewName && (
                  <p className="text-white text-sm font-medium mt-2 truncate">
                    Name: {previewName}
                  </p>
                )}
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
          <div className="flex gap-4">
            <button
              onClick={handleMintNFT}
              disabled={
                !ready || chainId !== CONFLUX_CHAIN_ID || isMinting
              }
              className={`flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                !ready || chainId !== CONFLUX_CHAIN_ID || isMinting
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isMinting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Minting...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Mint NFT
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
          </div>
        )}
      </div>
    </div>
  );
}