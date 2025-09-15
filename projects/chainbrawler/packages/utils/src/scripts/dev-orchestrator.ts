#!/usr/bin/env tsx
/*
 * Copyright 2025 ChainBrawler Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Development Orchestrator CLI
 *
 * Simple CLI wrapper around the DevelopmentOrchestrator from @chainbrawler/utils
 */

// Set up logging environment for dev orchestrator
if (!process.env.LOG_LEVEL) {
  process.env.LOG_LEVEL = "info";
}
if (!process.env.LOG_MODE) {
  process.env.LOG_MODE = "pretty"; // Use pretty console output for dev orchestrator
}

import {
  DevelopmentOrchestrator,
  type OrchestratorOptions,
} from "../orchestrator/DevelopmentOrchestrator";

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  const options: OrchestratorOptions = {
    skipDeploy: args.includes("--skip-deploy"),
    skipSdkGeneration: args.includes("--skip-sdk"),
    keepNodeRunning: args.includes("--keep-running") || args.includes("--daemon"),
    verbose: args.includes("--verbose") || args.includes("-v"),
  };

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
ChainBrawler Development Orchestrator

Usage: chainbrawler-dev [options]

Options:
  --skip-deploy        Skip contract deployment
  --skip-sdk           Skip SDK generation
  --keep-running       Keep node running after completion
  --daemon             Alias for --keep-running
  --verbose, -v        Enable verbose logging
  --help, -h           Show this help message

Examples:
  chainbrawler-dev                    # Start full development environment
  chainbrawler-dev --skip-deploy      # Skip deployment, use existing contracts
  chainbrawler-dev --keep-running     # Keep node running for manual testing
  chainbrawler-dev --verbose          # Enable detailed logging
`);
    process.exit(0);
  }

  try {
    const orchestrator = new DevelopmentOrchestrator(options);
    const result = await orchestrator.start();

    console.log("\n🎉 Development environment ready!");
    console.log(`📡 Node running on chain ${result.chainId}`);
    console.log(`🔗 HTTP RPC: http://127.0.0.1:8545`);
    console.log(`🔗 WebSocket RPC: ws://127.0.0.1:8546`);

    if (Object.keys(result.deployedAddresses).length > 0) {
      console.log("\n📦 Deployed contracts:");
      Object.entries(result.deployedAddresses).forEach(([name, address]) => {
        console.log(`  ${name}: ${address}`);
      });
    }

    if (options.keepNodeRunning) {
      console.log("\n🔄 Node will keep running. Press Ctrl+C to stop.");

      // Handle graceful shutdown
      process.on("SIGINT", async () => {
        console.log("\n🛑 Shutting down...");
        await orchestrator.stop();
        process.exit(0);
      });

      // Keep the process alive
      await new Promise(() => {});
    } else {
      console.log("\n✅ Development environment completed successfully");
      await orchestrator.stop();
    }
  } catch (error) {
    console.error("❌ Development orchestrator failed:", error);
    process.exit(1);
  }
}

// Run the CLI
main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
