const hre = require("hardhat");
const { ethers } = hre;

// Added: debug helper
const DEBUG_ENABLED = process.env.DEBUG_SEED === "1";
function dlog(...args) {
  if (DEBUG_ENABLED) console.log("[DEBUG]", ...args);
}
// Added: periodic heartbeat so user sees script still alive
// Keep a handle so we can clear it when the script finishes
let HEARTBEAT;
if (DEBUG_ENABLED) {
  HEARTBEAT = setInterval(
    () => console.log(`[DEBUG][heartbeat] ${new Date().toISOString()}`),
    15000,
  );
}

// Global flag: if token isn't initialized/bound correctly, avoid reward mint
let DISABLE_REWARD_MINT = false;

// --- Added: helper functions and constants for maximizing tag/story length ---
const MAX_TAG_LEN = 64; // Align with contract MAX_SHORT_TEXT_LENGTH
const MAX_STORY_LEN = 256; // Align with contract MAX_LONG_TEXT_LENGTH
const MAX_CHUNK_CONTENT_LENGTH = 1000; // Align with contract MAX_CHUNK_CONTENT_LENGTH
const MAX_STORY_CHUNKS = 100; // Align with contract MAX_STORY_CHUNKS
function utf8ByteLen(str) {
  return Buffer.byteLength(str, "utf8");
}
function truncateUtf8Bytes(str, maxBytes) {
  if (utf8ByteLen(str) <= maxBytes) return str;
  let res = "";
  for (const ch of str) {
    const nb = utf8ByteLen(ch);
    if (utf8ByteLen(res) + nb > maxBytes) break;
    res += ch;
  }
  return res;
}
// Added: makeMaxTag helper (previously missing causing ReferenceError)
function makeMaxTag(raw) {
  return truncateUtf8Bytes(String(raw || "").replace(/\s+/g, "_"), MAX_TAG_LEN);
}
// Hash calculation consistent with contract _hashString: keccak256(abi.encodePacked(string))
function solidityStringHash(s) {
  return ethers.keccak256(ethers.toUtf8Bytes(s));
}

// Helper: call new getPersonHash (using PersonBasicInfo struct with fullNameHash)
async function getPersonHashFromBasicInfo(deepFamily, basicInfo) {
  // First compute fullNameHash from fullName
  const fullNameHash = await deepFamily.getFullNameHash(basicInfo.fullName);

  return await deepFamily.getPersonHash({
    fullNameHash: fullNameHash,
    isBirthBC: basicInfo.isBirthBC,
    birthYear: basicInfo.birthYear,
    birthMonth: basicInfo.birthMonth,
    birthDay: basicInfo.birthDay,
    gender: basicInfo.gender,
  });
}
// Generate example story text with strict 256 bytes (or <=256): includes multi-language previously, now English only; padded with ASCII to reach limit
const LONG_STORY = (() => {
  const base =
    "Example Life Story - Stress test for contract max length limit; includes English, numbers1234567890, punctuation.,:_/; emoji😀. " +
    "This text is truncated by UTF-8 bytes to fit limit.";
  let s = base;
  // Pad ASCII for precise byte control (ASCII 1 byte)
  while (utf8ByteLen(s) < MAX_STORY_LEN) s += "X";
  return truncateUtf8Bytes(s, MAX_STORY_LEN);
})();

// Helper to generate story chunk content
function generateChunkContent(chunkIndex, isMaxLength = false) {
  const baseContent =
    `Story chunk #${chunkIndex}. ` +
    `Contains mixed placeholder content for testing chunked storage functionality. ` +
    `Chunk index: ${chunkIndex}, timestamp: ${Date.now()}. `;

  if (!isMaxLength) {
    return baseContent + `Short content test.`;
  }

  // Generate near max length content (close to 1000 chars)
  let content = baseContent;
  const filler = "Filler text to reach maximum storage limit. ";

  while (utf8ByteLen(content) < MAX_CHUNK_CONTENT_LENGTH - 50) {
    content += filler;
  }

  // Ensure not exceeding max length
  return truncateUtf8Bytes(content, MAX_CHUNK_CONTENT_LENGTH);
}

// Add story chunks for an NFT
async function addStoryChunks(deepFamily, tokenId, numChunks = 5, useMaxLength = false) {
  console.log(`Adding ${numChunks} story chunks for TokenID ${tokenId}...`);

  // Check if contract supports story chunk feature
  try {
    await deepFamily.MAX_CHUNK_CONTENT_LENGTH();
  } catch (error) {
    console.warn(`  Contract does not support story chunks, skip TokenID ${tokenId}`);
    return;
  }

  for (let i = 0; i < numChunks; i++) {
    try {
      const content = generateChunkContent(i, useMaxLength);
      // Fix: expected hash must use encodePacked (raw UTF-8 bytes)
      const expectedHash = solidityStringHash(content);
      const tx = await deepFamily.addStoryChunk(tokenId, i, content, expectedHash);
      await tx.wait();
      console.log(`  Chunk #${i} added, length: ${utf8ByteLen(content)} bytes`);
    } catch (error) {
      console.warn(`  Chunk #${i} failed:`, error.message?.slice(0, 180));
    }
  }
}

// Add story chunk data for already minted NFTs
async function addStoryChunksToNFTs(deepFamily, expectedNFTCount) {
  console.log(`Start adding story chunk test data for minted NFTs...`);

  try {
    const totalSupply = await deepFamily.tokenCounter();
    const actualNFTCount = Number(totalSupply);
    console.log(`Current NFT total: ${actualNFTCount}, expected: ${expectedNFTCount}`);

    if (actualNFTCount === 0) {
      console.log("No NFTs found, skip story chunks");
      return;
    }

    // Add different number/size of chunks to different NFTs
    const storyChunkTargets = [
      { tokenId: 1, chunks: 10, useMaxLength: false, sealed: false }, // normal chunks
      { tokenId: 2, chunks: 25, useMaxLength: true, sealed: false }, // large chunks
      { tokenId: 3, chunks: MAX_STORY_CHUNKS, useMaxLength: true, sealed: true }, // max chunks + seal
    ];

    // If more NFTs, add more test cases
    if (actualNFTCount >= 5) {
      storyChunkTargets.push(
        { tokenId: 4, chunks: 50, useMaxLength: false, sealed: false }, // medium
        { tokenId: 5, chunks: 75, useMaxLength: true, sealed: false }, // many chunks
      );
    }

    // Randomly select more NFTs for testing
    const additionalTargets = Math.min(5, actualNFTCount - storyChunkTargets.length);
    for (let i = 0; i < additionalTargets; i++) {
      const tokenId = storyChunkTargets.length + i + 1;
      if (tokenId <= actualNFTCount) {
        const randomChunks = 1 + Math.floor(Math.random() * 20); // 1-20 chunks
        storyChunkTargets.push({
          tokenId,
          chunks: randomChunks,
          useMaxLength: Math.random() > 0.5,
          sealed: Math.random() > 0.7,
        });
      }
    }

    let processedCount = 0;
    let totalChunksAdded = 0;

    for (const target of storyChunkTargets) {
      if (target.tokenId > actualNFTCount) {
        console.log(`Skip TokenID ${target.tokenId}, out of range`);
        continue;
      }

      try {
        // Check NFT exists
        const owner = await deepFamily.ownerOf(target.tokenId);
        console.log(`\nProcessing TokenID ${target.tokenId} (owner: ${owner.slice(0, 8)}...)`);

        // Check existing story chunks
        try {
          const metadata = await deepFamily.getStoryMetadata(target.tokenId);
          if (metadata.totalChunks > 0) {
            console.log(
              `  TokenID ${target.tokenId} already has ${metadata.totalChunks} chunks, skip`,
            );
            continue;
          }
        } catch (e) {
          // If metadata retrieval fails, assume no chunks yet
        }

        // Add chunks
        await addStoryChunks(deepFamily, target.tokenId, target.chunks, target.useMaxLength);
        totalChunksAdded += target.chunks;

        // Seal if required
        if (target.sealed) {
          try {
            console.log(`  Sealing story for TokenID ${target.tokenId}...`);
            const sealTx = await deepFamily.sealStory(target.tokenId);
            await sealTx.wait();
            console.log(`  TokenID ${target.tokenId} story sealed`);
          } catch (error) {
            console.warn(`  TokenID ${target.tokenId} seal failed:`, error.message?.slice(0, 100));
          }
        }

        processedCount++;
      } catch (error) {
        console.warn(`Processing TokenID ${target.tokenId} failed:`, error.message?.slice(0, 100));
      }
    }

    console.log(`\nStory chunk addition complete:`);
    console.log(`  NFTs processed: ${processedCount}/${storyChunkTargets.length}`);
    console.log(`  Total chunks: ${totalChunksAdded}`);
    console.log(
      `  Average chunks per NFT: ${processedCount > 0 ? Math.round(totalChunksAdded / processedCount) : 0}`,
    );
  } catch (error) {
    console.error("Error while adding story chunks:", error.message);
  }
}

// Ensure current signer has enough DEEP balance & allowance for endorsement (endorseVersion uses transferFrom)
async function ensureEndorsementReady({ deepFamily, rootHash, rootVer, basic, ethers }) {
  dlog("enter ensureEndorsementReady");
  const signer = (await ethers.getSigners())[0];
  const signerAddr = await signer.getAddress();
  dlog("signer", signerAddr);
  const tokenAddr = await deepFamily.DEEP_FAMILY_TOKEN_CONTRACT();
  dlog("tokenAddr", tokenAddr);
  const token = await ethers.getContractAt("DeepFamilyToken", tokenAddr);
  const deepFamilyAddr = deepFamily.target || deepFamily.address;
  dlog("deepFamilyAddr", deepFamilyAddr);

  // Check token binding; if not initialized or bound to a different DeepFamily, disable reward-dependent paths
  try {
    const bound = await token.deepFamilyContract();
    const isUnbound = !bound || bound === ethers.ZeroAddress;
    const mismatch = String(bound).toLowerCase() !== String(deepFamilyAddr).toLowerCase();
    if (isUnbound || mismatch) {
      DISABLE_REWARD_MINT = true;
      console.warn(
        `DeepFamilyToken not initialized or bound to different DeepFamily (bound=${bound}, expected=${deepFamilyAddr}).` +
          " Seeding will omit mother references to bypass reward mint path.",
      );
    } else {
      dlog("Token binding OK:", bound);
    }
  } catch (e) {
    // Some older ABIs may not expose deepFamilyContract; be cautious
    console.warn(
      "Cannot read token.deepFamilyContract() (older ABI or network error). Proceeding without reward-dependent paths.",
    );
    DISABLE_REWARD_MINT = true;
  }

  let recentReward = await token.recentReward();
  let balance = await token.balanceOf(signerAddr);
  let allowance = await token.allowance(signerAddr, deepFamilyAddr);
  dlog(
    "recentReward,balance,allowance",
    recentReward.toString(),
    balance.toString(),
    allowance.toString(),
  );

  // NEW: Proactively approve if allowance == 0 (even when recentReward==0) to avoid later missing allowance when reward becomes >0
  if (allowance === 0n) {
    console.log(
      `Allowance initially 0 (recentReward=${ethers.formatUnits(recentReward, 18)}). Approving MaxUint256 in advance...`,
    );
    const preApproveTx = await token.approve(deepFamilyAddr, ethers.MaxUint256);
    await preApproveTx.wait();
    allowance = await token.allowance(signerAddr, deepFamilyAddr);
    console.log(`Pre-approve done. New allowance=${allowance.toString()}`);
  }

  // If current reward is still 0 (recentReward=0), later mining may make it positive; delay final approve until then
  const needInitialApprove = allowance < recentReward && recentReward > 0n;
  if (needInitialApprove) {
    console.log(
      `Approving DeepFamily contract to spend DEEP (recentReward=${ethers.formatUnits(recentReward, 18)})...`,
    );
    const approveTx = await token.approve(deepFamilyAddr, ethers.MaxUint256);
    await approveTx.wait();
    console.log("Approve done (MaxUint256)");
  }

  // If balance is insufficient attempt one mining operation to obtain initial balance
  if (recentReward > 0n && balance < recentReward) {
    console.log(
      `DEEP balance insufficient (${ethers.formatUnits(balance, 18)} < fee ${ethers.formatUnits(recentReward, 18)}), attempting one mining operation to obtain initial balance...`,
    );
    const motherName = `SeedTempMother_${Date.now()}`;
    const motherInfo = basic(motherName, 1980, 2);
    await addPersonVersion({ deepFamily, info: motherInfo, tag: tagFor(1), cid: "QmTempMother" });
    const motherHash = await getPersonHashFromBasicInfo(deepFamily, motherInfo);
    const childName = `SeedTempChild_${Date.now()}`;
    const childInfo = basic(childName, 2005, 1);
    await addPersonVersion({
      deepFamily,
      info: childInfo,
      fatherHash: rootHash,
      fatherVersionIndex: rootVer,
      motherHash: motherHash,
      motherVersionIndex: 1,
      tag: tagFor(1),
      cid: "QmTempChild",
    });
    balance = await token.balanceOf(signerAddr);
    console.log(`Mining complete, new DEEP balance: ${ethers.formatUnits(balance, 18)}`);
  }

  // After mining re-fetch recentReward (may change) and allowance; if previous reward was 0 causing no approve, patch here
  recentReward = await token.recentReward();
  allowance = await token.allowance(signerAddr, deepFamilyAddr);
  if (recentReward > 0n && allowance < recentReward) {
    console.log(
      `Final approve (post-mining) recentReward=${ethers.formatUnits(recentReward, 18)}, current allowance=${allowance.toString()}`,
    );
    const approveTx2 = await token.approve(deepFamilyAddr, ethers.MaxUint256);
    await approveTx2.wait();
    console.log("Approve done (post-mining) MaxUint256");
  }

  // Final balance check (normally sufficient); if still insufficient just warn once
  balance = await token.balanceOf(signerAddr);
  if (recentReward > 0n && balance < recentReward) {
    console.warn(
      `Warning: balance ${ethers.formatUnits(balance, 18)} still < fee ${ethers.formatUnits(recentReward, 18)}; endorsements may revert`,
    );
  }
}

async function main() {
  const { deployments } = hre;
  const { get } = deployments;
  let deployment;
  try {
    deployment = await get("DeepFamily");
  } catch {
    await deployments.fixture(["Integrated"]);
    deployment = await get("DeepFamily");
  }
  const deepFamily = await ethers.getContractAt("DeepFamily", deployment.address);
  console.log("DeepFamily contract:", deployment.address);

  const rootFatherHash = process.env.ROOT_HASH;
  const rootFatherVersionIndex = Number(process.env.ROOT_VERSION || 1);

  function basic(fullName, year, gender, month = 1, day = 1) {
    return {
      fullName,
      isBirthBC: false,
      birthYear: year,
      birthMonth: month,
      birthDay: day,
      gender,
    };
  }

  // (0) Require using specified ROOT_HASH/ROOT_VERSION as ancestor; if not exists, error or create demo root
  let rootHash = rootFatherHash;
  let rootVer = rootFatherVersionIndex;
  try {
    await deepFamily.getVersionDetails(rootHash, rootVer);
  } catch (e) {
    // Priority: if provided base info matches ROOT_HASH, create it
    const fn = process.env.ROOT_FULL_NAME;
    const year = process.env.ROOT_BIRTH_YEAR ? Number(process.env.ROOT_BIRTH_YEAR) : undefined;
    const gender = process.env.ROOT_GENDER ? Number(process.env.ROOT_GENDER) : undefined;
    const place = process.env.ROOT_BIRTH_PLACE;
    const isBC = process.env.ROOT_IS_BC === "true";
    if (fn && year !== undefined && gender !== undefined && place) {
      const basicInfo = {
        fullName: fn,
        isBirthBC: isBC,
        birthYear: year,
        birthMonth: 1,
        birthDay: 1,
        gender,
        birthPlace: place,
      };
      const computed = await getPersonHashFromBasicInfo(deepFamily, basicInfo);
      if (computed.toLowerCase() === rootHash.toLowerCase()) {
        try {
          await addPersonVersion({ deepFamily, info: basicInfo, tag: "v1", cid: "QmRootSeed" });
        } catch {}
        rootHash = computed;
        rootVer = 1;
      } else {
        console.warn("Provided base info hash does not match ROOT_HASH, fallback to demo root.");
      }
    }
    // Fallback: create / reuse demo root DemoRoot
    if (!rootHash || rootHash === rootFatherHash) {
      const demo = {
        fullName: "DemoRoot",
        isBirthBC: false,
        birthYear: 1970,
        birthMonth: 1,
        birthDay: 1,
        gender: 1,
        birthPlace: "US-CA-Los Angeles",
      };
      const demoHash = await getPersonHashFromBasicInfo(deepFamily, demo);
      try {
        await deepFamily.getVersionDetails(demoHash, 1);
        rootHash = demoHash;
        rootVer = 1;
      } catch {
        await addPersonVersion({ deepFamily, info: demo, tag: "v1", cid: "QmDemoRoot" });
        rootHash = demoHash;
        rootVer = 1;
      }
    }
  }

  await seedLargeDemo({ deepFamily, rootHash, rootVer, basic, ethers });
  return;
}

async function seedLargeDemo({ deepFamily, rootHash, rootVer, basic, ethers }) {
  dlog("seedLargeDemo start params", { rootHash, rootVer });
  // Depth default max 10 (unless ALLOW_DEPTH_OVER_10=1 and TARGET_DEPTH>10)
  const TARGET_DEPTH_RAW = Number(process.env.TARGET_DEPTH || 5);
  const TARGET_DEPTH =
    TARGET_DEPTH_RAW > 10 && process.env.ALLOW_DEPTH_OVER_10 !== "1" ? 10 : TARGET_DEPTH_RAW;
  const TARGET_NFT_RATIO = Number(process.env.TARGET_NFT_RATIO || 0.67); // default 2/3 ratio
  const BASE_YEAR = Number(process.env.BASE_YEAR || 1950);
  const PLACE = process.env.DEFAULT_PLACE || "US-CA-Los Angeles";
  const LARGE_SEED_SKIP_NFT = process.env.SKIP_NFT === "1";
  const RNG_SEED = BigInt(process.env.RNG_SEED || "123456789");
  let rngState = RNG_SEED;
  function rand() {
    rngState = (rngState * 6364136223846793005n + 1442695040888963407n) & ((1n << 64n) - 1n);
    return Number(rngState >> 11n) / 2 ** 53;
  }
  function randomDeathYear(birthYear) {
    return birthYear + 40 + Math.floor(rand() * 40);
  }

  console.log(
    `Starting large seed generation (2^ expansion), target depth ${TARGET_DEPTH}, NFT ratio ${TARGET_NFT_RATIO}`,
  );

  // Prepare DEEP balance & allowance before endorsements
  try {
    dlog("before ensureEndorsementReady");
    await ensureEndorsementReady({ deepFamily, rootHash, rootVer, basic, ethers });
    dlog("after ensureEndorsementReady");
  } catch (e) {
    console.error("ensureEndorsementReady failed:", e); // surface error early
    throw e;
  }

  const generations = new Map();
  const mainChain = [];
  const mainChainMothers = [];
  const mothersMap = new Map(); // personHash => {hash, ver}
  generations.set(1, [{ hash: rootHash, ver: rootVer, name: "Root", generation: 1 }]);
  mainChain.push(generations.get(1)[0]);

  // Create a mother (spouse) for the root to test mother version references
  async function createMotherFor(node) {
    if (DISABLE_REWARD_MINT) {
      dlog("DISABLE_REWARD_MINT is true; skip creating mother to avoid token.mint path");
      return null;
    }
    if (mothersMap.has(node.hash)) {
      dlog(`Mother already exists for ${node.name || "Node"}, returning cached`);
      return mothersMap.get(node.hash);
    }

    const motherBasic = basic(
      `MotherOf_${node.name || "Root"}`,
      BASE_YEAR + node.generation,
      2, // Always female
    );

    // Check if this mother already exists in blockchain
    const motherHash = await getPersonHashFromBasicInfo(deepFamily, motherBasic);
    try {
      const existingVersions = await deepFamily.countPersonVersions(motherHash);
      if (existingVersions > 0) {
        dlog(`Mother already exists on-chain with ${existingVersions} versions, reusing`);
        const motherObj = { hash: motherHash, ver: 1, info: motherBasic };
        mothersMap.set(node.hash, motherObj);
        return motherObj;
      }
    } catch (e) {
      dlog(`Mother doesn't exist on-chain, proceeding to create`);
    }

    const txRes = await addPersonVersion({
      deepFamily,
      info: motherBasic,
      tag: tagFor(1),
      cid: `QmMother_${node.name || "Root"}_v1`,
    });

    // If error occurred, don't throw, just continue without mother
    if (txRes.error) {
      console.warn(`Failed to create mother for ${node.name}:`, txRes.error);
      console.warn(`Continuing without mother for ${node.name}`);
      return null;
    }

    const motherObj = { hash: motherHash, ver: 1, info: motherBasic };
    mothersMap.set(node.hash, motherObj);
    return motherObj;
  }
  mainChainMothers.push(await createMotherFor(mainChain[0]));

  async function addChildFull(name, year, fatherNode, generation) {
    dlog("addChildFull begin", { name, year, fatherNodeHash: fatherNode.hash, generation });

    // Check if child with this name already exists
    const info = basic(name, year, (year + name.length) % 2 === 0 ? 1 : 2);
    const childHash = await getPersonHashFromBasicInfo(deepFamily, info);

    // Proactively validate parent version indices on-chain to avoid opaque reverts
    try {
      const fatherCount = await deepFamily.countPersonVersions(fatherNode.hash);
      if (Number(fatherNode.ver) === 0 || Number(fatherNode.ver) > Number(fatherCount)) {
        console.warn(
          `Invalid father reference for ${name}: ver=${fatherNode.ver} > on-chain count=${fatherCount}`,
        );
        return null;
      }
    } catch (e) {
      console.warn(`Failed to query father versions for ${name}:`, e.message || e);
      return null;
    }

    try {
      const existingVersions = await deepFamily.countPersonVersions(childHash);
      if (existingVersions > 0) {
        dlog(`Child ${name} already exists with ${existingVersions} versions, reusing`);
        return { hash: childHash, ver: 1, info, generation, name: info.fullName };
      }
    } catch (e) {
      dlog(`Child ${name} doesn't exist, proceeding to create`);
    }

    // 50% chance reference mother (if exists) unless reward mint disabled
    let mother = DISABLE_REWARD_MINT ? null : mothersMap.get(fatherNode.hash);
    if (!DISABLE_REWARD_MINT && !mother && (fatherNode === mainChain[mainChain.length - 1] || rand() < 0.5)) {
      try {
        mother = await createMotherFor(fatherNode);
      } catch (e) {
        console.warn(`Failed to create mother for ${fatherNode.name}, continuing without mother`);
        mother = null;
      }
    }

    const motherHash = mother ? mother.hash : ethers.ZeroHash;
    let motherVer = mother ? mother.ver : 0;

    // If a mother is referenced, validate her version too
    if (mother) {
      try {
        const motherCount = await deepFamily.countPersonVersions(motherHash);
        if (Number(motherVer) === 0 || Number(motherVer) > Number(motherCount)) {
          console.warn(
            `Invalid mother reference for ${name}: ver=${motherVer} > on-chain count=${motherCount}`,
          );
          // Continue without mother to avoid revert
          motherVer = 0;
        }
      } catch (e) {
        console.warn(`Failed to query mother versions for ${name}:`, e.message || e);
      }
    }

    const txRes = await addPersonVersion({
      deepFamily,
      info,
      fatherHash: fatherNode.hash,
      fatherVersionIndex: fatherNode.ver,
      motherHash,
      motherVersionIndex: motherVer,
      tag: tagFor(1),
      cid: "QmSeedLarge_v1",
    });

    if (txRes.skipped) {
      dlog("addChildFull skipped (already exists)", { name, personHash: txRes.personHash });
    } else if (txRes.error) {
      console.warn(`addChildFull failed for ${name}:`, txRes.error);
      console.warn(`Continuing with next child...`);
      return null; // Return null instead of throwing
    } else {
      dlog("addChildFull added", { name, personHash: txRes.personHash });
    }

    return { hash: childHash, ver: 1, info, generation, name: info.fullName };
  }

  for (let gen = 2; gen <= TARGET_DEPTH; gen++) {
    dlog("generation loop", gen);
    const prevGenNodes = generations.get(gen - 1); // FIX: was missing causing ReferenceError
    if (!prevGenNodes || prevGenNodes.length === 0) {
      console.warn(`Previous generation (${gen - 1}) empty - cannot build gen ${gen}, stopping`);
      break;
    }

    // Create main chain node
    const chainParent = mainChain[mainChain.length - 1];
    const chainNode = await addChildFull(`MainG${gen}`, BASE_YEAR + gen, chainParent, gen);

    if (!chainNode) {
      console.warn(`Failed to create main chain node for generation ${gen}, stopping`);
      break;
    }

    dlog("main chain node added", { gen, hash: chainNode.hash });
    generations.set(gen, [chainNode]);
    mainChain.push(chainNode);

    // Try to create a mother for new main chain node (for next gen / siblings)
    try {
      const motherForChain = await createMotherFor(chainNode);
      if (motherForChain) {
        mainChainMothers.push(motherForChain);
      }
    } catch (e) {
      console.warn(`Failed to create mother for main chain gen ${gen}, continuing`);
    }

    // 2^ expansion: total nodes this generation = 2^(gen-1) => need extra siblings = total - 1
    const totalThisGen = 2 ** (gen - 1);
    const siblingsCount = totalThisGen - 1;
    let actualSiblingsAdded = 0;

    for (let i = 0; i < siblingsCount; i++) {
      const parent = prevGenNodes[Math.floor(rand() * prevGenNodes.length)];
      try {
        const name = `G${gen}N${i}`;
        const year = BASE_YEAR + gen + (i % 5);
        const node = await addChildFull(name, year, parent, gen);
        if (node) {
          generations.get(gen).push(node);
          actualSiblingsAdded++;
        }
      } catch (err) {
        console.warn(`Sibling add failed gen=${gen} i=${i}:`, err.message || err);
      }
    }
    console.log(
      `Generation ${gen}: planned=${totalThisGen}, actual=${1 + actualSiblingsAdded} (main=1, siblings=${actualSiblingsAdded})`,
    );
  }

  // Collect all nodes excluding root (generation=1)
  const allNodes = [];
  for (const [g, arr] of Array.from(generations.entries()).sort((a, b) => a[0] - b[0])) {
    if (g === 1) continue; // skip root
    for (const n of arr) allNodes.push(n);
  }
  console.log(
    `Person generation complete, total nodes = ${allNodes.length} (theoretical=2^${TARGET_DEPTH}-2=${2 ** TARGET_DEPTH - 2})`,
  );

  // Randomly endorse & mint NFTs by ratio
  if (!LARGE_SEED_SKIP_NFT) {
    const TARGET_NFTS = Math.floor(allNodes.length * TARGET_NFT_RATIO);
    console.log(
      `Start random endorsement + minting, target ${TARGET_NFTS}/${allNodes.length} (${Math.round(TARGET_NFT_RATIO * 100)}%)`,
    );
    // Fisher-Yates shuffle copy
    const shuffled = allNodes.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const coreFromInfo = async (b) => {
      // Get fullNameHash for basicInfo
      const fullNameHash = await deepFamily.getFullNameHash(b.fullName);

      return {
        basicInfo: {
          fullNameHash: fullNameHash,
          isBirthBC: b.isBirthBC,
          birthYear: b.birthYear,
          birthMonth: b.birthMonth || 1,
          birthDay: b.birthDay || 1,
          gender: b.gender,
        },
        supplementInfo: {
          fullName: b.fullName, // fullName now goes in supplementInfo
          birthPlace: PLACE,
          isDeathBC: false,
          deathYear: randomDeathYear(b.birthYear),
          deathMonth: 12,
          deathDay: 31,
          deathPlace: PLACE,
          story: LONG_STORY,
        },
      };
    };
    let minted = 0;
    for (let i = 0; i < TARGET_NFTS && i < shuffled.length; i++) {
      const n = shuffled[i];
      try {
        // NEW: Ensure allowance each iteration (reward can appear after earlier generations)
        const signer = (await ethers.getSigners())[0];
        const signerAddr = await signer.getAddress();
        const tokenAddr = await deepFamily.DEEP_FAMILY_TOKEN_CONTRACT();
        const token = await ethers.getContractAt("DeepFamilyToken", tokenAddr);
        const deepFamilyAddr = deepFamily.target || deepFamily.address;
        const recentReward = await token.recentReward();
        const currentAllowance = await token.allowance(signerAddr, deepFamilyAddr);
        if (currentAllowance < recentReward) {
          console.log(
            `Allowance ${currentAllowance.toString()} < recentReward ${recentReward.toString()} -> approving MaxUint256 before endorsement (idx=${i})`,
          );
          const approveLoopTx = await token.approve(deepFamilyAddr, ethers.MaxUint256);
          await approveLoopTx.wait();
          console.log("Loop approve done");
        }
        // If balance insufficient OR still zero allowance somehow, re-run ensure logic
        const balLoop = await token.balanceOf(signerAddr);
        const allowLoop = await token.allowance(signerAddr, deepFamilyAddr);
        if (balLoop < recentReward || allowLoop < recentReward) {
          await ensureEndorsementReady({ deepFamily, rootHash, rootVer, basic, ethers });
        }
        let t1 = await deepFamily.endorseVersion(n.hash, n.ver);
        await t1.wait();
        const core = await coreFromInfo(n.info);
        let t2 = await deepFamily.mintPersonNFT(n.hash, n.ver, `ipfs://seed/${i}`, core);
        await t2.wait();
        minted++;
        if (minted % 10 === 0 || minted === TARGET_NFTS)
          console.log(`Minted ${minted}/${TARGET_NFTS}`);
      } catch (e) {
        console.warn(`NFT mint failed idx=${i}`, e.message?.slice(0, 100) || e.toString());
      }
    }
    console.log(
      `Random NFT mint complete: actual=${minted}/${TARGET_NFTS} (${Math.round((minted / allNodes.length) * 100)}%)`,
    );

    // Add story chunk test data for some NFTs
    await addStoryChunksToNFTs(deepFamily, TARGET_NFTS);
  } else {
    console.log("SKIP_NFT=1 -> skip NFT endorsement & mint phase");
  }

  console.log(
    `Large seed complete: depth=${TARGET_DEPTH}, total nodes=${allNodes.length}, NFT ratio=${TARGET_NFT_RATIO}`,
  );
  console.log("Root person:", rootHash, "v", rootVer);
  // Stop heartbeat so the process can exit cleanly in debug mode
  if (DEBUG_ENABLED && HEARTBEAT) clearInterval(HEARTBEAT);
}

// Unified helper to add person version (contract addPerson)
async function addPersonVersion({
  deepFamily,
  info,
  fatherHash = ethers.ZeroHash,
  fatherVersionIndex = 0,
  motherHash = ethers.ZeroHash,
  motherVersionIndex = 0,
  tag,
  cid,
}) {
  const personHash = await getPersonHashFromBasicInfo(deepFamily, info);

  // Check if this version already exists
  try {
    const versionCount = await deepFamily.countPersonVersions(personHash);
    dlog(`Person ${info.fullName} has ${versionCount} existing versions`);

    // Check if any existing version has the same tag or basic info
    for (let i = 1; i <= versionCount; i++) {
      try {
        const existingVersion = await deepFamily.getVersionDetails(personHash, i);
        // If same tag exists, skip adding
        if (existingVersion.tag === tag) {
          dlog(`Version with tag "${tag}" already exists for ${info.fullName}, skipping`);
          return { personHash, skipped: true, existingVersion: i };
        }
      } catch (e) {
        // Version might not exist, continue checking
      }
    }
  } catch (e) {
    // Person doesn't exist yet, proceed with adding
    dlog(`Person ${info.fullName} doesn't exist yet, proceeding to add`);
  }

  try {
    const tx = await deepFamily.addPerson(
      personHash,
      fatherHash,
      motherHash,
      fatherVersionIndex,
      motherVersionIndex,
      tag,
      cid,
    );
    await tx.wait();
    dlog(`Successfully added person ${info.fullName} with tag "${tag}"`);
    return { personHash, added: true };
  } catch (error) {
    console.warn(`Failed to add person ${info.fullName}:`, error.message?.slice(0, 100));
    // If it looks like a sticky duplicate (possible from prior partial tx), try once with a unique CID
    try {
      const existingCount = await deepFamily.countPersonVersions(personHash);
      if (Number(existingCount) === 0) {
        const uniqueCid = `${cid}_${Date.now()}`;
        console.warn(
          `  Retrying once with unique CID to bypass potential stale DuplicateVersion: ${uniqueCid}`,
        );
        const retryTx = await deepFamily.addPerson(
          personHash,
          fatherHash,
          motherHash,
          fatherVersionIndex,
          motherVersionIndex,
          tag,
          uniqueCid,
        );
        await retryTx.wait();
        dlog(`Retry succeeded for ${info.fullName} with unique CID`);
        return { personHash, added: true };
      }
    } catch (_) {
      // ignore and fall through
    }
    return { personHash, error: error.message };
  }
}

// Add: attach tagFor to globalThis to avoid ReferenceError across environments
function tagFor(v) {
  return makeMaxTag(`_v${v}`);
}
if (typeof globalThis !== "undefined" && typeof globalThis.tagFor === "undefined") {
  globalThis.tagFor = tagFor;
}

main().catch((e) => {
  console.error(e);
  if (DEBUG_ENABLED && HEARTBEAT) clearInterval(HEARTBEAT);
  process.exit(1);
});
