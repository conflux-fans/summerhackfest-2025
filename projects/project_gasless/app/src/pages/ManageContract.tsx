import { DepositWithdraw } from '../components/Interactions/DepositWithdraw'
import { AddToken } from '../components/Interactions/AddToken'
export function ManageContract() {
  return (
    <div className="text-center">


      {/* Deposit & Withdraw interaction */}
      <DepositWithdraw />

      {/* Owner: Add Token */}
      <div className="mt-8">
        <AddToken />
      </div>
    </div>
  )
}
