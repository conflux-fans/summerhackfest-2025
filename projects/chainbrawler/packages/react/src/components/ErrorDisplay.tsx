// React component for error display
// Based on REFACTORING_PLAN.md

import React from "react";
import { useChainBrawlerContext } from "../providers/ChainBrawlerProvider";

export function ErrorDisplay() {
  const { error, actions } = useChainBrawlerContext();

  if (!error) return null;

  return (
    <div className="error-display">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <div className="error-message">
          <h4>Error</h4>
          <p>{error}</p>
        </div>
        <button onClick={actions.clearError} className="clear-error-button">
          Clear
        </button>
      </div>
    </div>
  );
}
