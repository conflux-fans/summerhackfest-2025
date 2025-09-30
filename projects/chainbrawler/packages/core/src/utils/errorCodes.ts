// Error codes and utilities
// Based on CONTRACT_REFERENCE.md errors.json

// Access Control Errors (1000-1099)
const ACCESS_ERRORS = {
  1001: "Only owner",
  1002: "Only owner or test helper",
} as const;

// Fee and Payment Errors (1100-1199)
const FEE_ERRORS = {
  1101: "Insufficient fee",
  1102: "Already at full health",
  1103: "Healing on cooldown",
} as const;

// Character Errors (1200-1299)
const CHARACTER_ERRORS = {
  1201: "Character does not exist",
  1202: "Character is not alive",
  1203: "Invalid address",
  1204: "Character is in combat",
  1205: "Character is not in combat",
  1206: "Character already exists",
  1207: "Invalid class",
  1208: "Character is already alive",
} as const;

// Combat Errors (1300-1399)
const COMBAT_ERRORS = {
  1301: "Invalid enemy level",
} as const;

// Batch Operation Errors (1400-1499)
const BATCH_ERRORS = {
  1401: "Empty players array",
  1402: "Batch size too large",
  1403: "Invalid player address",
} as const;

// Treasury Errors (1500-1599)
const TREASURY_ERRORS = {
  1501: "Drop rate too high",
  1502: "No funds to withdraw",
  1503: "Transfer failed",
  1504: "cached dropRate exceeds MAX_DROP_RATE_BP",
} as const;

// Enemy Errors (1600-1699)
const ENEMY_ERRORS = {
  1601: "Enemy does not exist",
  1602: "No active combat state",
} as const;

// Leaderboard and Claims Errors (1700-1799)
const LEADERBOARD_ERRORS = {
  1701: "Invalid epoch",
  1702: "No funds provided",
  1703: "Array length mismatch",
  1704: "Insufficient contract balance",
  1705: "Invalid root",
  1706: "Epoch already published",
  1707: "Unfunded epoch",
  1708: "No root available",
  1709: "Dispute window not expired",
  1710: "Claim window expired",
  1711: "Already claimed",
  1712: "Insufficient epoch funds",
  1713: "Not published",
  1714: "Claim window still active",
  1715: "No unclaimed funds",
  1716: "Invalid recipient address",
  1717: "Invalid treasury address",
  1718: "Transfer failed",
  1719: "Invalid proof",
  1720: "Withdraw failed",
} as const;

// BitPacked Library Errors (2000+)
const BITPACKED_ERRORS = {
  2001: "BitPackedCharacterLib: combat overflow",
  2002: "BitPackedCharacterLib: endurance overflow",
  2003: "BitPackedCharacterLib: defense overflow",
  2004: "BitPackedCharacterLib: luck overflow",
  2101: "BitPackedEnemyLib: baseCombat overflow",
  2102: "BitPackedEnemyLib: baseEndurance overflow",
  2103: "BitPackedEnemyLib: baseDefense overflow",
  2104: "BitPackedEnemyLib: baseLuck overflow",
  2105: "BitPackedEnemyLib: xpReward overflow",
  2106: "BitPackedEnemyLib: dropRate overflow",
} as const;

export const ERROR_CODES = {
  ...ACCESS_ERRORS,
  ...FEE_ERRORS,
  ...CHARACTER_ERRORS,
  ...COMBAT_ERRORS,
  ...BATCH_ERRORS,
  ...TREASURY_ERRORS,
  ...ENEMY_ERRORS,
  ...LEADERBOARD_ERRORS,
  ...BITPACKED_ERRORS,
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export function getErrorMessage(errorCode: number): string {
  return ERROR_CODES[errorCode as ErrorCode] || `Unknown error: ${errorCode}`;
}

export function extractErrorCode(error: any): number | null {
  // Extract error code from various error formats
  if (typeof error === "number") return error;
  if (error?.code) return error.code;
  if (error?.error?.code) return error.error.code;
  if (error?.message) {
    const match = error.message.match(/error code: (\d+)/i);
    if (match) return parseInt(match[1]);
  }
  return null;
}

// Error code constants
export const UNKNOWN_ERROR_CODE = 5000;
export const DEFAULT_ERROR_CODE = 9998;

export function isRetryableError(errorCode: number): boolean {
  // Define which errors are retryable
  const retryableCodes = [
    1704, // Insufficient contract balance (temporary)
    1503, // Transfer failed (network issue)
    1718, // Transfer failed (network issue)
  ];

  return retryableCodes.includes(errorCode);
}
