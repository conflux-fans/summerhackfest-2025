const hre = require("hardhat");

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

  // Log addresses for three contracts
  console.log("DeepFamily contract:", dep.address);
  console.log("DeepFamilyToken contract:", depToken.address);
  console.log("PersonHashVerifier contract:", depVerifier.address);

  const ft = await ethers.getContractAt("DeepFamily", dep.address);

  const demo = {
    fullName: "DemoRoot",
    isBirthBC: false,
    birthYear: 1970,
    birthMonth: 1,
    birthDay: 1,
    gender: 1,
    birthPlace: "US-CA-Los Angeles",
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
