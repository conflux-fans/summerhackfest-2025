/*
 * Copyright 2025 ChainBrawler Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";

interface ErrorDisplayProps {
  error: string | null;
  onClear: () => void;
}

export function ErrorDisplay({ error, onClear }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div
      style={{
        border: "1px solid #f44336",
        backgroundColor: "#ffebee",
        padding: "1rem",
        borderRadius: "8px",
        marginBottom: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ fontSize: "1.5rem" }}>⚠️</div>
          <div>
            <h4 style={{ margin: 0, color: "#d32f2f" }}>Error</h4>
            <p style={{ margin: "0.25rem 0 0 0", color: "#666" }}>{error}</p>
          </div>
        </div>
        <button
          onClick={onClear}
          style={{
            padding: "0.25rem 0.5rem",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
