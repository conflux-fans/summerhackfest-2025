// Import contract addresses from constants.ts
export { CONTRACT_ADDRESSES } from "./constants"

// Import ABI from the latest deployed QuizCraftArena contract artifact
import QuizArtifact from "../../SamrtContract/artifacts/contracts/Quiz.sol/QuizCraftArena.json"

export const QUIZ_CRAFT_ARENA_ABI = (QuizArtifact as any).abi

export const QUIZ_CRAFT_NFT_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
]