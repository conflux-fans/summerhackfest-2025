#!/usr/bin/env node

const https = require("https");
const http = require("http");

console.log("🔍 Testing Icon Imports...\n");

// Test the main application
const testUrl = "http://localhost:3000";

const options = {
  method: "GET",
  timeout: 5000,
};

const req = http.request(testUrl, options, (res) => {
  console.log(`✅ Main app accessible (${res.statusCode})`);

  // Check for any error patterns in the response
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    // Look for icon-related errors
    const iconErrors = data.match(/Icon[A-Z][a-zA-Z]*/g);
    if (iconErrors) {
      console.log("📋 Icons found in HTML:", [...new Set(iconErrors)].join(", "));
    }

    // Check for JavaScript errors
    const jsErrors = data.match(/error|Error|ERROR/g);
    if (jsErrors) {
      console.log(`⚠️  Found ${jsErrors.length} potential error references in HTML`);
    } else {
      console.log("✅ No obvious error patterns found in HTML");
    }

    console.log("\n🎯 Icon import test completed!");
    console.log("💡 Check the browser console at http://localhost:3000 for runtime errors");
  });
});

req.on("error", (err) => {
  console.error("❌ Error testing main app:", err.message);
});

req.on("timeout", () => {
  console.error("⏰ Request timed out");
  req.destroy();
});

req.end();
