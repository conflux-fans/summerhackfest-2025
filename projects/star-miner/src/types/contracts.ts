export interface ContractAddresses {
  starMinerCredits: string;
  gameStateManager: string;
  p2eRewards: string;
  upgradeNFTs: string;
}

export interface StarMinerCreditsContract {
  purchaseCredits(): Promise<any>;
  claimRewards(): Promise<any>;
  getClaimableRewards(user: string): Promise<bigint>;
  balanceOf(user: string): Promise<bigint>;
  stardustBalance(user: string): Promise<bigint>;
  burnCredits(user: string, amount: bigint): Promise<any>;
}

export interface GameStateManagerContract {
  registerPlayer(): Promise<any>;
  saveGameState(stardust: bigint, totalClicks: number): Promise<any>;
  purchaseUpgrade(upgradeId: string): Promise<any>;
  getPlayerState(player: string): Promise<{
    stardust: bigint;
    stardustPerSecond: bigint;
    totalClicks: number;
    lastUpdateTime: number;
    prestigeLevel: number;
    isActive: boolean;
  }>;
  getUpgradeCost(upgradeId: string, player: string): Promise<bigint>;
  activatePrestige(): Promise<any>;
}

export interface P2ERewardsContract {
  exchangeStardustForCFX(stardustAmount: bigint): Promise<any>;
  getExchangeInfo(player: string): Promise<{
    rate: bigint;
    dailyLimit: bigint;
    remainingDaily: bigint;
    poolBalance: bigint;
    playerStardust: bigint;
  }>;
  getMaxClaimable(player: string): Promise<bigint>;
}

export interface UpgradeNFTsContract {
  mintNFTUpgrade(upgradeType: number): Promise<any>;
  getPlayerMultipliers(player: string): Promise<{
    stardustMultiplier: bigint;
    clickMultiplier: bigint;
  }>;
  tokenURI(tokenId: number): Promise<string>;
}

export interface ContractEvent {
  event: string;
  args: any[];
  transactionHash: string;
  blockNumber: number;
}

export interface ContractError {
  code: number;
  message: string;
  data?: any;
}