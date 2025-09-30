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

  // 2) Deploy PoseidonT4 library first
  const poseidonT4Deployment = await deploy("PoseidonT4", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.live ? 2 : 1,
  });

  log(`PoseidonT4 library deployed at: ${poseidonT4Deployment.address}`);

  // 3) Deploy PersonHashVerifier (ZK proof verifier contract)
  const verifierDeployment = await deploy("PersonHashVerifier", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.live ? 2 : 1,
  });

  log(`PersonHashVerifier deployed at: ${verifierDeployment.address}`);

  // 4) Deploy NamePoseidonVerifier (placeholder; replace with generated verifier in production)
  const nameVerifierDeployment = await deploy("NamePoseidonVerifier", {
    contract: "NamePoseidonVerifier",
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.live ? 2 : 1,
  });

  log(`NamePoseidonVerifier deployed at: ${nameVerifierDeployment.address}`);

  // 5) Deploy DeepFamily with PoseidonT4 library linked
  const deepFamilyDeployment = await deploy("DeepFamily", {
    from: deployer,
    args: [tokenDeployment.address, verifierDeployment.address, nameVerifierDeployment.address],
    libraries: {
      PoseidonT4: poseidonT4Deployment.address,
    },
    log: true,
    waitConfirmations: network.live ? 2 : 1,
  });

  // 6) Initialize the DeepFamilyToken contract (set DeepFamily address)
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
module.exports.tags = [
  "DeepFamily",
  "DeepFamilyToken",
  "PersonHashVerifier",
  "PoseidonT4",
  "Integrated",
];
