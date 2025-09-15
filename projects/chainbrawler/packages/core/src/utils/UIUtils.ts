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

// UI utilities for ChainBrawler

import type { FightSummaryData } from "../types";

export interface FightOutcome {
  color: string;
  text: string;
  icon: string;
}

export function getFightOutcome(fightSummary: FightSummaryData): FightOutcome {
  if (fightSummary.victory) {
    return {
      color: "#4CAF50", // Green
      text: "VICTORY!",
      icon: "🏆",
    };
  }

  if (fightSummary.playerDied) {
    return {
      color: "#F44336", // Red
      text: "DEFEAT",
      icon: "💀",
    };
  }

  if (fightSummary.unresolved) {
    return {
      color: "#FF9800", // Orange
      text: "UNRESOLVED",
      icon: "⏰",
    };
  }

  return {
    color: "#666", // Gray
    text: "FIGHT ENDED",
    icon: "⚔️",
  };
}

export function formatEthAmount(amount: bigint | number): string {
  const value = typeof amount === "bigint" ? Number(amount) : amount;
  return `${(value / 1e18).toFixed(4)} CFX`;
}

export function formatTimeRemaining(seconds: bigint): string {
  const hours = Number(seconds) / 3600;
  if (hours >= 24) {
    return `${(hours / 24).toFixed(1)} days`;
  } else if (hours >= 1) {
    return `${hours.toFixed(1)} hours`;
  } else {
    return `${(Number(seconds) / 60).toFixed(1)} minutes`;
  }
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export interface HealthDisplay {
  percentage: number;
  color: string;
  display: string;
}

export function formatHealthDisplay(current: number, max: number): HealthDisplay {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  const color = current > 0 ? "#4CAF50" : "#F44336";
  const display = `${current}/${max}`;

  return {
    percentage,
    color,
    display,
  };
}
