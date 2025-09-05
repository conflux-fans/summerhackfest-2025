import { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { parseEther } from 'viem'
import { GAS_TOP_UP_ADDRESS, GAS_TOP_UP_ABI } from '../../config/contracts'

export function DepositWithdraw() {
  const { address: connectedAddress } = useAccount()

  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const {
    writeContract: writeDeposit,
    isPending: isDepositPending,
    error: depositError,
  } = useWriteContract()

  const {
    writeContract: writeWithdraw,
    isPending: isWithdrawPending,
    error: withdrawError,
  } = useWriteContract()

  const handleDeposit = () => {
    if (!depositAmount) return
    const valueWei = parseEther(depositAmount) // send as msg.value
    writeDeposit({
      address: GAS_TOP_UP_ADDRESS,
      abi: GAS_TOP_UP_ABI,
      functionName: 'depositCfx', // ✅ new contract function
      args: [],
      value: valueWei,
    })
  }

  const handleWithdraw = () => {
    if (!withdrawAmount) return
    const amountWei = parseEther(withdrawAmount)
    writeWithdraw({
      address: GAS_TOP_UP_ADDRESS,
      abi: GAS_TOP_UP_ABI,
      functionName: 'withdrawCfx',
      args: [amountWei],
    })
  }

  return (
    <div className="p-6 border rounded-xl space-y-6">
      <h2 className="text-2xl font-bold">Deposit & Withdraw CFX</h2>

      <p>
        Connected: <b>{connectedAddress ?? 'Not connected'}</b>
      </p>

      {/* Deposit Section */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Deposit CFX</h3>
        <input
          type="number"
          step="0.000000000000000001"
          placeholder="Amount in CFX (e.g. 1.2)"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          className="border px-3 py-2 rounded w-full mb-3"
        />
        <button
          disabled={isDepositPending}
          onClick={handleDeposit}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {isDepositPending
            ? 'Depositing...'
            : `Deposit ${depositAmount || ''} CFX`}
        </button>
        {depositError && (
          <p className="text-red-500 mt-2">
            Error: {String(depositError?.message)}
          </p>
        )}
      </div>

      {/* Withdraw Section */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Withdraw CFX</h3>
        <input
          type="number"
          step="0.000000000000000001"
          placeholder="Amount in CFX (e.g. 0.5)"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          className="border px-3 py-2 rounded w-full mb-3"
        />
        <button
          disabled={isWithdrawPending}
          onClick={handleWithdraw}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          {isWithdrawPending
            ? 'Withdrawing...'
            : `Withdraw ${withdrawAmount || ''} CFX`}
        </button>
        {withdrawError && (
          <p className="text-red-500 mt-2">
            Error: {String(withdrawError?.message)}
          </p>
        )}
      </div>
    </div>
  )
}
