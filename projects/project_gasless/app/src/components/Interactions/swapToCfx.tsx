import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { ethers } from "ethers";
import {
  GAS_TOP_UP_ADDRESS,
  GAS_TOP_UP_ABI,
  PYTH_ABI,
  PYTH_ADDRESS,
  ERC20_ABI,
} from "../../config/contracts";
import { fetchPythUpdateData } from "../../utils/pyth";

interface Token {
  tokenAddress: string;
  ticker: string;
  feedId: string;
}

export function GasTopUp() {
  const { address: connectedAddress } = useAccount();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [tokenDecimals, setTokenDecimals] = useState<Record<string, number>>({});
  const [tickerMap, setTickerMap] = useState<Record<string, string>>({});
  const [amount, setAmount] = useState<string>("0.01"); // default 0.01 USDT
  const [estimatedCfx, setEstimatedCfx] = useState<string>("");
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [pythFee, setPythFee] = useState<bigint>(0n);
  const [maxAge, setMaxAge] = useState<number>(3600);
  const [loading, setLoading] = useState(false);
  const [nonce, setNonce] = useState<string>("0");

  // Initialize provider WITHOUT ENS
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const customProvider = new ethers.BrowserProvider(window.ethereum, {
        chainId: 1030,
        name: "conflux-espace",
      });
      setProvider(customProvider);
    }
  }, []);

  // Fetch supported tokens
  useEffect(() => {
    if (!provider) return;
    const fetchTokens = async () => {
      try {
        const contract = new ethers.Contract(
          GAS_TOP_UP_ADDRESS,
          GAS_TOP_UP_ABI,
          provider
        );
        const tokenList: Token[] = await contract.getSupportedTokens();
        setTokens(tokenList);

        const dMap: Record<string, number> = {};
        const tMap: Record<string, string> = {};
        tokenList.forEach((t) => {
          dMap[t.tokenAddress] = 18;
          tMap[t.tokenAddress] = t.ticker;
        });
        setTokenDecimals(dMap);
        setTickerMap(tMap);

        // Fetch decimals dynamically
        for (const t of tokenList) {
          try {
            const tokenContract = new ethers.Contract(
              t.tokenAddress,
              ERC20_ABI,
              provider
            );
            const decimals = await tokenContract.decimals();
            setTokenDecimals((prev) => ({
              ...prev,
              [t.tokenAddress]: Number(decimals),
            }));
          } catch (err) {
            console.warn(
              "Failed to fetch decimals for token",
              t.tokenAddress,
              err
            );
          }
        }

        // Default to USDT
        const usdt = tokenList.find(
          (t) => t.ticker.toLowerCase() === "usdt"
        );
        if (usdt) setSelectedToken(usdt.tokenAddress);
      } catch (err) {
        console.error("Failed to fetch tokens", err);
      }
    };
    fetchTokens();
  }, [provider]);

  const decimal = selectedToken ? tokenDecimals[selectedToken] ?? 18 : 18;
  const selectedTicker = selectedToken ? tickerMap[selectedToken] ?? "" : "";
  const amountWei = amount && selectedToken ? parseUnits(amount, decimal) : 0n;

  // Estimate CFX output
  useEffect(() => {
    if (!provider || !selectedToken || !amountWei) return;
    const fetchEstimate = async () => {
      try {
        const contract = new ethers.Contract(
          GAS_TOP_UP_ADDRESS,
          GAS_TOP_UP_ABI,
          provider
        );
        const res = await contract.estimateCfxOut(selectedToken, amountWei);
        setEstimatedCfx(formatUnits(res[2], 18));
        setEstimateError(null);
      } catch (err: any) {
        console.error("Estimate failed:", err);
        setEstimateError(err?.reason || err?.message || "Estimate error");
        setEstimatedCfx("");
      }
    };
    fetchEstimate();
  }, [provider, selectedToken, amountWei]);

  // Fetch Pyth fee
  useEffect(() => {
    if (!provider || !selectedToken) return;
    const fetchFee = async () => {
      try {
        const contract = new ethers.Contract(
          GAS_TOP_UP_ADDRESS,
          GAS_TOP_UP_ABI,
          provider
        );
        const tokenFeedId = await contract.tokenFeedIds(selectedToken);
        const cfxUsdFeedId = await contract.cfxUsdFeedId();
        if (tokenFeedId === "0x" || cfxUsdFeedId === "0x") {
          throw new Error("Invalid feed IDs");
        }

        const updateData = await fetchPythUpdateData(
          [tokenFeedId, cfxUsdFeedId],
          provider
        );

        const pythContract = new ethers.Contract(
          PYTH_ADDRESS,
          PYTH_ABI,
          provider
        );
        const fee: bigint = await pythContract.getUpdateFee(updateData);
        setPythFee(fee);
      } catch (err) {
        console.error("Failed to fetch Pyth fee", err);
        setPythFee(0n);
      }
    };
    fetchFee();
  }, [provider, selectedToken]);

  // MetaSwap via relayer
  const handleMetaSwap = async () => {
    if (!provider || !connectedAddress || !selectedToken || !amount) return;
    try {
      setLoading(true);
      const signer = await provider.getSigner();

      if (!ethers.isAddress(connectedAddress)) {
        throw new Error("Invalid connected address (ENS not supported)");
      }
      if (!ethers.isAddress(selectedToken)) {
        throw new Error("Invalid token address (ENS not supported)");
      }

      const contract = new ethers.Contract(
        GAS_TOP_UP_ADDRESS,
        GAS_TOP_UP_ABI,
        provider
      );
      const tokenFeedId = await contract.tokenFeedIds(selectedToken);
      const cfxUsdFeedId = await contract.cfxUsdFeedId();
      if (tokenFeedId === "0x" || cfxUsdFeedId === "0x") {
        throw new Error("Invalid feed IDs");
      }

      // Normalize updateData
      const updateDataRaw = await fetchPythUpdateData(
        [tokenFeedId, cfxUsdFeedId],
        provider
      );
      const updateData: string[] = Array.isArray(updateDataRaw)
        ? updateDataRaw.map((u) => (u.startsWith("0x") ? u : "0x" + u))
        : [];

      // Nonce from relayer
      const nonceResponse = await fetch(
        `http://localhost:3000/getNonce?user=${connectedAddress}`
      );
      const nonceJson = await nonceResponse.json();
      if (!nonceJson.success) {
        throw new Error(`Failed to fetch nonce: ${nonceJson.error}`);
      }
      const currentNonce = nonceJson.nonce ?? "0";
      setNonce(currentNonce);

      const deadline = Math.floor(Date.now() / 1000) + 3600;

      // Typed data
      const domain = {
        name: "GasStation",
        version: "1",
        chainId: 1030,
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
        nonce: currentNonce,
        deadline,
      };

      const signature = await signer.signTypedData(domain, types, value);

      const response = await fetch("http://localhost:3000/metaSwap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: connectedAddress,
          tokenAddress: selectedToken,
          amount: amountWei.toString(),
          nonce: currentNonce,
          deadline,
          signature,
          updateData,
          maxAge,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`MetaSwap complete: txHash ${result.txHash}`);
      } else {
        alert(`MetaSwap failed: ${result.error}`);
        console.error("Relayer error:", result.error);
      }
    } catch (err) {
      console.error("MetaSwap failed:", err);
      alert(
        `MetaSwap failed: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center px-4">
      <div className="w-full max-w-2xl bg-white p-6 border mt-4 rounded-2xl shadow-md space-y-6">
        <h2 className="text-2xl font-bold text-center">
          Gas Top Up (MetaSwap)
        </h2>
        <p className="text-center">
          Connected: <b>{connectedAddress ?? "Not connected"}</b>
        </p>

        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Select Token</h3>
          <select
            className="border px-3 py-2 rounded w-full mb-3"
            value={selectedToken ?? ""}
            onChange={(e) => setSelectedToken(e.target.value || null)}
          >
            <option value="">-- Select --</option>
            {tokens.map((t) => (
              <option key={t.tokenAddress} value={t.tokenAddress}>
                {t.ticker}
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Amount to Swap</h3>
          <input
            type="number"
            placeholder={`Amount of ${selectedTicker}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border px-3 py-2 rounded w-full mb-3"
          />
          {estimatedCfx && (
            <p className="text-gray-700 mb-2">
              Estimated CFX: <b>{estimatedCfx}</b>
            </p>
          )}
          {estimateError && (
            <p className="text-red-500 mb-2">{estimateError}</p>
          )}

          <button
            onClick={handleMetaSwap}
            disabled={!amount || !selectedToken || !!estimateError || loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading
              ? "Processing..."
              : `Swap ${amount} ${selectedTicker} via MetaSwap`}
          </button>

          {pythFee > 0n && (
            <p className="text-sm text-gray-600 mt-2">
              Pyth update fee: {formatUnits(pythFee, 18)} CFX
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
