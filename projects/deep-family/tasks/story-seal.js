const { task } = require("hardhat/config");

// sealStory(tokenId) -> emits StorySealed

task("seal-story", "Seal the story for an NFT (no further chunk modifications)")
  .addParam("tokenid", "NFT tokenId")
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

    // Check metadata to surface user-friendly errors
    let metadata;
    try {
      metadata = await deepFamily.getStoryMetadata(tokenId);
    } catch (e) {
      throw new Error(`Failed to fetch story metadata. ${e.message || e}`);
    }

    if (metadata.isSealed) {
      throw new Error("Story already sealed");
    }
    if (Number(metadata.totalChunks) === 0) {
      throw new Error("Cannot seal empty story (no chunks)");
    }

    const tx = await deepFamily.sealStory(tokenId);
    const receipt = await tx.wait();

    try {
      const iface = new ethers.Interface([
        "event StorySealed(uint256 indexed tokenId, uint256 totalChunks, bytes32 fullStoryHash, address indexed sealer)",
      ]);
      const deepAddr = deepDeployment.address.toLowerCase();
      for (const log of receipt.logs || []) {
        if ((log.address || "").toLowerCase() !== deepAddr) continue;
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === "StorySealed") {
            break;
          }
        } catch (_) {
          /* ignore */
        }
      }
    } catch (e) {}
  });
