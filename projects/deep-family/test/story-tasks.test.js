const { expect } = require('chai');
const hre = require('hardhat');
const { buildBasicInfo } = require('../lib/namePoseidon');

// This test exercises the newly added Hardhat tasks for story sharding:
// add-story-chunk, update-story-chunk, seal-story, list-story-chunks
// Flow: add-person -> endorse -> mint-nft -> add chunks -> update chunk -> list -> seal -> ensure further mutation fails.

describe('Story Tasks Integration', function () {
  this.timeout(60_000);

  const FULLNAME = 'Alice Example';
  const BIRTH_YEAR = '1980';
  const GENDER = '1'; // male=1 per enum (0 unknown,1 male,2 female,3 other)
  const TAG = 'v1';
  const IPFS = 'QmTestMetaCID';

  beforeEach(async () => {
    await hre.deployments.fixture(['Integrated']);
  });

  it('runs full lifecycle of story tasks', async () => {
    const [signer] = await hre.ethers.getSigners();
    const deepDeployment = await hre.deployments.get('DeepFamily');
    const deepFamily = await hre.ethers.getContractAt('DeepFamily', deepDeployment.address, signer);

    // 1. add-person
    await hre.run('add-person', {
      fullname: FULLNAME,
      birthyear: BIRTH_YEAR,
      gender: GENDER,
      tag: TAG,
      ipfs: IPFS,
    });

    // Compute personHash to use in later tasks
    const basicInfo = buildBasicInfo({
      fullName: FULLNAME,
      birthYear: parseInt(BIRTH_YEAR, 10),
      birthMonth: 0,
      birthDay: 0,
      gender: parseInt(GENDER, 10),
    });
    const personHash = await deepFamily.getPersonHash(basicInfo);

    // Sanity: version count should be 1
    const versionCount = await deepFamily.countPersonVersions(personHash);
    expect(versionCount).to.equal(1n);

    // 2. endorse version 1
    await hre.run('endorse', { person: personHash, vindex: '1' });

    // 3. mint NFT (tokenId = 1)
    await hre.run('mint-nft', {
      person: personHash,
      vindex: '1',
      tokenuri: 'ipfs://nftMetaCID',
      fullname: FULLNAME,
      birthyear: BIRTH_YEAR,
      gender: GENDER,
      birthplace: 'Test City',
      story: 'Short life summary',
    });

    // Confirm tokenCounter = 1
    const tokenCounter = await deepFamily.tokenCounter();
    expect(tokenCounter).to.equal(1n);

    // 4. add first chunk (index 0)
    await hre.run('add-story-chunk', {
      tokenid: '1',
      chunkindex: '0',
      content: 'First chunk content',
    });

    // 5. add second chunk (index 1)
    await hre.run('add-story-chunk', {
      tokenid: '1',
      chunkindex: '1',
      content: 'Second chunk content',
    });

    // 6. update first chunk (index 0)
    await hre.run('update-story-chunk', {
      tokenid: '1',
      chunkindex: '0',
      content: 'First chunk content (updated)',
    });

    // Verify metadata and chunks directly via contract
    const meta = await deepFamily.getStoryMetadata(1n);
    expect(meta.totalChunks).to.equal(2n);
    expect(meta.isSealed).to.equal(false);

    const chunk0 = await deepFamily.getStoryChunk(1n, 0);
    expect(chunk0.content).to.equal('First chunk content (updated)');
    const chunk1 = await deepFamily.getStoryChunk(1n, 1);
    expect(chunk1.content).to.equal('Second chunk content');

    // 7. list-story-chunks (sanity, should not throw)
    await hre.run('list-story-chunks', { tokenid: '1', offset: '0', limit: '10' });

    // 8. seal story
    await hre.run('seal-story', { tokenid: '1' });

    const sealedMeta = await deepFamily.getStoryMetadata(1n);
    expect(sealedMeta.isSealed).to.equal(true);

    // 9. further modification should fail
    let failed = false;
    try {
      await hre.run('add-story-chunk', {
        tokenid: '1',
        chunkindex: '2',
        content: 'Should fail after seal',
      });
    } catch (e) {
      failed = true;
      expect(String(e.message || e)).to.match(/sealed/i);
    }
    if (!failed) {
      throw new Error('Expected add-story-chunk after sealing to fail');
    }
  });
});
