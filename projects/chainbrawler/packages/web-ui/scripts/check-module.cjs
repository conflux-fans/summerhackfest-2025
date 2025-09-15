#!/usr/bin/env node

const http = require("http");
const fs = require("fs");
const path = require("path");

async function checkModule() {
  console.log("🔍 Checking module exports...");

  // Check if the dev server is running
  const checkServer = () => {
    return new Promise((resolve, reject) => {
      const req = http.get("http://localhost:3000", (res) => {
        resolve(res.statusCode === 200);
      });
      req.on("error", () => resolve(false));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(false);
      });
    });
  };

  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error("❌ Dev server is not running. Please start it with: pnpm dev");
    process.exit(1);
  }

  console.log("✅ Dev server is running");

  // Check the react-ui module directly
  const checkReactUIModule = () => {
    return new Promise((resolve, reject) => {
      const req = http.get(
        "http://localhost:3000/@fs/workspaces/chainbrawler_dev/packages/react-ui/dist/index.js",
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            resolve({
              status: res.statusCode,
              content: data,
              headers: res.headers,
            });
          });
        }
      );
      req.on("error", reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error("Timeout"));
      });
    });
  };

  try {
    console.log("📦 Checking react-ui module...");
    const moduleResult = await checkReactUIModule();

    console.log(`Status: ${moduleResult.status}`);
    console.log(`Content-Type: ${moduleResult.headers["content-type"]}`);
    console.log(`Content-Length: ${moduleResult.content.length}`);

    // Check for formatDamage export
    const hasFormatDamage = moduleResult.content.includes("formatDamage");
    const hasExports = moduleResult.content.includes("exports");
    const hasFormatDamageExport = moduleResult.content.includes("exports.formatDamage");

    console.log("\n📋 Export Analysis:");
    console.log("==================");
    console.log(`Contains 'formatDamage': ${hasFormatDamage}`);
    console.log(`Contains 'exports': ${hasExports}`);
    console.log(`Contains 'exports.formatDamage': ${hasFormatDamageExport}`);

    if (hasFormatDamage) {
      // Find the formatDamage function definition
      const formatDamageMatch = moduleResult.content.match(
        /function formatDamage\([^)]*\)[^{]*\{[^}]*\}/g
      );
      if (formatDamageMatch) {
        console.log("\n🔍 formatDamage function found:");
        console.log(formatDamageMatch[0].substring(0, 200) + "...");
      }
    }

    if (hasExports) {
      // Find export statements
      const exportMatches = moduleResult.content.match(/exports\.\w+\s*=/g);
      if (exportMatches) {
        console.log("\n📤 Exports found:");
        exportMatches.forEach((exportMatch) => {
          console.log(`  ${exportMatch.trim()}`);
        });
      }
    }

    // Check for the specific error pattern
    const errorPattern = /The requested module.*does not provide an export named 'formatDamage'/;
    const hasErrorPattern = errorPattern.test(moduleResult.content);
    console.log(`\n❌ Contains error pattern: ${hasErrorPattern}`);

    // Save the module content for inspection
    const outputPath = path.join(__dirname, "../module-content.js");
    fs.writeFileSync(outputPath, moduleResult.content);
    console.log(`\n💾 Module content saved to: ${outputPath}`);
  } catch (error) {
    console.error("❌ Error checking module:", error.message);
  }

  // Also check the built file directly
  const builtFilePath = "/workspaces/chainbrawler_dev/packages/react-ui/dist/index.js";
  if (fs.existsSync(builtFilePath)) {
    console.log("\n📁 Checking built file directly...");
    const builtContent = fs.readFileSync(builtFilePath, "utf8");

    const hasFormatDamageBuilt = builtContent.includes("formatDamage");
    const hasExportsBuilt = builtContent.includes("exports");
    const hasFormatDamageExportBuilt = builtContent.includes("exports.formatDamage");

    console.log("Built file analysis:");
    console.log(`Contains 'formatDamage': ${hasFormatDamageBuilt}`);
    console.log(`Contains 'exports': ${hasExportsBuilt}`);
    console.log(`Contains 'exports.formatDamage': ${hasFormatDamageExportBuilt}`);

    if (hasFormatDamageExportBuilt) {
      console.log("✅ formatDamage is properly exported in built file");
    } else {
      console.log("❌ formatDamage is NOT exported in built file");

      // Find what exports are actually there
      const exportMatches = builtContent.match(/exports\.\w+\s*=/g);
      if (exportMatches) {
        console.log("Available exports:");
        exportMatches.forEach((exportMatch) => {
          console.log(`  ${exportMatch.trim()}`);
        });
      }
    }
  } else {
    console.log("❌ Built file not found at:", builtFilePath);
  }
}

checkModule().catch(console.error);
