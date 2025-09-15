// Example React app using ChainBrawler
// Based on REFACTORING_PLAN.md

import type { ChainBrawlerConfig } from "@chainbrawler/core";
import React from "react";
import { useChainBrawler, useClaims, useLeaderboard, usePools } from "../index";
import { ChainBrawlerProvider } from "../providers/ChainBrawlerProvider";

// Example configuration
const config: ChainBrawlerConfig = {
  address: "0x...", // User's wallet address
  chain: {
    id: 2030,
    name: "ChainBrawler",
  },
  publicClient: null, // Will be provided by the app
  walletClient: null, // Will be provided by the app
};

function MyComponent() {
  const { character, menu, operation, actions } = useChainBrawler({
    address: "0x...",
    chain: config.chain,
    publicClient: config.publicClient,
    walletClient: config.walletClient,
  });

  const pools = usePools();
  const leaderboard = useLeaderboard();
  const claims = useClaims();

  const handleCreateCharacter = () => {
    actions?.createCharacter(0);
  };

  const handleLoadPools = () => {
    actions?.loadPools();
  };

  const handleLoadLeaderboard = () => {
    actions?.loadLeaderboard("0x...");
  };

  const handleClaimPrize = (reward: any) => {
    actions?.claimPrize(reward.epoch, reward.index, reward.amount, reward.proof);
  };

  return (
    <div>
      {character?.exists ? (
        <div>
          <div>Character: {character.className}</div>
          <button onClick={handleLoadPools}>View Pools</button>
          <button onClick={handleLoadLeaderboard}>View Leaderboard</button>
          <button onClick={() => actions?.loadClaims("0x...")}>View Claims</button>
        </div>
      ) : (
        <button onClick={handleCreateCharacter}>Create Character</button>
      )}

      {pools.pools && (
        <div>
          <h3>Pools</h3>
          <div>Prize Pool: {pools.pools.prizePool?.formatted} CFX</div>
          <div>Equipment Pool: {pools.pools.equipmentPool?.formatted} CFX</div>
        </div>
      )}

      {leaderboard.leaderboard && (
        <div>
          <h3>Leaderboard</h3>
          <div>Your Rank: #{leaderboard.leaderboard.playerRank.toString()}</div>
          <div>Your Score: {leaderboard.leaderboard.playerScore.toString()}</div>
        </div>
      )}

      {claims.claims && claims.claims.available.length > 0 && (
        <div>
          <h3>Available Claims</h3>
          {claims.claims.available.map((reward: any, index: number) => (
            <div key={index}>
              <div>
                {reward.description}: {reward.amount} CFX
              </div>
              <button onClick={() => handleClaimPrize(reward)} disabled={!reward.canClaim}>
                Claim
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <ChainBrawlerProvider config={config}>
      <div className="chainbrawler-app">
        <header>
          <h1>ChainBrawler</h1>
        </header>

        <main>
          <MyComponent />
        </main>
      </div>
    </ChainBrawlerProvider>
  );
}
