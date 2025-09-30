const { ethers, upgrades } = require("hardhat");

async function main() {
    // 替换为你的代理合约地址
    const proxyAddress = "0x9883DBA6dE6f817a3DFcA4C1E1BBCB9377A06Ef2"; // 例如 Exchange 合约的地址
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("Implementation Address:", implementationAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });