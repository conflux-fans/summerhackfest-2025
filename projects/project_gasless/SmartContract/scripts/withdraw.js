const hre = require("hardhat")

async function main() {
  const [deployer] = await hre.ethers.getSigners()

  console.log("Using account:", deployer.address)

  const contractAddress = "0x1d2045f05C45bDAea22Aec1Fd9773fDA1BfffFdD"

  const abi = [
    {
      "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
      "name": "withdrawCfx",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]

  const contract = new hre.ethers.Contract(contractAddress, abi, deployer)

  // ✅ use ethers.utils.parseEther for v5
  const amount = hre.ethers.utils.parseEther("0.5") // 0.5 CFX

  console.log(`Withdrawing ${amount.toString()} wei...`)
  const tx = await contract.withdrawCfx(amount)
  await tx.wait()

  console.log("✅ Withdraw successful:", tx.hash)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
