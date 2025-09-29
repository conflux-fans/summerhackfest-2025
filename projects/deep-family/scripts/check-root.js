const hre = require("hardhat");
const path = require("path");
const { computePoseidonDigest } = require(path.join(__dirname, "../lib/namePoseidon"));

function prepareBasicInfo(basicInfo) {
  const digest = computePoseidonDigest(basicInfo.fullName, basicInfo.passphrase || "");
  return {
    fullNameCommitment: digest.digestHex,
    isBirthBC: Boolean(basicInfo.isBirthBC),
    birthYear: Number(basicInfo.birthYear ?? 0),
    birthMonth: Number(basicInfo.birthMonth ?? 0),
    birthDay: Number(basicInfo.birthDay ?? 0),
    gender: Number(basicInfo.gender ?? 0),
  };
}

// Helper: call getPersonHash with precomputed Poseidon-based hash
async function getPersonHashFromBasicInfo(deepFamily, basicInfo) {
  const prepared = prepareBasicInfo(basicInfo);
  return await deepFamily.getPersonHash(prepared);
}

async function main() {
  const { deployments, ethers } = hre;
  const { get } = deployments;
  let dep;
  try {
    dep = await get("DeepFamily");
  } catch {
    await deployments.fixture(["Integrated"]);
    dep = await get("DeepFamily");
  }
  // Fetch other related deployments as well
  const depToken = await get("DeepFamilyToken");
  const depVerifier = await get("PersonHashVerifier");
  const depNameVerifier = await get("NamePoseidonVerifier");

  // Log addresses for three contracts
  console.log("DeepFamily contract:", dep.address);
  console.log("DeepFamilyToken contract:", depToken.address);
  console.log("PersonHashVerifier contract:", depVerifier.address);
  console.log("NamePoseidonVerifier contract:", depNameVerifier.address);

  const ft = await ethers.getContractAt("DeepFamily", dep.address);

  const demo = {
    fullName: "DemoRoot",
    isBirthBC: false,
    birthYear: 1970,
    birthMonth: 1,
    birthDay: 1,
    gender: 1,
    birthPlace: "US-CA-Los Angeles",
    passphrase: "",
  };
  const demoHash = await getPersonHashFromBasicInfo(ft, demo);
  console.log("DemoRoot hash:", demoHash);
  try {
    await ft.getVersionDetails(demoHash, 1);
    console.log("DemoRoot v1 exists:", true);
  } catch {
    console.log("DemoRoot v1 exists:", false);
  }

  try {
    const res = await ft.listChildren(demoHash, 1, 0, 0);
    const total = res[2];
    console.log("DemoRoot children total:", total.toString());
  } catch (e) {
    console.log("listChildren failed:", e.message || e);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
