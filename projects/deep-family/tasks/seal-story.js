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

    console.log("Sealing story for tokenId:", tokenId.toString());
    const tx = await deepFamily.sealStory(tokenId);
    console.log("Submitted tx:", tx.hash);
    const receipt = await tx.wait();
    console.log("Confirmed in block:", receipt.blockNumber);

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
            console.log("Total chunks:", parsed.args.totalChunks.toString());
            console.log("Full story hash:", parsed.args.fullStoryHash);
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
