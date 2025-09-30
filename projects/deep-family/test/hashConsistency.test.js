const { expect } = require('chai');
const hre = require('hardhat');

// Test to verify frontend computePersonHashLocal matches contract getPersonHash

describe('Hash Consistency Tests', function () {
  this.timeout(60_000);

  async function setup() {
    await hre.deployments.fixture(['Integrated']);
    const deepDeployment = await hre.deployments.get('DeepFamily');
    const deepFamily = await hre.ethers.getContractAt('DeepFamily', deepDeployment.address);
    return { deepFamily };
  }

  // Frontend hash calculation function (copied from SearchPage.tsx)
  function computePersonHashLocal(input) {
    const { fullName, isBirthBC, birthYear, birthMonth, birthDay, gender } = input
    
    // First compute fullNameHash exactly like the contract
    const nameBytes = new TextEncoder().encode(fullName)
    const fullNameHash = hre.ethers.keccak256(nameBytes)
    
    // Now build PersonBasicInfo hash exactly matching the contract's abi.encodePacked:
    // abi.encodePacked(fullNameHash, uint8(isBirthBC), birthYear, birthMonth, birthDay, gender)
    // Total: 32 + 1 + 2 + 1 + 1 + 1 = 38 bytes
    const buffer = new Uint8Array(38)
    let offset = 0
    
    // fullNameHash (32 bytes)
    const hashBytes = hre.ethers.getBytes(fullNameHash)
    buffer.set(hashBytes, offset)
    offset += 32
    
    // isBirthBC as uint8 (1 byte)
    buffer[offset] = isBirthBC ? 1 : 0
    offset += 1
    
    // birthYear as uint16 big-endian (2 bytes)
    buffer[offset] = (birthYear >> 8) & 0xff
    buffer[offset + 1] = birthYear & 0xff
    offset += 2
    
    // birthMonth as uint8 (1 byte)
    buffer[offset] = birthMonth & 0xff
    offset += 1
    
    // birthDay as uint8 (1 byte)
    buffer[offset] = birthDay & 0xff
    offset += 1
    
    // gender as uint8 (1 byte)
    buffer[offset] = gender & 0xff
    
    return hre.ethers.keccak256(buffer)
  }

  const testCases = [
    {
      name: "Basic case",
      input: { fullName: "John Doe", isBirthBC: false, birthYear: 1990, birthMonth: 5, birthDay: 15, gender: 1 }
    },
    {
      name: "BC birth year",
      input: { fullName: "Ancient Person", isBirthBC: true, birthYear: 500, birthMonth: 0, birthDay: 0, gender: 2 }
    },
    {
      name: "Zero values",
      input: { fullName: "Unknown Person", isBirthBC: false, birthYear: 0, birthMonth: 0, birthDay: 0, gender: 0 }
    },
    {
      name: "Unicode name",
      input: { fullName: "John Smith", isBirthBC: false, birthYear: 1985, birthMonth: 12, birthDay: 25, gender: 1 }
    },
    {
      name: "Long name",
      input: { fullName: "Very Long Name With Many Characters", isBirthBC: false, birthYear: 2000, birthMonth: 1, birthDay: 1, gender: 3 }
    }
  ];

  testCases.forEach(({ name, input }) => {
    it(`verifies hash consistency for: ${name}`, async () => {
      const { deepFamily } = await setup();
      
      // Calculate hash using frontend function
      const frontendHash = computePersonHashLocal(input);
      
      // Calculate fullNameHash for contract call
      const fullNameHash = await deepFamily.getFullNameHash(input.fullName);
      
      // Prepare basicInfo for contract call
      const basicInfo = {
        fullNameHash: fullNameHash,
        isBirthBC: input.isBirthBC,
        birthYear: input.birthYear,
        birthMonth: input.birthMonth,
        birthDay: input.birthDay,
        gender: input.gender
      };
      
      // Calculate hash using contract function
      const contractHash = await deepFamily.getPersonHash(basicInfo);
      
      console.log(`Frontend hash: ${frontendHash}`);
      console.log(`Contract hash:  ${contractHash}`);
      console.log(`FullNameHash:   ${fullNameHash}`);
      
      // They should be identical
      expect(frontendHash).to.equal(contractHash);
    });
  });
});
