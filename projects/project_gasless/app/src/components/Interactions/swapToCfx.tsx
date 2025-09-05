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
  const [amount, setAmount] = useState<string>("0.01");
  const [estimatedCfx, setEstimatedCfx] = useState<string>("");
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [pythFee, setPythFee] = useState<bigint>(0n);
  const [maxAge, setMaxAge] = useState<number>(3600);
  const [loading, setLoading] = useState(false);
  const [nonce, setNonce] = useState<string>("0");
  const [addressError, setAddressError] = useState<string | null>(null);

  // Helper to validate hex address
  function isHexAddress(addr: string | null | undefined): boolean {
    return typeof addr === "string" && ethers.isAddress(addr);
  }

  // Helper to ensure checksummed hex address
  function ensureHexAddress(address: string | null | undefined): string | null {
    if (!address) return null;
    if (!isHexAddress(address)) return null;
    try {
      return ethers.getAddress(address); // Returns checksummed address
    } catch {
      return null;
    }
  }

  // SOLUTION 1: Initialize provider with explicit network configuration
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      // Create custom network without ENS configuration
      const customNetwork = {
        chainId: 1030,
        name: "conflux-espace",
        // Don't include ensAddress to avoid ENS lookups
      };

      const customProvider = new ethers.BrowserProvider(window.ethereum, customNetwork);
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
          // SOLUTION 2: Ensure token addresses are properly formatted
          const normalizedAddress = ensureHexAddress(t.tokenAddress);
          if (normalizedAddress) {
            dMap[normalizedAddress] = 18;
            tMap[normalizedAddress] = t.ticker;
          }
        });
        setTokenDecimals(dMap);
        setTickerMap(tMap);

        // Fetch decimals dynamically for valid tokens only
        for (const t of validTokens) {
          const normalizedTokenAddress = t.tokenAddress; // Already validated above
          
          try {
            const tokenContract = new ethers.Contract(
              normalizedTokenAddress,
              ERC20_ABI,
              provider
            );
            const decimals = await tokenContract.decimals();
            setTokenDecimals((prev) => ({
              ...prev,
              [normalizedTokenAddress]: Number(decimals),
            }));
          } catch (err) {
            console.warn(
              "Failed to fetch decimals for token",
              normalizedTokenAddress,
              err
            );
          }
        }

        // Default to USDT from valid tokens
        const usdt = validTokens.find(
          (t) => t.ticker.toLowerCase() === "usdt"
        );
        if (usdt) {
          setSelectedToken(usdt.tokenAddress);
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

  // Estimate CFX output
  useEffect(() => {
    if (!provider || !selectedToken || !amountWei) return;
    const fetchEstimate = async () => {
      try {
        const normalizedTokenAddress = ensureHexAddress(selectedToken);
        if (!normalizedTokenAddress) {
          throw new Error("Invalid token address");
        }

        const contract = new ethers.Contract(
          GAS_TOP_UP_ADDRESS,
          GAS_TOP_UP_ABI,
          provider
        );
        const res = await contract.estimateCfxOut(normalizedTokenAddress, amountWei);
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
        const normalizedTokenAddress = ensureHexAddress(selectedToken);
        if (!normalizedTokenAddress) {
          throw new Error("Invalid token address");
        }

        const contract = new ethers.Contract(
          GAS_TOP_UP_ADDRESS,
          GAS_TOP_UP_ABI,
          provider
        );
        const tokenFeedId = await contract.tokenFeedIds(normalizedTokenAddress);
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
    setAddressError(null);

    // SOLUTION 3: Validate and normalize addresses before proceeding
    const normalizedConnectedAddress = ensureHexAddress(connectedAddress);
    const normalizedSelectedToken = ensureHexAddress(selectedToken);

    if (!normalizedConnectedAddress) {
      setAddressError("Connected address must be a valid hex address");
      return;
    }
    if (!normalizedSelectedToken) {
      setAddressError("Token address must be a valid hex address");
      return;
    }
    if (!provider || !amount) return;

    try {
      setLoading(true);
      
      // SOLUTION 4: Get signer with explicit address
      const signer = await provider.getSigner(normalizedConnectedAddress);

      // Prepare contract and updateData
      const contract = new ethers.Contract(
        GAS_TOP_UP_ADDRESS,
        GAS_TOP_UP_ABI,
        provider
      );
      const tokenFeedId = await contract.tokenFeedIds(normalizedSelectedToken);
      const cfxUsdFeedId = await contract.cfxUsdFeedId();
      if (tokenFeedId === "0x" || cfxUsdFeedId === "0x") {
        throw new Error("Invalid feed IDs");
      }

      const updateDataRaw = await fetchPythUpdateData(
        [tokenFeedId, cfxUsdFeedId],
        provider
      );
      const updateData: string[] = Array.isArray(updateDataRaw)
        ? updateDataRaw.map((u) => (u.startsWith("0x") ? u : "0x" + u))
        : [];

      // Nonce from relayer
      const nonceResponse = await fetch(
        `http://localhost:3000/getNonce?user=${normalizedConnectedAddress}`
      );
      const nonceJson = await nonceResponse.json();
      if (!nonceJson.success) {
        throw new Error(`Failed to fetch nonce: ${nonceJson.error}`);
      }
      const currentNonce = nonceJson.nonce ?? "0";
      setNonce(currentNonce);

      const deadline = Math.floor(Date.now() / 1000) + 3600;

      // SOLUTION 5: Use normalized addresses in typed data
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
        user: normalizedConnectedAddress,
        tokenAddress: normalizedSelectedToken,
        amount: amountWei.toString(),
        nonce: currentNonce,
        deadline,
      };

      const signature = await signer.signTypedData(domain, types, value);

      const response = await fetch("http://localhost:3000/metaSwap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: normalizedConnectedAddress,
          tokenAddress: normalizedSelectedToken,
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
        {addressError && (
          <p className="text-red-500 text-center">{addressError}</p>
        )}

        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Select Token</h3>
          <select
            className="border px-3 py-2 rounded w-full mb-3"
            value={selectedToken ?? ""}
            onChange={(e) => {
              const normalizedAddress = ensureHexAddress(e.target.value);
              setSelectedToken(normalizedAddress);
            }}
          >
            <option value="">-- Select --</option>
            {tokens.map((t) => {
              const normalizedAddress = ensureHexAddress(t.tokenAddress);
              return normalizedAddress ? (
                <option key={normalizedAddress} value={normalizedAddress}>
                  {t.ticker}
                </option>
              ) : null;
            })}
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
            disabled={
              !amount ||
              !selectedToken ||
              !!estimateError ||
              loading ||
              !ensureHexAddress(connectedAddress) ||
              !ensureHexAddress(selectedToken)
            }
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