// utils/pyth.ts
import { ethers } from "ethers";

export async function fetchPythUpdateData(
  feedIds: string[], // Array of price feed IDs (e.g., tokenFeedId, cfxUsdFeedId)
  provider: ethers.BrowserProvider
): Promise<string[]> {
  try {
    // Pyth Network API endpoint (Hermes API for Conflux eSpace)
    const PYTH_API_URL = "https://hermes.pyth.network/v2/updates/price/latest";

    // Convert feedIds to hex if not already (ensure they are valid bytes32)
    const hexFeedIds = feedIds.map((id) =>
      id.startsWith("0x") ? id : `0x${id.padStart(64, "0")}`
    );

    // Fetch price update data
    const response = await fetch(
      `${PYTH_API_URL}?ids[]=${hexFeedIds.join("&ids[]=")}&encoding=hex`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch Pyth data: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || !data.binary || !data.binary.data || !Array.isArray(data.binary.data)) {
      throw new Error("Invalid Pyth API response");
    }

    // Return hex-encoded VAA data
    return data.binary.data;
  } catch (err) {
    console.error("fetchPythUpdateData error:", err);
    throw new Error(`Failed to fetch Pyth update data: ${err instanceof Error ? err.message : String(err)}`);
  }
}