// React component for pools display
// Based on REFACTORING_PLAN.md

import React from "react";
import { useChainBrawlerContext } from "../providers/ChainBrawlerProvider";

export function PoolsDisplay() {
  const { pools, menu, actions, isLoading, error } = useChainBrawlerContext();

  if (!menu?.canViewPools) {
    return null;
  }

  return (
    <div className="pools-display">
      <div className="pools-header">
        <h3>Treasury Pools</h3>
        <button onClick={() => actions.loadPools()} disabled={isLoading} className="refresh-button">
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {pools && (
        <div className="pools-content">
          <div className="pool-item">
            <h4>Prize Pool</h4>
            <p className="pool-amount">{pools.prizePool.formatted}</p>
            <p className="pool-percentage">{pools.prizePool.percentage.toFixed(2)}%</p>
            <p className="pool-description">{pools.prizePool.description}</p>
          </div>

          <div className="pool-item">
            <h4>Equipment Pool</h4>
            <p className="pool-amount">{pools.equipmentPool.formatted}</p>
            <p className="pool-percentage">{pools.equipmentPool.percentage.toFixed(2)}%</p>
            <p className="pool-description">{pools.equipmentPool.description}</p>
          </div>

          <div className="pool-item">
            <h4>Gas Refund Pool</h4>
            <p className="pool-amount">{pools.gasRefundPool.formatted}</p>
            <p className="pool-percentage">{pools.gasRefundPool.percentage.toFixed(2)}%</p>
            <p className="pool-description">{pools.gasRefundPool.description}</p>
          </div>

          <div className="pool-item">
            <h4>Developer Pool</h4>
            <p className="pool-amount">{pools.developerPool.formatted}</p>
            <p className="pool-percentage">{pools.developerPool.percentage.toFixed(2)}%</p>
            <p className="pool-description">{pools.developerPool.description}</p>
          </div>

          <div className="pool-item">
            <h4>Next Epoch Pool</h4>
            <p className="pool-amount">{pools.nextEpochPool.formatted}</p>
            <p className="pool-percentage">{pools.nextEpochPool.percentage.toFixed(2)}%</p>
            <p className="pool-description">{pools.nextEpochPool.description}</p>
          </div>

          <div className="pool-item">
            <h4>Emergency Pool</h4>
            <p className="pool-amount">{pools.emergencyPool.formatted}</p>
            <p className="pool-percentage">{pools.emergencyPool.percentage.toFixed(2)}%</p>
            <p className="pool-description">{pools.emergencyPool.description}</p>
          </div>

          <div className="pools-summary">
            <h4>Total Value</h4>
            <p className="total-amount">{pools.totalValue.toString()} CFX</p>
            <p className="last-updated">
              Last updated: {new Date(pools.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
