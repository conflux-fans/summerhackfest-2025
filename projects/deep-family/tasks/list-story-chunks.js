const { task } = require("hardhat/config");

// Helper query task for debugging story chunks with pagination

// listStoryChunks(tokenId, offset, limit)
// getStoryMetadata(tokenId) for summary

// Usage example:
// npx hardhat list-story-chunks --tokenid 1 --offset 0 --limit 10 --network localhost

task("list-story-chunks", "List story chunks for an NFT with pagination")
  .addParam("tokenid", "NFT tokenId")
  .addOptionalParam("offset", "Pagination offset", "0")
  .addOptionalParam("limit", "Pagination limit (<=100)", "20")
  .setAction(async (args, hre) => {
    const { deployments, ethers } = hre;
    const { get } = deployments;

    let deepDeployment;
    try {
      deepDeployment = await get("DeepFamily");
    } catch {
      await deployments.fixture(["Integrated"]);
      deepDeployment = await get("DeepFamily");
    }

    const deepFamily = await ethers.getContractAt("DeepFamily", deepDeployment.address);
    const tokenId = BigInt(args.tokenid);
    const offset = Number(args.offset);
    const limit = Number(args.limit);

    const metadata = await deepFamily.getStoryMetadata(tokenId);
    console.log(
      "Story metadata: totalChunks=",
      metadata.totalChunks.toString(),
      " sealed=",
      metadata.isSealed,
    );
    console.log(
      "Total length chars:",
      metadata.totalLength.toString(),
      " lastUpdate=",
      metadata.lastUpdateTime.toString(),
    );
    console.log("Full story hash:", metadata.fullStoryHash);

    const result = await deepFamily.listStoryChunks(tokenId, offset, limit);
    const chunks = result[0];
    const totalChunks = Number(result[1]);
    const hasMore = result[2];
    const nextOffset = Number(result[3]);

    console.log(
      `Returned ${chunks.length} chunks (total=${totalChunks}) hasMore=${hasMore} nextOffset=${nextOffset}`,
    );
    chunks.forEach((c, i) => {
      console.log(
        `#${i} -> index=${c.chunkIndex.toString()} hash=${c.chunkHash} length=${c.content.length}`,
      );
      console.log(`   content: ${c.content}`);
    });
  });
