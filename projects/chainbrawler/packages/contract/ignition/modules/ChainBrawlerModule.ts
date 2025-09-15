// Hardhat Ignition module to deploy the complete ChainBrawler system
// Includes the main game contract and leaderboard infrastructure
// Follow the project's existing ignition module style.

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ChainBrawlerModule = buildModule("ChainBrawlerModule", (m) => {
  // Deploy the CombatEngineLib library first
  // This library contains the extracted combat processing logic
  const combatEngineLib = m.library("CombatEngineLib");

  // Deploy the main ChainBrawler contract with library linking
  // The deployer will be the owner with admin privileges
  const chainBrawler = m.contract("ChainBrawlerClean", [], {
    libraries: {
      CombatEngineLib: combatEngineLib,
    },
  });

  // Deploy the LeaderboardTreasury contract
  // This handles prize distributions and merkle-based claims
  const leaderboardTreasury = m.contract("LeaderboardTreasury", []);

  // Deploy the LeaderboardManager contract
  // This coordinates leaderboard publishing and prize distribution
  // Requires the treasury address as constructor parameter
  const leaderboardManager = m.contract("LeaderboardManager", [leaderboardTreasury]);

  // Configure the ChainBrawler contract with leaderboard components
  // Set the leaderboard treasury address so the main contract can send prizes
  m.call(chainBrawler, "setLeaderboardTreasury", [leaderboardTreasury]);

  // Set the leaderboard manager address for coordination
  m.call(chainBrawler, "setLeaderboardManager", [leaderboardManager]);

  // Grant the manager contract the MANAGER_ROLE on the treasury
  // This allows the manager to publish epoch roots and coordinate distributions
  const MANAGER_ROLE = "0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08"; // keccak256("MANAGER_ROLE")
  m.call(leaderboardTreasury, "grantRole", [MANAGER_ROLE, leaderboardManager]);

  // Grant the deployer the PUBLISHER_ROLE on the manager
  // This allows the deployer to publish leaderboard results and distribute prizes
  // In production, this role should be granted to a dedicated leaderboard service
  const PUBLISHER_ROLE = "0xf0887ba65ee2024ea881d91b74c2450ef19e1557f03bed3ea9f16b037cbe2dc9"; // keccak256("PUBLISHER_ROLE")
  const deployer = m.getAccount(0); // Get the deployer account
  m.call(leaderboardManager, "grantRole", [PUBLISHER_ROLE, deployer]);

  return {
    combatEngineLib,
    chainBrawler,
    leaderboardTreasury,
    leaderboardManager,
  };
});

export default ChainBrawlerModule;
