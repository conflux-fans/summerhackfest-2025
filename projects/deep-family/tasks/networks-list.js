const { task } = require("hardhat/config");

task("networks:list", "List available networks and common command hints").setAction(
  async (_, hre) => {
    const all = Object.entries(hre.config.networks).map(([name, conf]) => ({
      name,
      chainId: conf.chainId,
    }));

    console.log("🌐 DeepFamily supported blockchain networks\n");
    console.log("-".repeat(60));
    for (const n of all) {
      console.log(`${String(n.name).padEnd(20)} | Chain ID: ${String(n.chainId || "-")}`);
    }

    console.log("\n🚀 Deployment command examples:");
    console.log("-".repeat(60));
    for (const n of all) {
      if (n.name !== "localhost") {
        const scriptName = n.name.replace(/([A-Z])/g, "-$1").toLowerCase();
        console.log(`npm run deploy:${scriptName}`);
      }
    }

    console.log("\n🔍 Verification command examples:");
    console.log("-".repeat(60));
    for (const n of all) {
      if (n.name !== "localhost") {
        const scriptName = n.name.replace(/([A-Z])/g, "-$1").toLowerCase();
        console.log(`npm run verify:${scriptName}`);
      }
    }
  },
);
