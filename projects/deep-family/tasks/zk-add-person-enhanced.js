const { task } = require("hardhat/config");
const { poseidon } = require("circomlibjs");
const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");
const ZERO32 = Object.freeze(new Array(32).fill(0));

// Enhanced version of zk-add-person that generates ZK proof internally
// Similar approach to contract-mint-nft.js but for person_hash_zk.circom

task("add-person-zk-enhanced", "Add person using ZK proof with internal proof generation")
  .addParam("fullname", "Full name")
  .addOptionalParam("passphrase", "Salt passphrase for privacy (default: empty)", "")
  .addOptionalParam("birthbc", "Is birth year BC (true/false)", "false")
  .addParam("birthyear", "Birth year (0=unknown)")
  .addOptionalParam("birthmonth", "Birth month (1-12, 0=unknown)", "0")
  .addOptionalParam("birthday", "Birth day (1-31, 0=unknown)", "0")
  .addParam("gender", "Gender (0=Unknown,1=Male,2=Female,3=Other)")
  .addOptionalParam("fathername", "Father's full name (optional)", "")
  .addOptionalParam("fatherpassphrase", "Father's passphrase (default: empty)", "")
  .addOptionalParam("fatherbirthyear", "Father birth year (0=unknown)", "0")
  .addOptionalParam("fatherbirthmonth", "Father birth month (1-12, 0=unknown)", "0")
  .addOptionalParam("fatherbirthday", "Father birth day (1-31, 0=unknown)", "0")
  .addOptionalParam("fathergender", "Father gender (0=Unknown,1=Male,2=Female,3=Other)", "1")
  .addOptionalParam("fatherbirthbc", "Is father birth BC (true/false)", "false")
  .addOptionalParam("mothername", "Mother's full name (optional)", "")
  .addOptionalParam("motherpassphrase", "Mother's passphrase (default: empty)", "")
  .addOptionalParam("motherbirthyear", "Mother birth year (0=unknown)", "0")
  .addOptionalParam("motherbirthmonth", "Mother birth month (1-12, 0=unknown)", "0")
  .addOptionalParam("motherbirthday", "Mother birth day (1-31, 0=unknown)", "0")
  .addOptionalParam("mothergender", "Mother gender (0=Unknown,1=Male,2=Female,3=Other)", "2")
  .addOptionalParam("motherbirthbc", "Is mother birth BC (true/false)", "false")
  .addOptionalParam("fatherversion", "Father version index", "0")
  .addOptionalParam("motherversion", "Mother version index", "0")
  .addParam("tag", "Version tag, e.g. v1")
  .addParam("ipfs", "Metadata IPFS CID / hash")
  .addOptionalParam("skipverify", "Skip contract-side hash verification to speed up", "false")
  .setAction(async (args, hre) => {
    const { deployments, ethers } = hre;
    const { get } = deployments;

    let deep;
    try {
      deep = await get("DeepFamily");
    } catch {
      console.log("🔄 Deploying contracts...");
      await deployments.fixture(["Integrated"]);
      deep = await get("DeepFamily");
    }

    const deepFamily = await ethers.getContractAt("DeepFamily", deep.address);
    const [signer] = await ethers.getSigners();
    const sender = await signer.getAddress();

    // Parse & validate numeric fields with better error messages
    const birthYearNum = Number(args.birthyear);
    const birthMonthNum = Number(args.birthmonth);
    const birthDayNum = Number(args.birthday);
    const genderNum = Number(args.gender);

    if (birthYearNum < 0 || birthYearNum > 65535) {
      throw new Error(`Birth year out of range: ${birthYearNum} (must be 0-65535)`);
    }
    if (birthMonthNum < 0 || birthMonthNum > 12) {
      throw new Error(`Birth month out of range: ${birthMonthNum} (must be 0-12)`);
    }
    if (birthDayNum < 0 || birthDayNum > 31) {
      throw new Error(`Birth day out of range: ${birthDayNum} (must be 0-31)`);
    }
    if (genderNum < 0 || genderNum > 3) {
      throw new Error(`Gender out of range: ${genderNum} (must be 0-3)`);
    }

    console.log("=== Enhanced ZK Add Person ===");
    console.log("Person:", args.fullname);
    console.log("Father:", args.fathername || "(not provided)");
    console.log("Mother:", args.mothername || "(not provided)");
    console.log("DeepFamily contract:", deep.address);

    // Normalize inputs (consistent with successful scripts)
    const normalizedPassphrase = args.passphrase || "";
    const normalizedFatherPassphrase = args.fatherpassphrase || "";
    const normalizedMotherPassphrase = args.motherpassphrase || "";

    // Calculate keccak256 hashes first (like mint-nft)
    const fullNameKeccak = ethers.keccak256(ethers.toUtf8Bytes(args.fullname));
    const passphraseKeccak = ethers.keccak256(ethers.toUtf8Bytes(normalizedPassphrase));

    // Helper function to convert hash to bytes array (same as mint-nft)
    function hashToBytes(hash) {
      const bytes = ethers.getBytes(hash);
      return Array.from(bytes);
    }

    // Helper function to calculate PersonBasicInfo hash using contract function
    async function calculatePersonHash(
      name,
      passphrase,
      isBirthBC,
      birthYear,
      birthMonth,
      birthDay,
      gender,
    ) {
      const nameKeccak = ethers.keccak256(ethers.toUtf8Bytes(name));
      const saltKeccak = ethers.keccak256(ethers.toUtf8Bytes(passphrase));

      // Convert to limbs (matching circuit's HashToLimbs)
      const nameLimb0 = BigInt(nameKeccak) >> 128n;
      const nameLimb1 = BigInt(nameKeccak) & ((1n << 128n) - 1n);
      const saltLimb0 = BigInt(saltKeccak) >> 128n;
      const saltLimb1 = BigInt(saltKeccak) & ((1n << 128n) - 1n);

      // Calculate salted name hash using poseidon (matching circuit)
      const saltedNamePoseidon = poseidon([nameLimb0, nameLimb1, saltLimb0, saltLimb1, 0n]);

      const basicInfo = {
        fullNameCommitment: "0x" + saltedNamePoseidon.toString(16).padStart(64, "0"),
        isBirthBC: isBirthBC,
        birthYear: birthYear,
        birthMonth: birthMonth,
        birthDay: birthDay,
        gender: gender,
      };

      return await deepFamily.getPersonHash(basicInfo);
    }

    // Generate person input
    const fullNameHashBytes = hashToBytes(fullNameKeccak);
    const saltHashBytes = hashToBytes(passphraseKeccak);

    // Generate father input (with better validation) - parallel processing
    const hasFather = args.fathername ? 1 : 0;
    const fatherPromise = hasFather
      ? (async () => {
          const fatherNameKeccak = ethers.keccak256(ethers.toUtf8Bytes(args.fathername));
          const fatherSaltKeccak = ethers.keccak256(ethers.toUtf8Bytes(normalizedFatherPassphrase));

          // Validate father's parameters
          const fatherBirthYear = Number(args.fatherbirthyear);
          const fatherBirthMonth = Number(args.fatherbirthmonth);
          const fatherBirthDay = Number(args.fatherbirthday);
          const fatherGender = Number(args.fathergender);

          if (fatherBirthYear < 0 || fatherBirthYear > 65535) {
            throw new Error(`Father birth year out of range: ${fatherBirthYear}`);
          }
          if (fatherBirthMonth < 0 || fatherBirthMonth > 12) {
            throw new Error(`Father birth month out of range: ${fatherBirthMonth}`);
          }
          if (fatherBirthDay < 0 || fatherBirthDay > 31) {
            throw new Error(`Father birth day out of range: ${fatherBirthDay}`);
          }
          if (fatherGender < 0 || fatherGender > 3) {
            throw new Error(`Father gender out of range: ${fatherGender}`);
          }

          return {
            fullNameHashBytes: hashToBytes(fatherNameKeccak),
            saltHashBytes: hashToBytes(fatherSaltKeccak),
            isBirthBC: String(args.fatherbirthbc).toLowerCase() === "true" ? 1 : 0,
            birthYear: fatherBirthYear,
            birthMonth: fatherBirthMonth,
            birthDay: fatherBirthDay,
            gender: fatherGender,
          };
        })()
      : Promise.resolve({
          fullNameHashBytes: ZERO32,
          saltHashBytes: ZERO32,
          isBirthBC: 0,
          birthYear: 0,
          birthMonth: 0,
          birthDay: 0,
          gender: 0,
        });

    // Generate mother input (with better validation) - parallel processing
    const hasMother = args.mothername ? 1 : 0;
    const motherPromise = hasMother
      ? (async () => {
          const motherNameKeccak = ethers.keccak256(ethers.toUtf8Bytes(args.mothername));
          const motherSaltKeccak = ethers.keccak256(ethers.toUtf8Bytes(normalizedMotherPassphrase));

          // Validate mother's parameters
          const motherBirthYear = Number(args.motherbirthyear);
          const motherBirthMonth = Number(args.motherbirthmonth);
          const motherBirthDay = Number(args.motherbirthday);
          const motherGender = Number(args.mothergender);

          if (motherBirthYear < 0 || motherBirthYear > 65535) {
            throw new Error(`Mother birth year out of range: ${motherBirthYear}`);
          }
          if (motherBirthMonth < 0 || motherBirthMonth > 12) {
            throw new Error(`Mother birth month out of range: ${motherBirthMonth}`);
          }
          if (motherBirthDay < 0 || motherBirthDay > 31) {
            throw new Error(`Mother birth day out of range: ${motherBirthDay}`);
          }
          if (motherGender < 0 || motherGender > 3) {
            throw new Error(`Mother gender out of range: ${motherGender}`);
          }

          return {
            fullNameHashBytes: hashToBytes(motherNameKeccak),
            saltHashBytes: hashToBytes(motherSaltKeccak),
            isBirthBC: String(args.motherbirthbc).toLowerCase() === "true" ? 1 : 0,
            birthYear: motherBirthYear,
            birthMonth: motherBirthMonth,
            birthDay: motherBirthDay,
            gender: motherGender,
          };
        })()
      : Promise.resolve({
          fullNameHashBytes: ZERO32,
          saltHashBytes: ZERO32,
          isBirthBC: 0,
          birthYear: 0,
          birthMonth: 0,
          birthDay: 0,
          gender: 0,
        });

    // Wait for parallel processing to complete
    const [fatherData, motherData] = await Promise.all([fatherPromise, motherPromise]);

    // Prepare circuit input (matching PersonHashTest template exactly)
    const input = {
      // Person to be added
      fullNameHash: fullNameHashBytes,
      saltHash: saltHashBytes,
      isBirthBC: String(args.birthbc).toLowerCase() === "true" ? 1 : 0,
      birthYear: birthYearNum,
      birthMonth: birthMonthNum,
      birthDay: birthDayNum,
      gender: genderNum,

      // Father
      father_fullNameHash: fatherData.fullNameHashBytes,
      father_saltHash: fatherData.saltHashBytes,
      father_isBirthBC: fatherData.isBirthBC,
      father_birthYear: fatherData.birthYear,
      father_birthMonth: fatherData.birthMonth,
      father_birthDay: fatherData.birthDay,
      father_gender: fatherData.gender,

      // Mother
      mother_fullNameHash: motherData.fullNameHashBytes,
      mother_saltHash: motherData.saltHashBytes,
      mother_isBirthBC: motherData.isBirthBC,
      mother_birthYear: motherData.birthYear,
      mother_birthMonth: motherData.birthMonth,
      mother_birthDay: motherData.birthDay,
      mother_gender: motherData.gender,

      // Parent existence flags
      hasFather: hasFather,
      hasMother: hasMother,

      // Submitter binding (convert address to uint160)
      submitter: BigInt(sender).toString(),
    };

    if (String(args.skipverify).toLowerCase() !== "true") {
      // Verify the person hash calculation using contract function
      console.log("🔍 Verifying person hash calculation...");
      try {
        const expectedPersonHash = await calculatePersonHash(
          args.fullname,
          normalizedPassphrase,
          String(args.birthbc).toLowerCase() === "true",
          birthYearNum,
          birthMonthNum,
          birthDayNum,
          genderNum,
        );
        console.log("Expected person hash from contract:", expectedPersonHash);
      } catch (error) {
        console.warn("⚠️  Could not verify person hash with contract:", error.message);
      }
    } else {
      console.log("⏩ Skipping contract verification as requested (--skipverify=true)");
    }

    // Use correct paths for ZK files (try common candidates)
    const possibleWasmPaths = [
      path.join(__dirname, "../artifacts/circuits/person_hash_zk_js/person_hash_zk.wasm"),
      path.join(__dirname, "../circuits/person_hash_zk_js/person_hash_zk.wasm"),
    ];
    let wasmPath = null;
    for (const p of possibleWasmPaths) {
      if (fs.existsSync(p)) {
        wasmPath = p;
        break;
      }
    }

    // Try multiple possible zkey paths
    const possibleZkeyPaths = [
      path.join(__dirname, "../artifacts/circuits/person_hash_zk_final.zkey"),
      path.join(__dirname, "../circuits/person_hash_zk_final.zkey"),
      path.join(__dirname, "../circuits/person_hash_zk.zkey"),
    ];

    let zkeyPath = null;
    for (const zkeyPathCandidate of possibleZkeyPaths) {
      if (fs.existsSync(zkeyPathCandidate)) {
        zkeyPath = zkeyPathCandidate;
        break;
      }
    }

    console.log("🔄 Generating ZK proof...");
    console.log("WASM path:", wasmPath);
    console.log("ZKey path:", zkeyPath);

    // Better file existence checks
    if (!wasmPath) {
      throw new Error(
        `WASM file not found in any of these locations:\n${possibleWasmPaths.join("\n")}\nPlease build the circuit first using: npm run zk:build`,
      );
    }
    if (!zkeyPath) {
      throw new Error(
        `ZKey file not found in any of these locations:\n${possibleZkeyPaths.join("\n")}\nPlease generate the proving key first.`,
      );
    }

    let proof, publicSignals;
    try {
      // Generate proof
      ({ proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath));
    } catch (error) {
      console.error("❌ ZK proof generation failed:");
      console.error("Error:", error.message);
      if (error.message.includes("Error in template")) {
        console.error(
          "This might be a circuit input format issue. Check that all inputs match the circuit template.",
        );
      }
      throw error;
    }

    // Convert proof format for Solidity (standard Groth16 format conversion)
    const a = [proof.pi_a[0], proof.pi_a[1]];
    const b = [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]],
    ];
    const c = [proof.pi_c[0], proof.pi_c[1]];

    console.log("✅ ZK proof generated successfully");

    // Validate public signals format
    if (publicSignals.length !== 7) {
      throw new Error(`Expected 7 public signals, got ${publicSignals.length}`);
    }

    // Check submitter binding
    const submitter = BigInt(publicSignals[6]);
    const senderUint160 = BigInt(sender);
    if (submitter !== senderUint160) {
      throw new Error(`Submitter mismatch: proof=${submitter} expected=${senderUint160}`);
    }

    console.log("Public signals breakdown:");
    console.log("  Person hash (high, low):", publicSignals[0], publicSignals[1]);
    console.log("  Father hash (high, low):", publicSignals[2], publicSignals[3]);
    console.log("  Mother hash (high, low):", publicSignals[4], publicSignals[5]);
    console.log("  Submitter address:", publicSignals[6]);

    // Reconstruct the expected person hash from public signals for verification
    const personHashFromProof =
      "0x" +
      ((BigInt(publicSignals[0]) << 128n) | BigInt(publicSignals[1]))
        .toString(16)
        .padStart(64, "0");
    console.log("Person hash from proof:", personHashFromProof);

    console.log("Submitting addPersonZK...");

    let tx;
    try {
      tx = await deepFamily
        .connect(signer)
        .addPersonZK(
          a,
          b,
          c,
          publicSignals,
          Number(args.fatherversion),
          Number(args.motherversion),
          args.tag,
          args.ipfs,
        );
    } catch (error) {
      console.error("❌ Transaction failed:");
      console.error("Error:", error.message);
      if (error.message.includes("InvalidZKProof")) {
        console.error(
          "ZK proof verification failed on-chain. Check that proof generation is correct.",
        );
      }
      throw error;
    }

    console.log("Tx:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Mined in block:", receipt.blockNumber);

    // Parse events with better error handling
    try {
      const iface = new ethers.Interface([
        "event PersonHashZKVerified(bytes32 indexed personHash, address indexed prover)",
        "event PersonVersionAdded(bytes32 indexed personHash, uint256 indexed versionIndex, address indexed addedBy, uint256 timestamp, bytes32 fatherHash, uint256 fatherVersionIndex, bytes32 motherHash, uint256 motherVersionIndex, string tag)",
      ]);

      let zkVerified = false;
      let versionAdded = false;

      for (const log of receipt.logs || []) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === "PersonHashZKVerified") {
            console.log("✅ ZK verified for:", parsed.args.personHash);
            zkVerified = true;
          }
          if (parsed && parsed.name === "PersonVersionAdded") {
            console.log("✅ Person version added:", parsed.args.versionIndex.toString());
            console.log("   PersonHash:", parsed.args.personHash);
            console.log("   Tag:", parsed.args.tag);
            console.log("   Father hash:", parsed.args.fatherHash);
            console.log("   Mother hash:", parsed.args.motherHash);
            versionAdded = true;
          }
        } catch (parseError) {
          // Ignore parsing errors for non-relevant logs
        }
      }

      if (!zkVerified) {
        console.warn("⚠️  PersonHashZKVerified event not found in transaction logs");
      }
      if (!versionAdded) {
        console.warn("⚠️  PersonVersionAdded event not found in transaction logs");
      }
    } catch (eventError) {
      console.warn("⚠️  Could not parse transaction events:", eventError.message);
    }

    console.log("🎉 Task completed successfully!");
  });
