const { expect } = require('chai');
const hre = require('hardhat');

// Tests for endorsement logic

describe('Endorse Tests', function () {
  this.timeout(60_000);

  async function createPerson() {
    await hre.deployments.fixture(['Integrated']);
    const deepDeployment = await hre.deployments.get('DeepFamily');
    const deepFamily = await hre.ethers.getContractAt('DeepFamily', deepDeployment.address);
    const p = { fullname: 'Eva Sample', birthyear: '1985', gender: '2', tag: 'v1', ipfs: 'QmEva1' };
    await hre.run('add-person', p);
    const fullNameHash = await deepFamily.getFullNameHash(p.fullname);
    const basicInfo = { fullNameHash: fullNameHash, isBirthBC: false, birthYear: 1985, birthMonth: 0, birthDay: 0, gender: 2 };
    const personHash = await deepFamily.getPersonHash(basicInfo);
    return { deepFamily, personHash };
  }

  it('endorses version 1 and increments count', async () => {
    const { deepFamily, personHash } = await createPerson();
    await hre.run('endorse', { person: personHash, vindex: '1' });
    // versionEndorsementCount stored at arrayIndex = versionIndex - 1
    const endorsementCount = await deepFamily.versionEndorsementCount(personHash, 0);
    expect(endorsementCount).to.equal(1n);
  });

  it('second endorsement of same version is idempotent (count unchanged)', async () => {
    const { deepFamily, personHash } = await createPerson();
    await hre.run('endorse', { person: personHash, vindex: '1' });
    await hre.run('endorse', { person: personHash, vindex: '1' }); // silent no-op in contract
    const endorsementCount = await deepFamily.versionEndorsementCount(personHash, 0);
    expect(endorsementCount).to.equal(1n);
  });
});
