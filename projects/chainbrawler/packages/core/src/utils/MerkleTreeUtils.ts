/**
 * Merkle Tree utilities for ChainBrawler leaderboard prize distribution
 * Compatible with OpenZeppelin's MerkleProof.sol
 *
 * Ported from packages/sdk/src/merkleTree.ts
 */

import { concat, hexToBytes, keccak256 } from "viem";

export interface LeaderboardEntry {
  epoch: bigint;
  index: number;
  account: `0x${string}`;
  amount: bigint;
}

export interface MerkleTreeData {
  root: `0x${string}`;
  entries: LeaderboardEntry[];
  proofs: { [index: number]: `0x${string}`[] };
}

/**
 * Generate a merkle tree for leaderboard prize distribution
 * Uses the same leaf encoding as the contract: keccak256(abi.encodePacked(epoch, index, account, amount))
 */
export function generateMerkleTree(entries: LeaderboardEntry[]): MerkleTreeData {
  if (entries.length === 0) {
    throw new Error("Cannot generate merkle tree with no entries");
  }

  // Sort entries by index to ensure consistent ordering
  const sortedEntries = [...entries].sort((a, b) => a.index - b.index);

  // Generate leaves using the same encoding as the contract
  const leaves = sortedEntries.map((entry) => {
    const encodedData = encodePackedLeaf(entry.epoch, entry.index, entry.account, entry.amount);
    return keccak256(encodedData);
  });

  // Build the merkle tree
  const tree = buildMerkleTree(leaves);
  const root = tree[tree.length - 1][0];

  // Generate proofs for each entry
  const proofs: { [index: number]: `0x${string}`[] } = {};

  for (let i = 0; i < sortedEntries.length; i++) {
    proofs[sortedEntries[i].index] = generateProof(tree, i);
  }

  return {
    root,
    entries: sortedEntries,
    proofs,
  };
}

/**
 * Encode leaf data using the same format as the contract
 * Equivalent to: keccak256(abi.encodePacked(epoch, index, account, amount))
 */
function encodePackedLeaf(
  epoch: bigint,
  index: number,
  account: `0x${string}`,
  amount: bigint
): Uint8Array {
  // Convert to bytes
  const epochBytes = toBytes32(epoch);
  const indexBytes = toBytes32(BigInt(index));
  const accountBytes = toBytes20(account);
  const amountBytes = toBytes32(amount);

  // Concatenate (equivalent to abi.encodePacked)
  const packed = new Uint8Array(
    epochBytes.length + indexBytes.length + accountBytes.length + amountBytes.length
  );
  let offset = 0;

  packed.set(epochBytes, offset);
  offset += epochBytes.length;
  packed.set(indexBytes, offset);
  offset += indexBytes.length;
  packed.set(accountBytes, offset);
  offset += accountBytes.length;
  packed.set(amountBytes, offset);

  return packed;
}

/**
 * Build a merkle tree from leaves
 */
function buildMerkleTree(leaves: `0x${string}`[]): `0x${string}`[][] {
  if (leaves.length === 0) throw new Error("Cannot build tree with no leaves");

  const tree: `0x${string}`[][] = [leaves];

  while (tree[tree.length - 1].length > 1) {
    const currentLevel = tree[tree.length - 1];
    const nextLevel: `0x${string}`[] = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;

      // Hash the concatenated pair
      const combined = concat([left, right]);
      const hash = keccak256(combined);
      nextLevel.push(hash);
    }

    tree.push(nextLevel);
  }

  return tree;
}

/**
 * Generate a merkle proof for a given leaf index
 */
function generateProof(tree: `0x${string}`[][], leafIndex: number): `0x${string}`[] {
  const proof: `0x${string}`[] = [];
  let currentIndex = leafIndex;

  for (let level = 0; level < tree.length - 1; level++) {
    const currentLevel = tree[level];
    const isLeft = currentIndex % 2 === 0;
    const siblingIndex = isLeft ? currentIndex + 1 : currentIndex - 1;

    if (siblingIndex < currentLevel.length) {
      proof.push(currentLevel[siblingIndex]);
    }

    currentIndex = Math.floor(currentIndex / 2);
  }

  return proof;
}

/**
 * Verify a merkle proof
 */
export function verifyMerkleProof(
  root: `0x${string}`,
  leaf: `0x${string}`,
  proof: `0x${string}`[]
): boolean {
  let computedHash = leaf;

  for (const proofElement of proof) {
    const combined = concat([computedHash, proofElement]);
    computedHash = keccak256(combined);
  }

  return computedHash === root;
}

/**
 * Convert bigint to 32-byte array
 */
function toBytes32(value: bigint): Uint8Array {
  const hex = value.toString(16).padStart(64, "0");
  return hexToBytes(`0x${hex}` as `0x${string}`);
}

/**
 * Convert address to 20-byte array
 */
function toBytes20(address: `0x${string}`): Uint8Array {
  return hexToBytes(address);
}

/**
 * Generate merkle proof for a specific player and epoch
 * This is the main function that should be called from the contract client
 */
export function generatePlayerMerkleProof(
  playerAddress: `0x${string}`,
  epoch: bigint,
  leaderboardEntries: LeaderboardEntry[]
): { amount: bigint; index: number; proof: `0x${string}`[] } | null {
  // Find the player's entry
  const playerEntry = leaderboardEntries.find(
    (entry) => entry.account.toLowerCase() === playerAddress.toLowerCase() && entry.epoch === epoch
  );

  if (!playerEntry) {
    return null;
  }

  // Generate the merkle tree
  const merkleTree = generateMerkleTree(leaderboardEntries);

  // Get the proof for this player
  const proof = merkleTree.proofs[playerEntry.index];

  if (!proof) {
    return null;
  }

  return {
    amount: playerEntry.amount,
    index: playerEntry.index,
    proof,
  };
}

/**
 * MerkleTreeUtils class for advanced merkle tree operations
 */
export class MerkleTreeUtils {
  /**
   * Generate a complete merkle tree with all utilities
   */
  static generateTree(entries: LeaderboardEntry[]): MerkleTreeData {
    return generateMerkleTree(entries);
  }

  /**
   * Verify a merkle proof
   */
  static verifyProof(root: `0x${string}`, leaf: `0x${string}`, proof: `0x${string}`[]): boolean {
    return verifyMerkleProof(root, leaf, proof);
  }

  /**
   * Generate proof for a specific player
   */
  static generatePlayerProof(
    playerAddress: `0x${string}`,
    epoch: bigint,
    leaderboardEntries: LeaderboardEntry[]
  ): { amount: bigint; index: number; proof: `0x${string}`[] } | null {
    return generatePlayerMerkleProof(playerAddress, epoch, leaderboardEntries);
  }
}
