// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/gasRouter.sol";

contract DeployGasTopUp is Script {
    function run() external {
        // Load deployer private key from env
        uint256 deployerKey = vm.envUint("DEPLOYER_KEY");

        // Start broadcasting
        vm.startBroadcast(deployerKey);

        // Load Pyth address and CFX/USD feed ID from env
        address pythAddr = vm.envAddress("PYTH_ADDRESS");
        bytes32 cfxUsdFeedId = bytes32(vm.envUint("CFX_USD_FEED_ID"));

        // Deploy contract
        GasTopUp gasTopUp = new GasTopUp(pythAddr, cfxUsdFeedId);

        // Log deployed address
        console.log("GasTopUp deployed at:", address(gasTopUp));

        vm.stopBroadcast();
    }
}
