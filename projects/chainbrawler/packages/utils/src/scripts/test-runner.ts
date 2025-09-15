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
 * Test Runner CLI
 *
 * Simple CLI wrapper around the TestRunner from @chainbrawler/utils
 */

import { type TestOptions, TestRunner } from "../testing/TestRunner";

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  const options: TestOptions = {
    skipContractTests: args.includes("--skip-contract"),
    skipSdkTests: args.includes("--skip-sdk"),
    skipExamplesTests: args.includes("--skip-examples"),
    verbose: args.includes("--verbose") || args.includes("-v"),
    keepNodeRunning: args.includes("--keep-running"),
    ciMode: process.env.CI === "true" || args.includes("--ci"),
  };

  // Handle --only flag
  const onlyIndex = args.findIndex((arg) => arg === "--only");
  if (onlyIndex !== -1 && onlyIndex + 1 < args.length) {
    const onlyValue = args[onlyIndex + 1];
    if (["contract", "sdk", "examples"].includes(onlyValue)) {
      options.only = onlyValue as any;
    }
  }

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
ChainBrawler Test Runner

Usage: chainbrawler-test [options]

Options:
  --skip-contract       Skip contract tests
  --skip-sdk           Skip SDK tests
  --skip-examples      Skip example tests
  --only <suite>       Run only specific test suite (contract, sdk, examples)
  --verbose, -v        Enable verbose logging
  --keep-running       Keep node running after tests
  --ci                 Run in CI mode (non-interactive)
  --help, -h           Show this help message

Examples:
  chainbrawler-test                    # Run all tests
  chainbrawler-test --only contract    # Run only contract tests
  chainbrawler-test --skip-sdk         # Skip SDK tests
  chainbrawler-test --verbose          # Enable detailed logging
  chainbrawler-test --ci               # Run in CI mode
`);
    process.exit(0);
  }

  try {
    const testRunner = new TestRunner(options);
    const success = await testRunner.runTests();

    if (success) {
      console.log("\n🎉 All tests passed!");
      process.exit(0);
    } else {
      console.log("\n❌ Some tests failed!");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Test runner failed:", error);
    process.exit(1);
  }
}

// Run the CLI
main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
