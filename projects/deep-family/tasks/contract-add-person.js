const { task } = require("hardhat/config");
const { computePoseidonDigest, buildBasicInfo } = require("../lib/namePoseidon");

// PersonBasicInfo {
//   bytes32 fullNameCommitment; // Poseidon5 hash, NOT simple keccak256!
//   bool isBirthBC;
//   uint16 birthYear;
//   uint8 birthMonth;
//   uint8 birthDay;
//   uint8 gender;
// }

task("add-person", "Add a person version using correct fullNameCommitment calculation")
  .addParam("fullname", "Full name")
  .addOptionalParam("passphrase", "Salt passphrase for privacy (default: empty)", "")
  .addOptionalParam("birthbc", "Is birth year BC (true/false)", "false")
  .addParam("birthyear", "Birth year (0=unknown)")
  .addOptionalParam("birthmonth", "Birth month (1-12, 0=unknown)", "0")
  .addOptionalParam("birthday", "Birth day (1-31, 0=unknown)", "0")
  .addParam("gender", "Gender (0=Unknown,1=Male,2=Female,3=Other)")
  .addOptionalParam(
    "father",
    "Father hash (bytes32)",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  )
  .addOptionalParam(
    "mother",
    "Mother hash (bytes32)",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  )
  .addOptionalParam("fatherversion", "Father version index", "0")
  .addOptionalParam("motherversion", "Mother version index", "0")
  .addParam("tag", "Version tag, e.g. v1")
  .addParam("ipfs", "Metadata IPFS CID / hash")
  .setAction(async (args, hre) => {
    const { deployments, ethers } = hre;
    const { get } = deployments;

    let deep;
    try {
      deep = await get("DeepFamily");
    } catch {
      // Deploy integrated system if not yet deployed (tags defined in deploy script)
      await deployments.fixture(["Integrated"]);
      deep = await get("DeepFamily");
    }

    const deepFamily = await ethers.getContractAt("DeepFamily", deep.address);

    // Parse & validate numeric fields
    const birthYearNum = Number(args.birthyear);
    const birthMonthNum = Number(args.birthmonth);
    const birthDayNum = Number(args.birthday);
    const genderNum = Number(args.gender);

    if (birthYearNum < 0 || birthYearNum > 65535) throw new Error("birthYear out of uint16 range");
    if (birthMonthNum < 0 || birthMonthNum > 12) throw new Error("birthMonth must be 0-12");
    if (birthDayNum < 0 || birthDayNum > 31) throw new Error("birthDay must be 0-31");
    if (genderNum < 0 || genderNum > 3) throw new Error("gender must be 0-3");

    if (!args.fullname || args.fullname.trim().length === 0) {
      throw new Error("InvalidFullName");
    }

    computePoseidonDigest(args.fullname, args.passphrase);

    const basicInfo = buildBasicInfo({
      fullName: args.fullname,
      passphrase: args.passphrase,
      isBirthBC: String(args.birthbc).toLowerCase() === "true",
      birthYear: birthYearNum,
      birthMonth: birthMonthNum,
      birthDay: birthDayNum,
      gender: genderNum,
    });

    // Compute hashes
    const personHash = await deepFamily.getPersonHash(basicInfo);

    const tx = await deepFamily.addPerson(
      personHash,
      args.father,
      args.mother,
      Number(args.fatherversion),
      Number(args.motherversion),
      args.tag,
      args.ipfs,
    );
    const receipt = await tx.wait();

    // Decode PersonVersionAdded event
    try {
      const iface = new ethers.Interface([
        "event PersonVersionAdded(bytes32 indexed personHash, uint256 indexed versionIndex, address indexed addedBy, uint256 timestamp, bytes32 fatherHash, uint256 fatherVersionIndex, bytes32 motherHash, uint256 motherVersionIndex, string tag)",
      ]);
      const deepAddress = deep.address.toLowerCase();
      for (const log of receipt.logs || []) {
        if ((log.address || "").toLowerCase() !== deepAddress) continue;
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === "PersonVersionAdded") {
            break;
          }
        } catch (_) {
          /* ignore */
        }
      }
    } catch (e) {}
  });
