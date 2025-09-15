// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

/**
 * @notice Centralized compact error type for production builds.
 * Use a small integer code returned on revert so off-chain tooling
 * can map codes to long, human-friendly messages.
 */
error GameError(uint16 code);
