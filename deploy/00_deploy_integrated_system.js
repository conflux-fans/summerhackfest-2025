// SPDX-License-Identifier: MIT
// Deploy the integrated DeepFamily system (DeepFamilyToken + DeepFamily) with hardhat-deploy

const func = async ({ getNamedAccounts, deployments, ethers, network }) => {
  const { deploy, log, save } = deployments;
  const { deployer } = await getNamedAccounts();

  log(`Deployment account: ${deployer}`);
  log(`Current network: ${network.name}`);

  // 1) Deploy DeepFamilyToken
  const tokenDeployment = await deploy("DeepFamilyToken", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.live ? 2 : 1,
  });

  // 2) Deploy DeepFamily with the DeepFamilyToken address and fake verifier address
  // Using a fake non-zero verifier address for testing purposes
  const fakeVerifierAddress = "0x1111111111111111111111111111111111111111";
  const deepFamilyDeployment = await deploy("DeepFamily", {
    from: deployer,
    args: [tokenDeployment.address, fakeVerifierAddress],
    log: true,
    waitConfirmations: network.live ? 2 : 1,
  });

  // 3) Initialize the DeepFamilyToken contract (set DeepFamily address)
  const deepFamilyToken = await ethers.getContractAt("DeepFamilyToken", tokenDeployment.address);
  const initialized = (await deepFamilyToken.totalAdditions()) !== undefined; // Read-only to avoid call revert
  // initialize can be called only once; read deepFamilyContract and initialize if zero address
  let needInit = true;
  try {
    const bound = await deepFamilyToken.deepFamilyContract();
    needInit = bound === ethers.ZeroAddress;
  } catch (_) {
    needInit = true;
  }
  if (needInit) {
    const tx = await deepFamilyToken.initialize(deepFamilyDeployment.address);
    await tx.wait();
    log("DeepFamilyToken initialized");
  }

  log("Deployment finished");
};

module.exports = func;
module.exports.tags = ["DeepFamily", "DeepFamilyToken", "Integrated"];
