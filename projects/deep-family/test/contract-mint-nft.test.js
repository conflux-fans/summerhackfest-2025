const { expect } = require('chai');
const hre = require('hardhat');
const { buildBasicInfo } = require('../lib/namePoseidon');
const { generateNamePoseidonProof } = require('../lib/namePoseidonProof');

// Tests for mint-nft task & underlying contract invariants

describe('Mint NFT Tests', function () {
  this.timeout(60_000);

  async function prepare(endorsed = true) {
    await hre.deployments.fixture(['Integrated']);
    const deepDeployment = await hre.deployments.get('DeepFamily');
    const deepFamily = await hre.ethers.getContractAt('DeepFamily', deepDeployment.address);
    const FULLNAME = 'Mint Subject';
    const params = { fullname: FULLNAME, birthyear: '1999', gender: '1', tag: 'v1', ipfs: 'QmMint1' };
    await hre.run('add-person', params);

    const basicInfo = buildBasicInfo({
      fullName: FULLNAME,
      birthYear: 1999,
      birthMonth: 0,
      birthDay: 0,
      gender: 1,
    });
    const fullNameCommitment = basicInfo.fullNameCommitment;
    const personHash = await deepFamily.getPersonHash(basicInfo);
    const proofBundle = await generateNamePoseidonProof(FULLNAME);
    const { proof, publicSignals } = proofBundle;
    if (endorsed) {
      await hre.run('endorse', { person: personHash, vindex: '1' });
    }
    return { deepFamily, personHash, FULLNAME, fullNameCommitment, basicInfo, proof, publicSignals };
  }

  it('fails mint through task before endorsement (task layer error)', async () => {
    const { personHash } = await prepare(false);
    await expect(
      hre.run('mint-nft', {
        person: personHash,
        vindex: '1',
        tokenuri: 'ipfs://meta',
        fullname: 'Mint Subject',
        birthyear: '1999',
        gender: '1',
        birthplace: 'City',
        story: 'Story'
      })
    ).to.be.rejectedWith(/must endorse this version first/i);
  });

  it('mints NFT and sets mappings', async () => {
    const { deepFamily, personHash } = await prepare(true);
    await hre.run('mint-nft', {
      person: personHash,
      vindex: '1',
      tokenuri: 'ipfs://meta2',
      fullname: 'Mint Subject',
      birthyear: '1999',
      gender: '1',
      birthplace: 'City',
      story: 'Story'
    });
    const tokenCounter = await deepFamily.tokenCounter();
    expect(tokenCounter).to.equal(1n);
    const mappedPerson = await deepFamily.tokenIdToPerson(1n);
    expect(mappedPerson).to.equal(personHash);
    const versionIdx = await deepFamily.tokenIdToVersionIndex(1n);
    expect(versionIdx).to.equal(1n);
    const versionToken = await deepFamily.versionToTokenId(personHash, 0); // array index 0
    expect(versionToken).to.equal(1n);
  });

  it('prevents double mint of same version', async () => {
    const { deepFamily, personHash } = await prepare(true);
    const commonArgs = {
      person: personHash,
      vindex: '1',
      tokenuri: 'ipfs://meta',
      fullname: 'Mint Subject',
      birthyear: '1999',
      gender: '1',
      birthplace: 'City',
      story: 'Story'
    };
    await hre.run('mint-nft', commonArgs);
    await expect(hre.run('mint-nft', commonArgs)).to.be.rejectedWith(/VersionAlreadyMinted/);
  });

  it('rejects empty fullName in supplementInfo via direct contract call', async () => {
    const { deepFamily, personHash, basicInfo, proof, publicSignals } = await prepare(true);

    const coreInfo = {
      basicInfo: basicInfo,
      supplementInfo: {
        fullName: '', // Empty fullName should fail
        birthPlace: 'City',
        isDeathBC: false,
        deathYear: 0,
        deathMonth: 0,
        deathDay: 0,
        deathPlace: '',
        story: 'Story'
      }
    };

    await expect(
      deepFamily.mintPersonNFT(proof.a, proof.b, proof.c, publicSignals, personHash, 1, 'ipfs://meta', coreInfo)
    ).to.be.revertedWithCustomError(deepFamily, 'InvalidFullName');
  });

  it('rejects oversized fullName in supplementInfo via direct contract call', async () => {
    const { deepFamily, personHash, basicInfo, proof, publicSignals } = await prepare(true);

    const longName = 'A'.repeat(1001); // Exceeds MAX_LONG_TEXT_LENGTH
    const coreInfo = {
      basicInfo: basicInfo,
      supplementInfo: {
        fullName: longName,
        birthPlace: 'City',
        isDeathBC: false,
        deathYear: 0,
        deathMonth: 0,
        deathDay: 0,
        deathPlace: '',
        story: 'Story'
      }
    };

    await expect(
      deepFamily.mintPersonNFT(proof.a, proof.b, proof.c, publicSignals, personHash, 1, 'ipfs://meta', coreInfo)
    ).to.be.revertedWithCustomError(deepFamily, 'InvalidFullName');
  });

  it('rejects mismatched fullName and fullNameCommitment via direct contract call', async () => {
    const { deepFamily, personHash, basicInfo, proof, publicSignals } = await prepare(true);

    const coreInfo = {
      basicInfo: basicInfo,
      supplementInfo: {
        fullName: 'Different Name', // Doesn't match the hash in basicInfo
        birthPlace: 'City',
        isDeathBC: false,
        deathYear: 0,
        deathMonth: 0,
        deathDay: 0,
        deathPlace: '',
        story: 'Story'
      }
    };

    await expect(
      deepFamily.mintPersonNFT(proof.a, proof.b, proof.c, publicSignals, personHash, 1, 'ipfs://meta', coreInfo)
    ).to.be.revertedWithCustomError(deepFamily, 'BasicInfoMismatch');
  });

  it('accepts valid fullName that matches fullNameCommitment via direct contract call', async () => {
    const { deepFamily, personHash, FULLNAME, basicInfo, proof, publicSignals } = await prepare(true);

    const coreInfo = {
      basicInfo: basicInfo,
      supplementInfo: {
        fullName: FULLNAME, // Matches the hash in basicInfo
        birthPlace: 'City',
        isDeathBC: false,
        deathYear: 0,
        deathMonth: 0,
        deathDay: 0,
        deathPlace: '',
        story: 'Story'
      }
    };

    await expect(
      deepFamily.mintPersonNFT(proof.a, proof.b, proof.c, publicSignals, personHash, 1, 'ipfs://meta', coreInfo)
    ).to.not.be.reverted;

    // Verify the NFT was minted
    const tokenCounter = await deepFamily.tokenCounter();
    expect(tokenCounter).to.equal(1n);
  });
});
