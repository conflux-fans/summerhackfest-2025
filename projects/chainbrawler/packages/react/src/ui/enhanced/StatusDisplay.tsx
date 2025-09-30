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

import type { CharacterData, OperationState } from "@chainbrawler/core";
import React from "react";

interface StatusDisplayProps {
  statusMessage: string;
  isLoading: boolean;
  operation: OperationState | null;
  character: CharacterData | null;
}

export function StatusDisplay({
  statusMessage,
  isLoading,
  operation,
  character,
}: StatusDisplayProps) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "1rem",
        borderRadius: "8px",
        marginBottom: "1rem",
      }}
    >
      <h3>Status</h3>

      {isLoading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem",
            backgroundColor: "#f0f8ff",
            border: "1px solid #2196F3",
            borderRadius: "4px",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid #2196F3",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span style={{ color: "#2196F3", fontWeight: "bold" }}>Loading...</span>
        </div>
      )}

      {operation?.isActive && (
        <div
          style={{
            padding: "0.5rem",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "4px",
            marginBottom: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#ffc107",
                borderRadius: "50%",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <span style={{ fontWeight: "bold" }}>{operation.operationType} in progress...</span>
          </div>
          {operation.progress && (
            <div style={{ marginTop: "0.25rem", fontSize: "0.9rem", color: "#666" }}>
              {operation.progress}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          padding: "0.5rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
          fontSize: "0.9rem",
        }}
      >
        {statusMessage || "Ready"}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}
