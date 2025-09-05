import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { ethers } from "ethers";
import { GAS_TOP_UP_ADDRESS, GAS_TOP_UP_ABI, PYTH_ABI, PYTH_ADDRESS } from "../../config/contracts";

interface Token {
  tokenAddress: string;
  ticker: string;
}

export function GasTopUp() {
  const { address: connectedAddress } = useAccount();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [tokenDecimals, setTokenDecimals] = useState<Record<string, number>>({});
  const [tickerMap, setTickerMap] = useState<Record<string, string>>({});
  const [amount, setAmount] = useState<string>("");
  const [estimatedCfx, setEstimatedCfx] = useState<string>("");
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [pythFee, setPythFee] = useState<bigint>(0n);
  const [maxAge, setMaxAge] = useState<number>(3600);

  // Initialize ethers BrowserProvider
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
    }
  }, []);

  // Fetch supported tokens
  useEffect(() => {
    if (!provider) return;
    const fetchTokens = async () => {
      try {
        const contract = new ethers.Contract(GAS_TOP_UP_ADDRESS, GAS_TOP_UP_ABI, provider);
        const tokenList: Token[] = await contract.getSupportedTokens();
        setTokens(tokenList);

        const dMap: Record<string, number> = {};
        const tMap: Record<string, string> = {};
        for (const t of tokenList) {
          dMap[t.tokenAddress] = 18;
          tMap[t.tokenAddress] = t.ticker;
        }
        setTokenDecimals(dMap);
        setTickerMap(tMap);

        // Fetch actual decimals per token
        for (const t of tokenList) {
          try {
            const tokenContract = new ethers.Contract(t.tokenAddress, [
              { constant: true, inputs: [], name: "decimals", outputs: [{ name: "", type: "uint8" }], type: "function" },
            ], provider);
            const decimals = await tokenContract.decimals();
            setTokenDecimals((prev) => ({ ...prev, [t.tokenAddress]: Number(decimals) }));
          } catch (err) {
            console.warn("Failed to fetch decimals for token", t.tokenAddress, err);
          }
        }
      } catch (err) {
        console.error("Failed to fetch tokens", err);
      }
    };
    fetchTokens();
  }, [provider]);

  const decimal = selectedToken ? tokenDecimals[selectedToken] ?? 18 : 18;
  const selectedTicker = selectedToken ? tickerMap[selectedToken] ?? "" : "";
  const amountWei = amount && selectedToken ? parseUnits(amount, decimal) : 0n;

  // Estimate CFX receive
  useEffect(() => {
    if (!provider || !selectedToken || !amountWei) return;
    const fetchEstimate = async () => {
      try {
        const contract = new ethers.Contract(GAS_TOP_UP_ADDRESS, GAS_TOP_UP_ABI, provider);
        const res = await contract.estimateCfxOut(selectedToken, amountWei);
        setEstimatedCfx(formatUnits(res[2], 18)); // userAmount
        setEstimateError(null);
      } catch (err: any) {
        console.error("Estimate failed:", err);
        setEstimateError(err?.reason || err?.message || "Estimate error");
        setEstimatedCfx("");
      }
    };
    fetchEstimate();
  }, [provider, selectedToken, amountWei]);

  // Fetch Pyth update fee
  useEffect(() => {
    if (!provider) return;
    const fetchFee = async () => {
      try {
        const pythContract = new ethers.Contract(PYTH_ADDRESS, PYTH_ABI, provider);
        const fee: bigint = await pythContract.getUpdateFee([]);
        setPythFee(fee);
      } catch (err) {
        console.error("Failed to fetch Pyth fee", err);
        setPythFee(0n);
      }
    };
    fetchFee();
  }, [provider]);

  // Handle MetaSwap (fixed for ethers v6)
  const handleMetaSwap = async () => {
    if (!provider || !connectedAddress || !selectedToken || !amount) return;
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(GAS_TOP_UP_ADDRESS, GAS_TOP_UP_ABI, signer);

      const nonce = 0; // TODO: fetch user nonce from GasStation contract
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiry

      const domain = {
        name: "GasStation",
        version: "1",
        chainId: 1030, // replace with correct chain ID
        verifyingContract: GAS_TOP_UP_ADDRESS,
      };

      const types = {
        SwapRequest: [
          { name: "user", type: "address" },
          { name: "tokenAddress", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const value = {
        user: connectedAddress,
        tokenAddress: selectedToken,
        amount: amountWei.toString(),
        nonce,
        deadline,
      };

      // ethers v6 correct EIP-712 signing
      const signature = await signer.signTypedData(domain, types, value);
      const updateData: string[] = []; // replace with actual Pyth updates if needed

      const tx = await contract.metaSwap(
        connectedAddress,
        selectedToken,
        amountWei,
        deadline,
        signature,
        updateData,
        maxAge,
        { value: pythFee }
      );
      await tx.wait();
      console.log("MetaSwap complete");
    } catch (err) {
      console.error("MetaSwap failed:", err);
    }
  };

  return (
    <div className="flex justify-center items-center px-4">
      <div className="w-full max-w-2xl bg-white p-6 border mt-4 rounded-2xl shadow-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Gas Top Up (MetaSwap)</h2>
        <p className="text-center">Connected: <b>{connectedAddress ?? "Not connected"}</b></p>

        {/* Token selection */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Select Token</h3>
          <select
            className="border px-3 py-2 rounded w-full mb-3"
            value={selectedToken ?? ""}
            onChange={(e) => setSelectedToken(e.target.value || null)}
          >
            <option value="">-- Select --</option>
            {tokens.map((t) => (
              <option key={t.tokenAddress} value={t.tokenAddress}>{t.ticker}</option>
            ))}
          </select>
        </div>

        {/* Amount input */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Amount to Swap</h3>
          <input
            type="number"
            placeholder={`Amount of ${selectedTicker}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border px-3 py-2 rounded w-full mb-3"
          />
          {estimatedCfx && <p className="text-gray-700 mb-2">Estimated CFX: <b>{estimatedCfx}</b></p>}
          {estimateError && <p className="text-red-500 mb-2">{estimateError}</p>}

          <button
            onClick={handleMetaSwap}
            disabled={!amount || !selectedToken || !!estimateError}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            Swap {amount} {selectedTicker} via MetaSwap
          </button>

          {pythFee > 0n && (
            <p className="text-sm text-gray-600 mt-2">Pyth update fee: {formatUnits(pythFee, 18)} CFX</p>
          )}
        </div>
      </div>
    </div>
  );
}
