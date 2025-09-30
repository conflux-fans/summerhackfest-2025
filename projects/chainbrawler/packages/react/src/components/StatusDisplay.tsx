// React component for status display
// Based on REFACTORING_PLAN.md

import React from "react";
import { useChainBrawlerContext } from "../providers/ChainBrawlerProvider";

export function StatusDisplay() {
  const { statusMessage, isLoading, operation } = useChainBrawlerContext();

  return (
    <div className="status-display">
      <div className="status-content">
        {isLoading && (
          <div className="loading-indicator" data-testid="loading-indicator">
            <div className="spinner"></div>
            <span>Loading...</span>
          </div>
        )}

        {operation?.isActive && (
          <div className="operation-status">
            <div className="operation-indicator">
              <div className="pulse"></div>
              <span>{operation.operationType} in progress...</span>
            </div>
            {operation.progress && <div className="operation-progress">{operation.progress}</div>}
          </div>
        )}

        <div className="status-message">{statusMessage}</div>
      </div>
    </div>
  );
}
