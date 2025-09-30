// React component for claims display
// Based on REFACTORING_PLAN.md

import React from "react";
import { useChainBrawlerContext } from "../providers/ChainBrawlerProvider";

export function ClaimsDisplay() {
  const { claims, menu, actions, isLoading, error, config } = useChainBrawlerContext();

  if (!menu?.canViewClaims) {
    return null;
  }

  const handleLoadClaims = () => {
    actions.loadClaims(config.address);
  };

  const handleClaimReward = async (reward: any) => {
    if (reward.canClaim && reward.proof) {
      await actions.claimPrize(reward.epoch, reward.index, reward.amount, reward.proof);
    }
  };

  return (
    <div className="claims-display">
      <div className="claims-header">
        <h3>Prize Claims</h3>
        <button onClick={handleLoadClaims} disabled={isLoading} className="refresh-button">
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {claims && (
        <div className="claims-content">
          <div className="claims-summary">
            <h4>Available Claims</h4>
            <p>
              <strong>Total Claimable:</strong> {claims.totalClaimable.toString()} CFX
            </p>
            <p>
              <strong>Available Rewards:</strong> {claims.available.length}
            </p>
          </div>

          {claims.available.length > 0 ? (
            <div className="claims-list">
              {claims.available.map((reward: any, index: number) => (
                <div key={index} className="claim-item">
                  <div className="claim-info">
                    <h5>{reward.description}</h5>
                    <p>
                      <strong>Amount:</strong> {reward.amount.toString()} CFX
                    </p>
                    <p>
                      <strong>Type:</strong> {reward.type}
                    </p>
                    {reward.epoch && (
                      <p>
                        <strong>Epoch:</strong> {reward.epoch}
                      </p>
                    )}
                  </div>

                  <div className="claim-actions">
                    <button
                      onClick={() => handleClaimReward(reward)}
                      disabled={!reward.canClaim || isLoading}
                      className={`claim-button ${reward.canClaim ? "claimable" : "disabled"}`}
                    >
                      {reward.canClaim ? "Claim" : "Cannot Claim"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-claims">
              <p>No claims available at this time.</p>
            </div>
          )}

          <div className="claims-footer">
            <p className="last-checked">
              Last checked: {new Date(claims.lastChecked).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
