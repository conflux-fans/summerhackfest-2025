const { task } = require("hardhat/config");

// mintPersonNFT(personHash, versionIndex, tokenURI, PersonCoreInfo { basicInfo, supplementInfo })
// No ETH fee; must have endorsed the version first.

task("mint-nft", "Mint NFT for a person version (requires prior endorsement)")
  .addParam("person", "Person hash (bytes32)")
  .addParam("vindex", "Version index (starting from 1)")
  .addParam("tokenuri", "NFT metadata URI (e.g. ipfs://CID)")
  .addParam("fullname", "Full name (must match original person hash)")
  .addParam("birthyear", "Birth year (0=unknown)")
  .addOptionalParam("birthbc", "Is birth BC (true/false)", "false")
  .addOptionalParam("birthmonth", "Birth month (1-12, 0=unknown)", "0")
  .addOptionalParam("birthday", "Birth day (1-31, 0=unknown)", "0")
  .addParam("gender", "Gender (0=Unknown,1=Male,2=Female,3=Other)")
  .addParam("birthplace", "Birth place (string, can be empty)")
  .addOptionalParam("deathbc", "Is death BC (true/false)", "false")
  .addOptionalParam("deathyear", "Death year (0=unknown)", "0")
  .addOptionalParam("deathmonth", "Death month (1-12, 0=unknown)", "0")
  .addOptionalParam("deathday", "Death day (1-31, 0=unknown)", "0")
  .addOptionalParam("deathplace", "Death place", "")
  .addOptionalParam("story", "Short life story (<=256 chars)", "")
  .setAction(async (args, hre) => {
    const { deployments, ethers } = hre;
    const { get } = deployments;
    const signer = (await ethers.getSigners())[0];

    // Ensure deployment exists (persistent network recommended: hardhat node + --network localhost)
    let deepDeployment;
    try {
      deepDeployment = await get("DeepFamily");
    } catch {
      await deployments.fixture(["Integrated"]);
      deepDeployment = await get("DeepFamily");
    }

    const deepFamily = await ethers.getContractAt("DeepFamily", deepDeployment.address, signer);

    const versionIndex = Number(args.vindex);
    if (!Number.isInteger(versionIndex) || versionIndex <= 0) {
      throw new Error("vindex must be a positive integer starting from 1");
    }

    // Validate numeric ranges
    const birthYear = Number(args.birthyear);
    const birthMonth = Number(args.birthmonth);
    const birthDay = Number(args.birthday);
    const gender = Number(args.gender);
    const deathYear = Number(args.deathyear);
    const deathMonth = Number(args.deathmonth);
    const deathDay = Number(args.deathday);

    if (birthYear < 0 || birthYear > 65535) throw new Error("birthYear out of uint16 range");
    if (birthMonth < 0 || birthMonth > 12) throw new Error("birthMonth must be 0-12");
    if (birthDay < 0 || birthDay > 31) throw new Error("birthDay must be 0-31");
    if (gender < 0 || gender > 3) throw new Error("gender must be 0-3");
    if (deathYear < 0 || deathYear > 65535) throw new Error("deathYear out of uint16 range");
    if (deathMonth < 0 || deathMonth > 12) throw new Error("deathMonth must be 0-12");
    if (deathDay < 0 || deathDay > 31) throw new Error("deathDay must be 0-31");

    // Check version existence
    const totalVersions = Number(await deepFamily.countPersonVersions(args.person));
    console.log("Total versions for person:", totalVersions);
    if (versionIndex > totalVersions) {
      throw new Error(`Version index ${versionIndex} out of range (total=${totalVersions}).`);
    }

    // Check endorsement requirement
    const endorsed = Number(await deepFamily.endorsedVersionIndex(args.person, signer.address));
    if (endorsed !== versionIndex) {
      throw new Error(
        `You must endorse this version first (current endorsed index=${endorsed || 0}). Run: npx hardhat endorse --person ${args.person} --vindex ${versionIndex} --network <net>`,
      );
    }

    // Get fullNameHash first
    const fullNameHash = await deepFamily.getFullNameHash(args.fullname);

    // Construct nested core info
    const basicInfo = {
      fullNameHash: fullNameHash,
      isBirthBC: String(args.birthbc).toLowerCase() === "true",
      birthYear,
      birthMonth,
      birthDay,
      gender,
    };

    // Recompute hash to sanity check user input matches person hash
    const computedHash = await deepFamily.getPersonHash(basicInfo);
    if (computedHash.toLowerCase() !== args.person.toLowerCase()) {
      throw new Error(
        `Provided --person hash does not match computed hash (${computedHash}). Check fullname/birth data.`,
      );
    }

    const supplementInfo = {
      fullName: args.fullname,
      birthPlace: args.birthplace,
      isDeathBC: String(args.deathbc).toLowerCase() === "true",
      deathYear,
      deathMonth,
      deathDay,
      deathPlace: args.deathplace,
      story: args.story,
    };

    const coreInfo = { basicInfo, supplementInfo };

    console.log("DeepFamily contract:", deepDeployment.address);
    console.log("Minting NFT with tokenURI:", args.tokenuri);

    const tx = await deepFamily.mintPersonNFT(args.person, versionIndex, args.tokenuri, coreInfo);
    console.log("Submitted mint tx:", tx.hash);
    const receipt = await tx.wait();
    console.log("NFT minted in block:", receipt.blockNumber);

    // Optionally parse PersonNFTMinted event
    try {
      const iface = new ethers.Interface([
        "event PersonNFTMinted(bytes32 indexed personHash, uint256 indexed tokenId, address indexed owner, uint256 versionIndex, string tokenURI, uint256 timestamp)",
      ]);
      const deepAddr = deepDeployment.address.toLowerCase();
      for (const log of receipt.logs || []) {
        if ((log.address || "").toLowerCase() !== deepAddr) continue;
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === "PersonNFTMinted") {
            console.log("Minted tokenId:", parsed.args.tokenId.toString());
            console.log("Event versionIndex:", parsed.args.versionIndex.toString());
            console.log("Stored tokenURI:", parsed.args.tokenURI);
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
