import hre from "hardhat";

// Viem-first minimal test helpers

export async function getSigners() {
  if (!hre?.viem || typeof hre.viem.getWalletClients !== "function") {
    throw new Error("Viem plugin not available on hre.viem.getWalletClients");
  }
  const walletClients = await hre.viem.getWalletClients();
  return walletClients.map((client: any) => ({
    address: client.account.address,
    account: client.account,
  }));
}

export async function deployArtifact(deployer: any, artifactName: any, args: any[] = []) {
  if (!hre?.viem || typeof hre.viem.deployContract !== "function") {
    throw new Error("Viem deployContract not available on hre.viem");
  }

  const name =
    typeof artifactName === "string"
      ? artifactName
      : artifactName && (artifactName as any).contractName
        ? (artifactName as any).contractName
        : String(artifactName);

  // Check if contract needs CombatEngineLib linking
  const needsLibraryLinking = ["ChainBrawlerClean", "ChainBrawlerTestHelpersForTests"].includes(
    name
  );

  let contract: any;
  if (needsLibraryLinking) {
    // First deploy the CombatEngineLib library
    const combatEngineLib = await hre.viem.deployContract("CombatEngineLib");

    // Deploy the contract with library linking
    contract = await hre.viem.deployContract(name, args || [], {
      libraries: {
        "contracts/libraries/CombatEngineLib.sol:CombatEngineLib": combatEngineLib.address,
      },
    });
  } else {
    contract = await hre.viem.deployContract(name, args || []);
  }

  return {
    address: contract.address || contract?.target,
    read: new Proxy(
      {},
      {
        get: (_, prop: string) => {
          return async (args: any[] = []) => {
            if (!contract.read || typeof (contract.read as any)[prop] !== "function")
              throw new Error(`read.${String(prop)} not available on viem contract`);
            return await (contract.read as any)[prop](args || []);
          };
        },
      }
    ),
    write: new Proxy(
      {},
      {
        get: (_, prop: string) => {
          return async (args: any[] = [], options: any = {}) => {
            if (!contract.write || typeof (contract.write as any)[prop] !== "function")
              throw new Error(`write.${String(prop)} not available on viem contract`);
            const res = await (contract.write as any)[prop](args || [], options || {});
            // If Viem returns a tx hash (string) or an object with hash/transactionHash, wait for receipt
            try {
              let txHash: string | undefined;
              if (typeof res === "string") txHash = res;
              else if (res && typeof res === "object")
                txHash = res.transactionHash || res.hash || res.txHash || res.tx?.hash;

              // Try canonical getter first, then fallback to property
              const publicClient = (hre as any)?.viem?.getPublicClient
                ? await (hre as any).viem.getPublicClient()
                : (hre as any).viem?.publicClient;
              if (
                txHash &&
                publicClient &&
                typeof publicClient.waitForTransactionReceipt === "function"
              ) {
                await publicClient.waitForTransactionReceipt({ hash: txHash });
              } else if (
                txHash &&
                typeof (contract as any).waitForTransactionReceipt === "function"
              ) {
                // fallback: some wrappers expose wait helper
                await (contract as any).waitForTransactionReceipt(txHash);
              }
            } catch (e) {
              // ignore waiting errors but still return res
            }
            return res;
          };
        },
      }
    ),
  };
}
