import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { GAS_TOP_UP_ADDRESS, GAS_TOP_UP_ABI } from "../../config/contracts";

const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
];

export function GasTopUp() {
  const { address: connectedAddress } = useAccount();

  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [tokenDecimals, setTokenDecimals] = useState<Record<string, number>>({});
  const [tickerMap, setTickerMap] = useState<Record<string, string>>({});

  // fetch supported tokens
  const { data: tokens, refetch: refetchTokens } = useReadContract({
    address: GAS_TOP_UP_ADDRESS,
    abi: GAS_TOP_UP_ABI,
    functionName: "getSupportedTokens",
  });

  // fetch decimals for each token
  const { data: decimalsData } = useReadContracts({
    contracts: (tokens as any[] ?? []).map((t) => ({
      address: t.tokenAddress,
      abi: ERC20_ABI,
      functionName: "decimals",
    })),
    query: { enabled: !!tokens && (tokens as any[]).length > 0 },
  });

  // build maps for decimals and ticker symbols
  useEffect(() => {
    if (tokens && decimalsData) {
      const dMap: Record<string, number> = {};
      const tMap: Record<string, string> = {};
      (tokens as any[]).forEach((t, i) => {
        dMap[t.tokenAddress] = Number(decimalsData[i]?.result) || 18;
        tMap[t.tokenAddress] = t.ticker;
      });
      setTokenDecimals(dMap);
      setTickerMap(tMap);
      console.log("Supported tokens:", tokens);
      console.log("Decimals map:", dMap);
      console.log("Ticker map:", tMap);
    }
  }, [tokens, decimalsData]);

  const decimal = selectedToken ? tokenDecimals[selectedToken] ?? 18 : 18;
  const selectedTicker = selectedToken ? tickerMap[selectedToken] ?? "" : "";
  const amountWei = amount && selectedToken ? parseUnits(amount, decimal) : 0n;

  // fetch estimated CFX output
  const { data: estimate, refetch: refetchEstimate, error: estimateError } =
    useReadContract({
      address: GAS_TOP_UP_ADDRESS,
      abi: GAS_TOP_UP_ABI,
      functionName: "estimateCfxOut",
      args:
        selectedToken && amountWei > 0n
          ? [selectedToken, amountWei]
          : undefined,
      query: { enabled: !!selectedToken && amountWei > 0n, cacheTime: 0 },
    });

  const estimatedCfx = estimate?.[0] ? formatUnits(estimate[0] as bigint, 18) : "";
  const tokenPublishTime = estimate?.[1] ? Number(estimate[1] as bigint) : 0;
  const cfxPublishTime = estimate?.[2] ? Number(estimate[2] as bigint) : 0;

  const now = Math.floor(Date.now() / 1000);
  const tokenAgeMin =
    tokenPublishTime > 0 ? Math.floor((now - tokenPublishTime) / 60) : null;
  const cfxAgeMin =
    cfxPublishTime > 0 ? Math.floor((now - cfxPublishTime) / 60) : null;

  // log estimate whenever it changes
  useEffect(() => {
    console.log("Estimate updated:", {
      selectedToken,
      amount,
      amountWei: amountWei.toString(),
      estimatedCfx,
      tokenPublishTime,
      cfxPublishTime,
      tokenAgeMin,
      cfxAgeMin,
      estimateError,
    });
  }, [
    selectedToken,
    amount,
    amountWei,
    estimatedCfx,
    tokenPublishTime,
    cfxPublishTime,
    tokenAgeMin,
    cfxAgeMin,
    estimateError,
  ]);

  // force refetch estimate when input changes
  useEffect(() => {
    if (!!selectedToken && amountWei > 0n) {
      refetchEstimate?.();
    }
  }, [selectedToken, amount, decimal]);

  // contract write
  const { writeContract, isPending, error: swapError } = useWriteContract();

  const handleSwap = () => {
    if (!amount || !selectedToken) return;

    const amountWeiLocal = parseUnits(amount, decimal);
    console.log("Swapping:", { selectedToken, amount, amountWeiLocal: amountWeiLocal.toString() });

    writeContract({
      address: GAS_TOP_UP_ADDRESS,
      abi: GAS_TOP_UP_ABI,
      functionName: "swapToCfx",
      args: [selectedToken, amountWeiLocal, [], 60],
      value: 0n, // fee for Pyth updates
    });
  };

  useEffect(() => {
    refetchTokens?.();
  }, [connectedAddress]);

  return (
    <div className="flex justify-center items-center px-4">
      <div className="w-full max-w-2xl bg-white p-6 border mt-4 rounded-2xl shadow-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Gas Top Up</h2>

        <p className="text-center">
          Connected: <b>{connectedAddress ?? "Not connected"}</b>
        </p>

        {/* Token selection */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Select Token</h3>
          {tokens && (tokens as any[]).length > 0 ? (
            <select
              className="border px-3 py-2 rounded w-full mb-3"
              value={selectedToken ?? ""}
              onChange={(e) => setSelectedToken(e.target.value)}
            >
              <option value="">-- Select --</option>
              {(tokens as any[]).map((t, i) => (
                <option key={i} value={t.tokenAddress}>
                  {t.ticker} ({t.tokenAddress})
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-500">No tokens supported yet.</p>
          )}
        </div>

        {/* Amount input + estimated CFX */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Swap to CFX</h3>
          <input
            type="number"
            step="0.000000000000000001"
            placeholder={`Amount of ${selectedTicker}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border px-3 py-2 rounded w-full mb-3"
          />
          {estimatedCfx && (
            <p className="text-gray-700 mb-3">
              Estimated CFX: <b>{estimatedCfx}</b>
              {tokenAgeMin !== null && cfxAgeMin !== null && (
                <>
                  {" "}
                  (based on {selectedTicker} price {tokenAgeMin} min ago, CFX price {cfxAgeMin} min ago)
                </>
              )}
            </p>
          )}
          <button
            disabled={isPending || !amount || !selectedToken}
            onClick={handleSwap}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {isPending
              ? "Swapping..."
              : `Swap ${amount || ""} ${selectedTicker} to CFX`}
          </button>
          {swapError && (
            <p className="text-red-500 mt-2">
              Error: {String(swapError?.message)}
            </p>
          )}
          {estimateError && (
            <p className="text-red-500 mt-2">
              Estimate error: {String(estimateError?.message)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
