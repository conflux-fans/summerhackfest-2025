const { task } = require("hardhat/config");

// Fee is paid in DeepFamilyToken equal to recentReward(), requiring ERC20 allowance

task("endorse", "Endorse a person version (uses DeepFamilyToken recentReward as fee)")
  .addParam("person", "Person hash (bytes32)")
  .addParam("vindex", "Version index (starting from 1)")
  .addOptionalParam("autoapprove", "If set to true, auto approve required token allowance", "true")
  .addOptionalParam("approvebuffer", "Extra allowance multiplier (e.g. 2 = approve 2x fee)", "1")
  .setAction(async (args, hre) => {
    const { deployments, ethers } = hre;
    const { get } = deployments;
    const signer = (await ethers.getSigners())[0];

    // Ensure deployment exists
    let deepDeployment, tokenDeployment;
    try {
      deepDeployment = await get("DeepFamily");
      tokenDeployment = await get("DeepFamilyToken");
    } catch {
      await deployments.fixture(["Integrated"]);
      deepDeployment = await get("DeepFamily");
      tokenDeployment = await get("DeepFamilyToken");
    }

    const deepFamily = await ethers.getContractAt("DeepFamily", deepDeployment.address, signer);
    const token = await ethers.getContractAt("DeepFamilyToken", tokenDeployment.address, signer);

    const versionIndex = Number(args.vindex);
    if (!Number.isInteger(versionIndex) || versionIndex <= 0) {
      throw new Error("vindex must be a positive integer starting from 1");
    }

    // Existence / bounds check (prevents confusing InvalidVersionIndex revert on fresh network)
    const totalVersions = Number(await deepFamily.countPersonVersions(args.person));
    if (versionIndex > totalVersions) {
      throw new Error(
        `Version index ${versionIndex} out of range (total=${totalVersions}). Did you add the person on this network / use --network localhost?`,
      );
    }

    // Read current fee (recentReward)
    let fee = await token.recentReward();
    fee = BigInt(fee);

    // Handle allowance if fee > 0
    if (fee > 0n) {
      const allowance = await token.allowance(signer.address, deepDeployment.address);
      if (allowance < fee) {
        if (String(args.autoapprove).toLowerCase() === "true") {
          const multiplier = BigInt(Number(args.approvebuffer) || 1);
          const approveAmount = fee * multiplier;
          const approveTx = await token.approve(deepDeployment.address, approveAmount);
          await approveTx.wait();
        } else {
          throw new Error(
            `Insufficient allowance (${allowance}) < fee (${fee}). Re-run with --autoapprove true or manually approve.`,
          );
        }
      }
    }

    // Call endorseVersion
    const tx = await deepFamily.endorseVersion(args.person, versionIndex);
    const receipt = await tx.wait();

    // Decode PersonVersionEndorsed event
    try {
      const iface = new ethers.Interface([
        "event PersonVersionEndorsed(bytes32 indexed personHash, address indexed endorser, uint256 versionIndex, uint256 endorsementFee, uint256 timestamp)",
      ]);
      const deepAddr = deepDeployment.address.toLowerCase();
      for (const log of receipt.logs || []) {
        if ((log.address || "").toLowerCase() !== deepAddr) continue;
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === "PersonVersionEndorsed") {
            break;
          }
        } catch (_) {
          /* ignore individual log parse errors */
        }
      }
    } catch (e) {}
  });
