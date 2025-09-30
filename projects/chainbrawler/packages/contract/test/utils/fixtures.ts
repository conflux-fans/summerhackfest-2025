import hre from "hardhat";
import { parseEther } from "viem";
import { getSigners, deployArtifact } from "./helpers";

/**
 * Shared test fixtures for ChainBrawler contract testing
 * Provides consistent deployment patterns and reduces code duplication
 */

export interface BaseFixture {
  owner: any;
  player1: any;
  player2: any;
  treasury: any;
  publicClient: any;
}

export interface ChainBrawlerFixture extends BaseFixture {
  chainBrawler: any;
  helper: any;
}

export interface CombatMathFixture extends BaseFixture {
  combatMathTest: any;
}

export interface LeaderboardFixture extends BaseFixture {
  chainBrawler: any;
  leaderboardManager: any;
  leaderboardTreasury: any;
  helper: any;
}

/**
 * Basic fixture with common signers and clients
 */
export async function createBaseFixture(): Promise<BaseFixture> {
  const signers = await getSigners();
  const publicClient = await hre.viem.getPublicClient();

  return {
    owner: signers[0],
    player1: signers[1],
    player2: signers[2],
    treasury: signers[3],
    publicClient,
  };
}

/**
 * Full ChainBrawler deployment with test helpers
 * Options allow customization for different test scenarios
 */
export async function createChainBrawlerFixture(
  options: {
    setupEnemies?: boolean;
    setupRoles?: boolean;
    createCharacterFee?: bigint;
    fightFee?: bigint;
  } = {}
): Promise<ChainBrawlerFixture> {
  const {
    setupEnemies = true,
    setupRoles = true,
    createCharacterFee = parseEther("0.01"),
    fightFee = parseEther("0.001"),
  } = options;

  const base = await createBaseFixture();
  const { owner, treasury } = base;

  // Deploy main ChainBrawler contract
  const chainBrawler = await deployArtifact(owner, "ChainBrawlerClean", []);

  // Deploy test helper contract
  const helper = await deployArtifact(owner, "ChainBrawlerTestHelpersForTests", []);

  // Setup default roles if requested
  if (setupRoles) {
    const defaultAdminRole = await (chainBrawler as any).read.DEFAULT_ADMIN_ROLE();
    await (chainBrawler as any).write.grantRole([defaultAdminRole, owner.address], {
      account: owner.account,
    });
  }

  // Setup default enemies if requested
  if (setupEnemies) {
    const enemySetupData = [
      [1n, 6n, 8n, 2n, 1n, 25n, 500n], // Basic enemy
      [2n, 8n, 10n, 3n, 1n, 35n, 400n], // Stronger enemy
      [3n, 12n, 12n, 4n, 1n, 45n, 300n], // Advanced enemy
    ];

    for (const enemyData of enemySetupData) {
      await (helper as any).write.setEnemyBase(enemyData, { account: owner.account });
    }
  }

  return {
    ...base,
    chainBrawler,
    helper,
  };
}

/**
 * Simple CombatMath test fixture for pure math testing
 */
export async function createCombatMathFixture(): Promise<CombatMathFixture> {
  const base = await createBaseFixture();

  const combatMathTest = await hre.viem.deployContract("CombatMathTest");

  return {
    ...base,
    combatMathTest,
  };
}

/**
 * Full leaderboard system fixture with treasury and manager
 */
export async function createLeaderboardFixture(
  options: { epochDuration?: bigint; treasuryFee?: number } = {}
): Promise<LeaderboardFixture> {
  const {
    epochDuration = 86400n, // 1 day
    treasuryFee = 2000, // 20%
  } = options;

  const chainBrawlerFixture = await createChainBrawlerFixture();
  const { owner, treasury } = chainBrawlerFixture;

  // Deploy LeaderboardTreasury
  const leaderboardTreasury = await deployArtifact(owner, "LeaderboardTreasury", [
    treasury.address, // treasury address
    treasuryFee, // treasury fee (20%)
  ]);

  // Deploy LeaderboardManager
  const leaderboardManager = await deployArtifact(owner, "LeaderboardManager", [
    chainBrawlerFixture.chainBrawler.address, // ChainBrawler contract
    leaderboardTreasury.address, // LeaderboardTreasury contract
    epochDuration, // epoch duration
  ]);

  // Connect the contracts
  await (chainBrawlerFixture.chainBrawler as any).write.setLeaderboardManager(
    [leaderboardManager.address],
    { account: owner.account }
  );
  await (chainBrawlerFixture.chainBrawler as any).write.setLeaderboardTreasury(
    [leaderboardTreasury.address],
    { account: owner.account }
  );

  return {
    ...chainBrawlerFixture,
    leaderboardManager,
    leaderboardTreasury,
  };
}
