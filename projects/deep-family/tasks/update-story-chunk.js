const { task } = require("hardhat/config");

// updateStoryChunk(tokenId, chunkIndex, newContent, expectedHash)
// Only NFT holder; chunk must exist and story not sealed.

task("update-story-chunk", "Update an existing story chunk")
  .addParam("tokenid", "NFT tokenId")
  .addParam("chunkindex", "Chunk index to update")
  .addParam("content", "New chunk content (<=1000 chars)")
  .addOptionalParam(
    "exphash",
    "Expected new content hash (bytes32, optional)",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  )
  .setAction(async (args, hre) => {
    const { deployments, ethers } = hre;
    const { get } = deployments;
    const signer = (await ethers.getSigners())[0];

    let deepDeployment;
    try {
      deepDeployment = await get("DeepFamily");
    } catch {
      await deployments.fixture(["Integrated"]);
      deepDeployment = await get("DeepFamily");
    }

    const deepFamily = await ethers.getContractAt("DeepFamily", deepDeployment.address, signer);

    const tokenId = BigInt(args.tokenid);
    const chunkIndex = Number(args.chunkindex);
    if (!Number.isInteger(chunkIndex) || chunkIndex < 0) throw new Error("chunkindex must be >=0");

    const newContent = args.content;
    if (newContent.length === 0) throw new Error("content cannot be empty");
    if (newContent.length > 1000) throw new Error("content exceeds 1000 char limit");

    // Fetch metadata to ensure not sealed and chunk exists
    let metadata;
    try {
      metadata = await deepFamily.getStoryMetadata(tokenId);
    } catch (e) {
      throw new Error(`Failed to read metadata. ${e.message || e}`);
    }
    const total = Number(metadata.totalChunks);
    if (metadata.isSealed) throw new Error("Story already sealed");
    if (chunkIndex >= total) throw new Error(`chunkIndex out of range (totalChunks=${total})`);

    const expectedHash = args.exphash;
    const localHash = ethers.keccak256(ethers.toUtf8Bytes(newContent));
    console.log("Local new content hash:", localHash);
    if (
      expectedHash &&
      expectedHash !== "0x" + "0".repeat(64) &&
      expectedHash.toLowerCase() !== localHash.toLowerCase()
    ) {
      throw new Error(
        `Provided exphash (${expectedHash}) does not match local hash (${localHash})`,
      );
    }

    console.log("Updating chunk", chunkIndex, "for token", tokenId.toString());

    const tx = await deepFamily.updateStoryChunk(tokenId, chunkIndex, newContent, expectedHash);
    console.log("Submitted tx:", tx.hash);
    const receipt = await tx.wait();
    console.log("Confirmed in block:", receipt.blockNumber);

    // Parse StoryChunkUpdated
    try {
      const iface = new ethers.Interface([
        "event StoryChunkUpdated(uint256 indexed tokenId, uint256 indexed chunkIndex, bytes32 oldHash, bytes32 newHash, address indexed editor)",
      ]);
      const deepAddr = deepDeployment.address.toLowerCase();
      for (const log of receipt.logs || []) {
        if ((log.address || "").toLowerCase() !== deepAddr) continue;
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === "StoryChunkUpdated") {
            console.log("Old hash:", parsed.args.oldHash);
            console.log("New hash:", parsed.args.newHash);
            break;
          }
        } catch (_) {
          /* ignore */
        }
      }
    } catch (e) {
      console.log("Event parse failed:", e.message || e);
    }
  });
