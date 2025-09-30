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

// React adapter package exports
// Based on REFACTORING_PLAN.md

// Re-export core types
export type { ChainBrawlerConfig, UXState } from "@chainbrawler/core";
// Adapters
export { ReactAdapter } from "./adapters/ReactAdapter";
export { WebAdapter } from "./adapters/WebAdapter";
// Components
export { CharacterDisplay } from "./components/CharacterDisplay";
export { ClaimsDisplay } from "./components/ClaimsDisplay";
export { ErrorDisplay } from "./components/ErrorDisplay";
export { LeaderboardDisplay } from "./components/LeaderboardDisplay";
export { PoolsDisplay } from "./components/PoolsDisplay";
export { StatusDisplay } from "./components/StatusDisplay";
// Hooks
export { useChainBrawler } from "./hooks/useChainBrawler";
export { useClaims } from "./hooks/useClaims";
export { useLeaderboard } from "./hooks/useLeaderboard";
export { usePools } from "./hooks/usePools";
export { useUXState } from "./hooks/useUXState";
export { useWalletManager } from "./hooks/useWalletManager";
export { useWebChainBrawler } from "./hooks/useWebChainBrawler";
export { useWebClaims } from "./hooks/useWebClaims";
export { useWebLeaderboard } from "./hooks/useWebLeaderboard";
export { useWebPools } from "./hooks/useWebPools";
// Providers
export { ChainBrawlerProvider, useChainBrawlerContext } from "./providers/ChainBrawlerProvider";
export { RouterProvider } from "./providers/RouterProvider";
export {
  useWebChainBrawlerContext,
  WebChainBrawlerProvider,
} from "./providers/WebChainBrawlerProvider";
// Enhanced UI Components
export { CharacterDisplay as EnhancedCharacterDisplay } from "./ui/enhanced/CharacterDisplay";
export { ClaimsDisplay as EnhancedClaimsDisplay } from "./ui/enhanced/ClaimsDisplay";
export { ErrorDisplay as EnhancedErrorDisplay } from "./ui/enhanced/ErrorDisplay";
export { LeaderboardDisplay as EnhancedLeaderboardDisplay } from "./ui/enhanced/LeaderboardDisplay";
export { PoolsDisplay as EnhancedPoolsDisplay } from "./ui/enhanced/PoolsDisplay";
export { StatusDisplay as EnhancedStatusDisplay } from "./ui/enhanced/StatusDisplay";
// Primitive UI Components
export { EnemySelection } from "./ui/primitives/EnemySelection";
export { FightSummary } from "./ui/primitives/FightSummary";
export { OperationStatus } from "./ui/primitives/OperationStatus";
