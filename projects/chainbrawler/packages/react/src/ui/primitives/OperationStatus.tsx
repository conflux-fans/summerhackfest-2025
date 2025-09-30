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

interface OperationStatusProps {
  operation: any;
  isVisible: boolean;
  onDismiss: () => void;
}

export function OperationStatus({ operation, isVisible, onDismiss }: OperationStatusProps) {
  if (!isVisible || !operation) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FF9800"; // Orange
      case "processing":
        return "#2196F3"; // Blue
      case "completed":
        return "#4CAF50"; // Green
      case "error":
      case "failed":
        return "#F44336"; // Red
      default:
        return "#666"; // Gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "processing":
        return "⚙️";
      case "completed":
        return "✅";
      case "error":
      case "failed":
        return "❌";
      default:
        return "❓";
    }
  };

  const canDismiss =
    operation.status === "completed" ||
    operation.status === "error" ||
    operation.status === "failed";

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "white",
        border: `2px solid ${getStatusColor(operation.status)}`,
        borderRadius: "8px",
        padding: "1rem",
        minWidth: "300px",
        maxWidth: "400px",
        zIndex: 1001,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>{getStatusIcon(operation.status)}</span>
          <strong style={{ color: getStatusColor(operation.status) }}>
            {operation.type || "Operation"}
          </strong>
        </div>
        {canDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ×
          </button>
        )}
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <div
          style={{
            fontSize: "0.9rem",
            color: "#666",
            textTransform: "capitalize",
          }}
        >
          Status: {operation.status}
        </div>
      </div>

      {operation.message && (
        <div
          style={{
            fontSize: "0.9rem",
            color: "#333",
            marginBottom: "0.5rem",
          }}
        >
          {operation.message}
        </div>
      )}

      {operation.hash && (
        <div
          style={{
            fontSize: "0.8rem",
            color: "#666",
            fontFamily: "monospace",
            wordBreak: "break-all",
          }}
        >
          Transaction: {operation.hash.slice(0, 10)}...{operation.hash.slice(-8)}
        </div>
      )}

      {operation.status === "processing" && (
        <div
          style={{
            marginTop: "0.5rem",
            height: "4px",
            backgroundColor: "#e0e0e0",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              backgroundColor: getStatusColor(operation.status),
              animation: "loading 2s ease-in-out infinite",
              width: "30%",
            }}
          />
        </div>
      )}

      <style>
        {`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(300%); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
    </div>
  );
}
