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

// Core package exports
// Based on REFACTORING_PLAN.md

// Main SDK
export { ChainBrawlerSDK } from "./ChainBrawlerSDK";
// Constants
export * from "./constants/enemies";
// Contract client
export { ContractClient } from "./contract/ContractClient";
export { ContractClientFactory } from "./contract/ContractClientFactory";
export { WagmiContractClient } from "./contract/WagmiContractClient";
// Events
export { EventEmitter } from "./events/EventEmitter";
export { EventHandler } from "./events/EventHandler";
// Generated utilities
export { getContractAddresses } from "./generated/contractAddresses";
export { CharacterStateManager } from "./managers/CharacterStateManager";
export { ErrorRecoveryManager } from "./managers/ErrorRecoveryManager";
export { OperationTracker } from "./managers/OperationTracker";
// Managers
export { StatusMessageManager } from "./managers/StatusMessageManager";
export { UXManager } from "./managers/UXManager";
export { BaseOperation } from "./operations/BaseOperation";
// Operations
export { CharacterOperations } from "./operations/CharacterOperations";
export { ClaimsOperations } from "./operations/ClaimsOperations";
export { LeaderboardOperations } from "./operations/LeaderboardOperations";
export { PoolsOperations } from "./operations/PoolsOperations";
// State management
export { UXStore } from "./state/UXStore";
// Types
export * from "./types";
export { ChainBrawlerError, ErrorType } from "./types/ErrorType";
export { EventType } from "./types/EventType";
export { StatusMessageType } from "./types/StatusMessageType";
export {
  detectWalletType,
  getChainConfig,
  getSupportedChainById,
  hasContractDeployed,
  isSupportedChain,
  SUPPORTED_CHAINS,
} from "./utils/ChainUtils";
export {
  CHARACTER_CLASSES,
  getCharacterClass,
  getCharacterClassName,
} from "./utils/CharacterUtils";
export {
  calculateEnemyStats,
  ENEMY_TYPES,
  getDifficultyColor,
  getDifficultyLevel,
  getEnemyName,
  getEnemyType,
} from "./utils/EnemyUtils";
// Utilities
export { FightDataNormalizer } from "./utils/FightDataNormalizer";
export {
  generateMerkleTree,
  generatePlayerMerkleProof,
  MerkleTreeUtils,
  verifyMerkleProof,
} from "./utils/MerkleTreeUtils";
export {
  formatAddress,
  formatEthAmount,
  formatHealthDisplay,
  formatTimeRemaining,
  getFightOutcome,
} from "./utils/UIUtils";
export { ValidationManager } from "./validation/ValidationManager";
// Validation
export { ValidationResult, ValidationRules } from "./validation/ValidationRules";
