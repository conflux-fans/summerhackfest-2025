import { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { GAS_TOP_UP_ADDRESS, GAS_TOP_UP_ABI } from '../../config/contracts'

export function AddToken() {
  const { address: connectedAddress } = useAccount()
  const [tokenAddress, setTokenAddress] = useState('')
  const [ticker, setTicker] = useState('')
  const [feedId, setFeedId] = useState('')

  const { writeContract, isPending, error } = useWriteContract()

  const handleAddToken = () => {
    if (!tokenAddress || !ticker || !feedId) return
    writeContract({
      address: GAS_TOP_UP_ADDRESS,
      abi: GAS_TOP_UP_ABI,
      functionName: 'addToken',
      args: [tokenAddress, ticker, feedId],
    })
  }

  return (
    <div className="p-4 border rounded-lg mt-4">
      <h3 className="text-xl font-semibold mb-3">Add Token (Owner Only)</h3>

      <p className="mb-2">
        Connected: <b>{connectedAddress ?? 'Not connected'}</b>
      </p>

      <input
        type="text"
        placeholder="Token Address (0x...)"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
        className="border px-3 py-2 rounded w-full mb-3"
      />

      <input
        type="text"
        placeholder="Ticker (e.g. USDT)"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        className="border px-3 py-2 rounded w-full mb-3"
      />

      <input
        type="text"
        placeholder="Feed ID (bytes32 hex)"
        value={feedId}
        onChange={(e) => setFeedId(e.target.value)}
        className="border px-3 py-2 rounded w-full mb-3"
      />

      <button
        disabled={isPending}
        onClick={handleAddToken}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {isPending ? 'Adding...' : 'Add Token'}
      </button>

      {error && <p className="text-red-500 mt-2">Error: {String(error?.message)}</p>}
    </div>
  )
}
