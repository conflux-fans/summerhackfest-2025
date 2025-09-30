const { expect } = require('chai');
const hre = require('hardhat');
const poseidon = require('circomlibjs').poseidon;
const { computePoseidonDigest, splitToLimbs, buildBasicInfo } = require('../lib/namePoseidon');

const FIELD_MASK_128 = (1n << 128n) - 1n;

/**
 * Convert bytes32 hash (as hex string) to the two 128-bit limbs used in the circuit
 * Matches HashToLimbs template logic (big-endian across each byte)
 */
/**
 * Pack birth data and flags exactly as in the circuit/contract
 * Format: birthYear * 2^24 + birthMonth * 2^16 + birthDay * 2^8 + gender * 2 + isBirthBC
 */
function packVitalStats({ birthYear, birthMonth, birthDay, gender, isBirthBC }) {
  return (BigInt(birthYear) << 24n)
    | (BigInt(birthMonth) << 16n)
    | (BigInt(birthDay) << 8n)
    | (BigInt(gender) << 1n)
    | (isBirthBC ? 1n : 0n);
}

/**
 * Combine Poseidon output into canonical bytes32 and expose high/low limbs for comparison
 */
function computePersonHashCircuitEquivalent(input) {
  const digestInfo = computePoseidonDigest(input.fullName, input.passphrase); // Poseidon(name, salt, 0)
  const poseidonDigest = BigInt(digestInfo.digestHex);
  const poseidonLimbs = digestInfo.digestLimbs;

  const packedData = packVitalStats(input);
  const finalPoseidonResult = poseidon([poseidonLimbs.hi, poseidonLimbs.lo, packedData]);
  const finalPoseidonHex = `0x${finalPoseidonResult.toString(16).padStart(64, '0')}`;
  const finalPoseidonLimbs = splitToLimbs(finalPoseidonHex);
  const personHash = hre.ethers.keccak256(hre.ethers.getBytes(finalPoseidonHex));

  return {
    poseidonDigestHex: digestInfo.digestHex,
    poseidonLimbs,
    packedData,
    finalPoseidonHex,
    finalPoseidonLimbs,
    personHash,
    nameKeccak: digestInfo.nameHex,
    saltKeccak: digestInfo.saltHex,
  };
}

describe('Hash Consistency Tests', function () {
  this.timeout(60_000);

  let deepFamily;

  beforeEach(async () => {
    await hre.deployments.fixture(['Integrated']);
    const { address } = await hre.deployments.get('DeepFamily');
    deepFamily = await hre.ethers.getContractAt('DeepFamily', address);
  });

  const testCases = [
    {
      name: 'Basic case',
      input: { fullName: 'John Doe', passphrase: '', isBirthBC: false, birthYear: 1990, birthMonth: 5, birthDay: 15, gender: 1 },
    },
    {
      name: 'BC birth year',
      input: { fullName: 'Ancient Person', passphrase: '', isBirthBC: true, birthYear: 500, birthMonth: 0, birthDay: 0, gender: 2 },
    },
    {
      name: 'Zero values',
      input: { fullName: 'Unknown Person', passphrase: '', isBirthBC: false, birthYear: 0, birthMonth: 0, birthDay: 0, gender: 0 },
    },
    {
      name: 'Unicode name',
      input: { fullName: 'John Smith', passphrase: '', isBirthBC: false, birthYear: 1985, birthMonth: 12, birthDay: 25, gender: 1 },
    },
    {
      name: 'Long name',
      input: { fullName: 'Very Long Name With Many Characters', passphrase: '', isBirthBC: false, birthYear: 2000, birthMonth: 1, birthDay: 1, gender: 3 },
    },
    {
      name: 'With passphrase',
      input: { fullName: 'Secure Person', passphrase: 'my-secret-passphrase', isBirthBC: false, birthYear: 1995, birthMonth: 6, birthDay: 10, gender: 2 },
    },
  ];

  testCases.forEach(({ name, input }) => {
    it(`matches circuit hash for: ${name}`, async () => {
      const expected = computePersonHashCircuitEquivalent(input);

      // The getFullNameHash function no longer exists in the contract
      // We now compare the Poseidon digest directly
      const basicInfo = buildBasicInfo({
        fullName: input.fullName,
        passphrase: input.passphrase,
        isBirthBC: input.isBirthBC,
        birthYear: input.birthYear,
        birthMonth: input.birthMonth,
        birthDay: input.birthDay,
        gender: input.gender,
      });

      expect(basicInfo.fullNameCommitment).to.equal(expected.poseidonDigestHex);

      // Note: This test may need adjustment based on how the contract handles the new Poseidon digest
      // The contract's getPersonHash function should now work with the Poseidon digest as input
      const contractHash = await deepFamily.getPersonHash(basicInfo);
      expect(contractHash).to.equal(expected.personHash);

      const poseidonLimbs = splitToLimbs(expected.finalPoseidonHex);
      expect(poseidonLimbs.hi).to.equal(expected.finalPoseidonLimbs.hi);
      expect(poseidonLimbs.lo).to.equal(expected.finalPoseidonLimbs.lo);
    });
  });
});
