const { task } = require("hardhat/config");

task("networks:check", "Check connectivity for networks in hardhat.config.js")
  .addOptionalParam("delay", "Delay between requests ms", "800")
  .addOptionalParam("only", "Only check these networks, comma separated", "")
  .addOptionalParam("exclude", "Exclude these networks, comma separated", "")
  .addFlag("includeMissing", "Include networks missing credentials/URL")
  .setAction(async (args, hre) => {
    const { ethers, config } = hre;

    // Generate candidate networks
    let names = Object.keys(config.networks).filter((n) => n !== "hardhat");

    // Parse only/exclude
    const onlySet = new Set(
      (args.only || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    const excludeSet = new Set(
      (args.exclude || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );

    if (onlySet.size > 0) {
      names = names.filter((n) => onlySet.has(n));
    }
    if (excludeSet.size > 0) {
      names = names.filter((n) => !excludeSet.has(n));
    }
    const results = {};

    console.log("🔍 Checking network connectivity...\n");

    for (const name of names) {
      console.log(`\nChecking: ${name}`);

      try {
        const netCfg = config.networks[name] || {};
        const url = netCfg.url;

        // If missing URL, skip unless includeMissing
        if (!url || typeof url !== "string") {
          if (!args.includeMissing) {
            console.log("  ⚠️ Skipped: invalid RPC URL (use --include-missing to force check)");
            continue;
          }
          throw new Error("Invalid RPC URL configured");
        }

        // If Infura and missing INFURA_API_KEY, skip unless includeMissing
        if (url.includes("infura.io/v3/") && !process.env.INFURA_API_KEY && !args.includeMissing) {
          console.log(
            "  ⚠️ Skipped: missing INFURA_API_KEY (use --include-missing to force check)",
          );
          continue;
        }

        const provider = new ethers.JsonRpcProvider(url);
        const network = await provider.getNetwork();
        console.log(`  - Chain ID: ${network.chainId}`);

        const start = Date.now();
        const blockNumber = await provider.getBlockNumber();
        const rt = Date.now() - start;
        console.log(`  - Latest block: ${blockNumber}`);
        console.log(`  - Response time: ${rt}ms`);

        // Optional: output balance if PRIVATE_KEY provided
        try {
          const pk = process.env.PRIVATE_KEY;
          if (pk && /^0x[0-9a-fA-F]{64}$/.test(pk)) {
            const wallet = new ethers.Wallet(pk, provider);
            const bal = await provider.getBalance(wallet.address);
            console.log(`  - Deployer: ${wallet.address}`);
            console.log(`  - Balance: ${ethers.formatEther(bal)} ETH`);
          }
        } catch {}

        console.log(`  ✅ ${name} reachable`);
        results[name] = true;
      } catch (e) {
        console.log(`  ❌ ${name} failed: ${e.message}`);
        results[name] = false;
      }

      await new Promise((r) => setTimeout(r, parseInt(args.delay)));
    }

    const ok = Object.values(results).filter(Boolean).length;
    console.log("\n" + "=".repeat(50));
    console.log("📊 Summary:");
    console.log("=".repeat(50));
    console.log(`Total checked: ${names.length}`);
    console.log(`Success: ${ok}`);
    console.log(`Failed: ${names.length - ok}`);
  });
