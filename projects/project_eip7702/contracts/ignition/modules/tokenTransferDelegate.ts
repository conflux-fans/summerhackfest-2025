import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TokenTransferDelegateModule", (m) => {
  // Deploy the TokenTransferDelegate contract
  const tokenTransferDelegate = m.contract("TokenTransferDelegate");

  // Return the deployed contract for reference
  return { tokenTransferDelegate };
});
