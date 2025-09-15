const { expect } = require('chai');
const hre = require('hardhat');

// Tests focused on add-person (version creation) including validation and duplicate logic

describe('Person Version (add-person) Tests', function () {
  this.timeout(60_000);

  async function baseSetup() {
    await hre.deployments.fixture(['Integrated']);
    const deepDeployment = await hre.deployments.get('DeepFamily');
    const deepFamily = await hre.ethers.getContractAt('DeepFamily', deepDeployment.address);
    return { deepFamily };
  }

  it('adds a basic person and emits event', async () => {
    const { deepFamily } = await baseSetup();
    await expect(
      hre.run('add-person', {
        fullname: 'John Doe',
        birthyear: '1990',
        gender: '1',
        tag: 'v1',
        ipfs: 'QmCID1'
      })
    ).to.not.be.reverted;
    const fullNameHash = await deepFamily.getFullNameHash('John Doe');
    const basicInfo = { fullNameHash: fullNameHash, isBirthBC: false, birthYear: 1990, birthMonth: 0, birthDay: 0, gender: 1 };
    const personHash = await deepFamily.getPersonHash(basicInfo);
    const count = await deepFamily.countPersonVersions(personHash);
    expect(count).to.equal(1n);
  });

  it('reverts on empty full name', async () => {
    await baseSetup();
    await expect(
      hre.run('add-person', { fullname: '', birthyear: '1990', gender: '1', tag: 'v1', ipfs: 'QmCID1' })
    ).to.be.rejectedWith(/InvalidFullName/); // custom error bubbles as HardhatError message
  });

  it('reverts on invalid birthMonth / birthDay via direct call (solidity validation)', async () => {
    const { deepFamily } = await baseSetup();
    // Construct invalid basic info to call pure getPersonHash (will revert)
    const fullNameHash = await deepFamily.getFullNameHash('A');
    await expect(
      deepFamily.getPersonHash({ fullNameHash: fullNameHash, isBirthBC: false, birthYear: 1000, birthMonth: 13, birthDay: 0, gender: 1 })
    ).to.be.revertedWithCustomError(deepFamily, 'InvalidBirthMonth');
    await expect(
      deepFamily.getPersonHash({ fullNameHash: fullNameHash, isBirthBC: false, birthYear: 1000, birthMonth: 12, birthDay: 32, gender: 1 })
    ).to.be.revertedWithCustomError(deepFamily, 'InvalidBirthDay');
  });

  it('prevents duplicate version (same inputs)', async () => {
    const { deepFamily } = await baseSetup();
    const params = { fullname: 'Dup Person', birthyear: '2000', gender: '1', tag: 'v1', ipfs: 'QmCIDx' };
    await hre.run('add-person', params);
    await expect(hre.run('add-person', params)).to.be.rejectedWith(/DuplicateVersion/);
  });
});
