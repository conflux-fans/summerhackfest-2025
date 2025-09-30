const { ethers } = require('hardhat');

async function main() {
  console.log('Checking contract functions...');

  const contractAddress = '0x8261f12ccCe483AD7bE9108fF2FF40D8bc4cA50b';
  console.log('Contract address:', contractAddress);

  // Get provider
  const provider = new ethers.JsonRpcProvider('https://evmtestnet.confluxrpc.com');

  // Check contract balance
  const balance = await provider.getBalance(contractAddress);
  console.log('Contract balance:', ethers.formatEther(balance), 'CFX');

  // Try to get contract code
  const code = await provider.getCode(contractAddress);
  console.log('Contract code length:', code.length);
  console.log('Is contract:', code !== '0x');

  if (code === '0x') {
    console.log('❌ No contract code at this address');
    return;
  }

  // Try some common function signatures
  const commonFunctions = [
    '0x70a08231', // balanceOf(address)
    '0x18160ddd', // totalSupply()
    '0x8da5cb5b', // owner()
    '0x4e71d92d', // rewardPool() - our function
  ];

  for (const sig of commonFunctions) {
    try {
      const result = await provider.call({
        to: contractAddress,
        data: sig
      });
      console.log(`Function ${sig}: ${result}`);
    } catch (error) {
      console.log(`Function ${sig}: Error - ${error.message}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });