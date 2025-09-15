import { defineConfig } from "@wagmi/cli";
import { actions, hardhat } from "@wagmi/cli/plugins";

export default defineConfig(() => {
  return {
    out: "src/generated/contracts.ts",
    contracts: [],
    plugins: [
      hardhat({
        project: "../contract",
        sources: "contracts/",
      }),
      actions(),
    ],
  };
});
