
require ('@nomiclabs/hardhat-waffle');

task("accounts","Prints the list of the accounts",async (taskArgs , hre )=>{
  const accounts = await hre.ethers.getSigners();

  for(const account of accounts){
    console.log(account.address);
  }
})
module.exports = {
  solidity: "0.8.10",

  defaultNetwork: "eSpace",
  networks:{
    hardhat:{},
    eSpace: {
      url: "https://evmtestnet.confluxrpc.com	",
      gasPrice: 225000000000,
      chainId: 71,
      accounts: ['5753e65f56865a161fbf41932a0d855139a4ce9dc20d82fb655bff393fc41702'],
    },
  }
};