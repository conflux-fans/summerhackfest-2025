import { PublicClient, Address } from 'viem';
import { NFT } from './types';
import { IMAGE_MINT_NFT_ADDRESS, BASE_WRAPPED_ADDRESS, CONFLUX_CHAIN_ID } from './constants';
import { IMAGE_MINT_NFT_ABI, BASE_WRAPPED_ABI } from './abis';

export const fetchNFTs = async (
  publicClient: PublicClient | undefined,
  address: Address | undefined,
  chainId: number,
  setNfts: (nfts: NFT[]) => void,
  setTxStatus: (status: string) => void,
  setIsLoadingNfts: (loading: boolean) => void
) => {
  if (!publicClient || !address) {
    setTxStatus('Missing wallet or public client');
    return;
  }
  setIsLoadingNfts(true);
  try {
    const contractAddress = chainId === CONFLUX_CHAIN_ID ? IMAGE_MINT_NFT_ADDRESS : BASE_WRAPPED_ADDRESS;
    const abi = chainId === CONFLUX_CHAIN_ID ? IMAGE_MINT_NFT_ABI : BASE_WRAPPED_ABI;
    const transferEvents = await publicClient.getLogs({
      address: contractAddress,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { type: 'address', indexed: true, name: 'from' },
          { type: 'address', indexed: true, name: 'to' },
          { type: 'uint256', indexed: true, name: 'tokenId' }
        ]
      },
      fromBlock: BigInt(0),
      toBlock: 'latest'
    });
    const ownedTokenIds = new Set<string>();
    for (const event of transferEvents) {
      const { from, to, tokenId } = event.args as { from: Address; to: Address; tokenId: bigint };
      if (to.toLowerCase() === address.toLowerCase()) {
        ownedTokenIds.add(tokenId.toString());
      }
      if (from.toLowerCase() === address.toLowerCase() && to !== address) {
        ownedTokenIds.delete(tokenId.toString());
      }
    }
    const nftList: NFT[] = [];
    for (const tokenId of ownedTokenIds) {
      let tokenURI = '';
      let name = '';
      let image = '';
      try {
        const owner = await publicClient.readContract({
          address: contractAddress,
          abi,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        }) as Address;
        if (owner.toLowerCase() !== address.toLowerCase()) {
          continue;
        }
        tokenURI = await publicClient.readContract({
          address: contractAddress,
          abi,
          functionName: 'tokenURI',
          args: [BigInt(tokenId)],
        }) as string;
        if (chainId === CONFLUX_CHAIN_ID) {
          const metadata = await publicClient.readContract({
            address: contractAddress,
            abi: IMAGE_MINT_NFT_ABI,
            functionName: 'tokenMetadata',
            args: [BigInt(tokenId)],
          }) as [string, string];
          name = metadata[0];
          const ipfsHash = metadata[1];
          if (ipfsHash) {
            // Try primary IPFS gateway
            let metadataResponse = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`, { signal: AbortSignal.timeout(5000) });
            if (!metadataResponse.ok) {
              // Fallback to Cloudflare IPFS gateway
              metadataResponse = await fetch(`https://cloudflare-ipfs.com/ipfs/${ipfsHash}`, { signal: AbortSignal.timeout(5000) });
            }
            if (metadataResponse.ok) {
              const metadataJson = await metadataResponse.json();
              image = metadataJson.image || '';
              if (image.startsWith('ipfs://')) {
                image = image.replace('ipfs://', 'https://ipfs.io/ipfs/');
              } else if (image && !image.startsWith('http')) {
                image = `https://ipfs.io/ipfs/${image}`;
              }
            }
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch data for token ${tokenId}:`, err);
      }
      nftList.push({ tokenId, tokenURI, name, image });
    }
    setNfts(nftList);
    if (nftList.length === 0) {
      setTxStatus('No NFTs found in your wallet');
    }
  } catch (err: any) {
    console.error('Failed to fetch NFTs:', err);
    setTxStatus(`Failed to load NFT inventory: ${err?.message || err}`);
  } finally {
    setIsLoadingNfts(false);
  }
};