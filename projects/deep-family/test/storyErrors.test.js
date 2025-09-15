const { expect } = require('chai');
const hre = require('hardhat');

// Additional negative & edge-case tests for story sharding (add/update/seal)
// Covers: non-owner, index mismatch, oversize, hash mismatch, seal rules, max chunks, zero-chunk seal

describe('Story Sharding - Error & Edge Cases', function () {
  this.timeout(90_000);

  async function deployAndMint() {
    await hre.deployments.fixture(['Integrated']);
    const [signer, other] = await hre.ethers.getSigners();
    const deepDeployment = await hre.deployments.get('DeepFamily');
    const deepFamily = await hre.ethers.getContractAt('DeepFamily', deepDeployment.address, signer);

    const FULLNAME = 'Edge Person';
    const BIRTH_YEAR = '1970';
    const GENDER = '1';

    await hre.run('add-person', {
      fullname: FULLNAME,
      birthyear: BIRTH_YEAR,
      gender: GENDER,
      tag: 'edge',
      ipfs: 'QmEdgeMeta'
    });
    const fullNameHash = await deepFamily.getFullNameHash(FULLNAME);
    const basicInfo = {
      fullNameHash: fullNameHash,
      isBirthBC: false,
      birthYear: parseInt(BIRTH_YEAR, 10),
      birthMonth: 0,
      birthDay: 0,
      gender: parseInt(GENDER, 10)
    };
    const personHash = await deepFamily.getPersonHash(basicInfo);
    await hre.run('endorse', { person: personHash, vindex: '1' });
    await hre.run('mint-nft', {
      person: personHash,
      vindex: '1',
      tokenuri: 'ipfs://edgeNFT',
      fullname: FULLNAME,
      birthyear: BIRTH_YEAR,
      gender: GENDER,
      birthplace: 'City',
      story: 'Edge summary'
    });
    return { deepFamily, signer, other, tokenId: 1n, personHash };
  }

  it('reverts when non-owner adds chunk', async () => {
    const { deepFamily, other, tokenId } = await deployAndMint();
    await expect(
      deepFamily.connect(other).addStoryChunk(tokenId, 0, 'content', hre.ethers.ZeroHash)
    ).to.be.revertedWithCustomError(deepFamily, 'MustBeNFTHolder');
  });

  it('reverts on index mismatch (skipping index)', async () => {
    const { deepFamily, tokenId } = await deployAndMint();
    await deepFamily.addStoryChunk(tokenId, 0, 'c0', hre.ethers.ZeroHash);
    await expect(
      deepFamily.addStoryChunk(tokenId, 2, 'c2', hre.ethers.ZeroHash)
    ).to.be.revertedWithCustomError(deepFamily, 'ChunkIndexOutOfRange');
  });

  it('reverts on oversize content', async () => {
    const { deepFamily, tokenId } = await deployAndMint();
    const longStr = 'a'.repeat(1001); // > 1000
    await expect(
      deepFamily.addStoryChunk(tokenId, 0, longStr, hre.ethers.ZeroHash)
    ).to.be.revertedWithCustomError(deepFamily, 'InvalidChunkContent');
  });

  it('reverts on hash mismatch', async () => {
    const { deepFamily, tokenId } = await deployAndMint();
    const wrongHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes('DIFFERENT'));
    await expect(
      deepFamily.addStoryChunk(tokenId, 0, 'Real Content', wrongHash)
    ).to.be.revertedWithCustomError(deepFamily, 'ChunkHashMismatch');
  });

  it('cannot update after sealing', async () => {
    const { deepFamily, tokenId } = await deployAndMint();
    await deepFamily.addStoryChunk(tokenId, 0, 'c0', hre.ethers.ZeroHash);
    await deepFamily.sealStory(tokenId);
    await expect(
      deepFamily.updateStoryChunk(tokenId, 0, 'c0-new', hre.ethers.ZeroHash)
    ).to.be.revertedWithCustomError(deepFamily, 'StoryAlreadySealed');
    await expect(
      deepFamily.addStoryChunk(tokenId, 1, 'c1', hre.ethers.ZeroHash)
    ).to.be.revertedWithCustomError(deepFamily, 'StoryAlreadySealed');
  });

  it('reverts sealing with zero chunks', async () => {
    const { deepFamily, tokenId } = await deployAndMint();
    await expect(deepFamily.sealStory(tokenId)).to.be.revertedWithCustomError(
      deepFamily,
      'StoryNotFound'
    );
  });

  it('enforces MAX_STORY_CHUNKS limit', async () => {
    const { deepFamily, tokenId } = await deployAndMint();
    // Add 100 chunks (MAX_STORY_CHUNKS constant)
    for (let i = 0; i < 100; i++) {
      await deepFamily.addStoryChunk(tokenId, i, 'x' + i, hre.ethers.ZeroHash);
    }
    await expect(
      deepFamily.addStoryChunk(tokenId, 100, 'overflow', hre.ethers.ZeroHash)
    ).to.be.revertedWithCustomError(deepFamily, 'ChunkIndexOutOfRange');
  });

  it('updates fullStoryHash correctly after update', async () => {
    const { deepFamily, tokenId } = await deployAndMint();
    const c0 = 'Chunk Zero';
    const c1 = 'Chunk One';
    await deepFamily.addStoryChunk(tokenId, 0, c0, hre.ethers.ZeroHash);
    await deepFamily.addStoryChunk(tokenId, 1, c1, hre.ethers.ZeroHash);
    // Compute expected combined hash
    const h0 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(c0));
    const h1 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(c1));
    let expected = hre.ethers.keccak256(hre.ethers.solidityPacked(['bytes32','bytes32'], [h0, h1]));
    let meta = await deepFamily.storyMetadata(tokenId);
    expect(meta.fullStoryHash).to.equal(expected);

    // Update chunk 0
    const c0New = 'Chunk Zero Updated';
    await deepFamily.updateStoryChunk(tokenId, 0, c0New, hre.ethers.ZeroHash);
    const h0New = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(c0New));
    expected = hre.ethers.keccak256(hre.ethers.solidityPacked(['bytes32','bytes32'], [h0New, h1]));
    meta = await deepFamily.storyMetadata(tokenId);
    expect(meta.fullStoryHash).to.equal(expected);
  });
});
