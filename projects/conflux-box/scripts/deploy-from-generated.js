#!/usr/bin/env node
import fs from "fs";
import fetch from "node-fetch";
import path from "path";
import vm from "vm";

// Usage:
// SESSION=<dev-session-id> node scripts/deploy-from-generated.js SimpleStorage evm '["eSpaceSimpleStorage",20]'
// or
// SESSION=<dev-session-id> node scripts/deploy-from-generated.js SimpleStorage core '["CoreSimpleStorage",10]'

const GENERATED = path.resolve(
  process.cwd(),
  "src/data/generatedContractTemplates.ts"
);

function loadGeneratedSync() {
  const content = fs.readFileSync(GENERATED, "utf8");
  // Strip the "export const generatedContractTemplates =" prefix and the trailing "as const;"
  const body = content
    .replace(/export const generatedContractTemplates = /, "")
    .replace(/as const;\s*$/, "");
  // Create a JS wrapper that assigns to module.exports
  const wrapped = "module.exports = " + body + ";";
  // Evaluate in a new VM context to avoid polluting global scope
  const script = new vm.Script(wrapped, {
    filename: "generatedContractTemplates.vm.js",
  });
  const context = { module: {}, exports: {} };
  script.runInNewContext(context);
  return context.module.exports;
}

async function main() {
  const [, , contractName, chain = "evm", rawArgs = "[]"] = process.argv;
  if (!contractName) {
    console.error(
      "Usage: SESSION=<sessionId> node scripts/deploy-from-generated.js <ContractName> <chain> <args-json>"
    );
    process.exit(1);
  }
  const session = process.env.SESSION;
  if (!session) {
    console.error(
      "Set SESSION env var to the dev sessionId (Authorization: Bearer <session>)"
    );
    process.exit(1);
  }
  // Load generated templates synchronously
  const generated = loadGeneratedSync();
  const contract = generated[contractName];
  if (!contract) {
    console.error("Contract not found in generated templates:", contractName);
    process.exit(1);
  }
  const abi = contract.abi;
  const bytecode = contract.fullBytecode;
  let args;
  try {
    args = JSON.parse(rawArgs);
  } catch (e) {
    console.error("Invalid args JSON");
    process.exit(1);
  }
  const payload = {
    abi,
    bytecode,
    args,
    accountIndex: 0,
    chain: chain,
  };
  console.log("Deploying", contractName, "to", chain, "with args", args);
  const res = await fetch("http://localhost:3001/api/devkit/deploy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  console.log("Response:", JSON.stringify(json, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
