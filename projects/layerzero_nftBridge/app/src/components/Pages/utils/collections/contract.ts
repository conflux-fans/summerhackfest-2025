import { PublicClient, WalletClient, parseEventLogs } from 'viem';
import { COLLECTION_ABI } from '../abi/collectionAbi';
import { NFT_MANAGER_BASE_SEPOLIA } from '../constants';
import { getIpfsUrl } from './ipfs';

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: { trait_type: string; value: string }[];
}

export async function fetchUserCollections(
  address: string,
  publicClient: PublicClient,
  setCollections: (collections: { address: string; name: string; symbol: string; image: string }[]) => void,
  setSelectedCollection: (address: string) => void,
  setTxStatus: (status: string) => void
) {
  if (!publicClient || !address) return;
  try {
    const collectionAddresses = await publicClient.readContract({
      address: NFT_MANAGER_BASE_SEPOLIA,
      abi: COLLECTION_ABI,
      functionName: 'getUserCollections',
      args: [address],
    }) as `0x${string}`[];
    const userCollections = [];
    for (const collAddress of collectionAddresses) {
      try {
        const name = await publicClient.readContract({
          address: collAddress,
          abi: COLLECTION_ABI,
          functionName: 'name',
        }) as string;
        const symbol = await publicClient.readContract({
          address: collAddress,
          abi: COLLECTION_ABI,
          functionName: 'symbol',
        }) as string;
        const imageCid = await publicClient.readContract({
          address: collAddress,
          abi: COLLECTION_ABI,
          functionName: 'collectionImage',
        }) as string;
        const image = imageCid ? getIpfsUrl(imageCid.replace('ipfs://', '')) : 'https://via.placeholder.com/150?text=Collection+Image';
        userCollections.push({ address: collAddress, name, symbol, image });
      } catch (err) {
        console.error(`Failed to fetch details for collection ${collAddress}:`, err);
      }
    }
    setCollections(userCollections);
  } catch (err) {
    console.error('Failed to fetch collections:', err);
    setTxStatus('Failed to fetch collections. Please check your RPC provider.');
  }
}

export async function createCollection(
  walletClient: WalletClient,
  publicClient: PublicClient,
  name: string,
  symbol: string,
  collectionImageCid: string,
  setSelectedCollection: (address: string) => void,
  setCollections: (collections: { address: string; name: string; symbol: string; image: string }[]) => void,
  setTxStatus: (status: string) => void
) {
  setTxStatus('Preparing collection creation transaction...');
  const contractURI = collectionImageCid
    ? `ipfs://${collectionImageCid}/metadata.json` // Assuming metadata JSON is at CID/metadata.json
    : '';
  const hash = await walletClient.writeContract({
    address: NFT_MANAGER_BASE_SEPOLIA,
    abi: COLLECTION_ABI,
    functionName: 'createCollection',
    args: [name, symbol, collectionImageCid ? `ipfs://${collectionImageCid}` : '', contractURI],
  });
  setTxStatus('Transaction sent! Waiting for confirmation...');
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const newCollectionAddress = receipt.logs
    .map((log) => {
      try {
        const parsed = parseEventLogs({
          abi: COLLECTION_ABI,
          logs: [log],
        })[0];
        return parsed.eventName === 'CollectionCreated' ? parsed.args.collection : null;
      } catch {
        return null;
      }
    })
    .find((addr) => addr) as `0x${string}`;
  if (newCollectionAddress) {
    setSelectedCollection(newCollectionAddress);
    const image = collectionImageCid
      ? getIpfsUrl(collectionImageCid)
      : 'https://via.placeholder.com/150?text=Collection+Image';
    setCollections((prev) => [
      ...prev,
      { address: newCollectionAddress, name, symbol, image },
    ]);
    setTxStatus(`Collection created successfully at ${newCollectionAddress}!`);
  } else {
    setTxStatus('Failed to parse collection address from transaction');
  }
}

export async function fetchNfts(
  collAddress: string,
  address: string,
  publicClient: PublicClient,
  setNfts: (nfts: { tokenId: string; uri: string; image: string }[]) => void,
  setTxStatus: (status: string) => void
) {
  if (!publicClient || !address) return;
  try {
    setNfts([]);
    const tokenIds = await publicClient.readContract({
      address: NFT_MANAGER_BASE_SEPOLIA,
      abi: COLLECTION_ABI,
      functionName: 'getCollectionNFTs',
      args: [collAddress],
    }) as bigint[];
    const nftList: { tokenId: string; uri: string; image: string }[] = [];
    for (const tokenId of tokenIds) {
      try {
        const owner = await publicClient.readContract({
          address: collAddress as `0x${string}`,
          abi: COLLECTION_ABI,
          functionName: 'ownerOf',
          args: [tokenId],
        });
        if (owner.toLowerCase() === address.toLowerCase()) {
          const uri = await publicClient.readContract({
            address: collAddress as `0x${string}`,
            abi: COLLECTION_ABI,
            functionName: 'tokenURI',
            args: [tokenId],
          }) as string;
          let image = 'https://via.placeholder.com/150?text=NFT+Image';
          if (uri.startsWith('ipfs://')) {
            try {
              const response = await fetch(getIpfsUrl(uri.replace('ipfs://', '')));
              const metadata: NFTMetadata = await response.json();
              image = metadata.image?.startsWith('ipfs://')
                ? getIpfsUrl(metadata.image.replace('ipfs://', ''))
                : metadata.image || image;
            } catch (err) {
              console.error(`Failed to fetch metadata for token ${tokenId}:`, err);
            }
          }
          nftList.push({ tokenId: tokenId.toString(), uri, image });
        }
      } catch {
        // Skip burned or invalid tokens
      }
    }
    setNfts(nftList);
  } catch (err) {
    console.error('Failed to fetch NFTs:', err);
    setTxStatus('Failed to fetch NFTs for collection. Please check your RPC provider.');
  }
}

export async function mintNFT(
  walletClient: WalletClient,
  publicClient: PublicClient,
  collectionAddress: string,
  address: string,
  tokenId: string,
  ipfsCid: string,
  setNfts: (nfts: { tokenId: string; uri: string; image: string }[]) => void,
  fetchNfts: (collAddress: string, address: string, publicClient: PublicClient, setNfts: any, setTxStatus: any) => void,
  setTxStatus: (status: string) => void
) {
  setTxStatus('Preparing mint transaction...');
  const uri = `ipfs://${ipfsCid}`;
  const hash = await walletClient.writeContract({
    address: NFT_MANAGER_BASE_SEPOLIA,
    abi: COLLECTION_ABI,
    functionName: 'mintNFT',
    args: [collectionAddress, address, BigInt(tokenId), uri],
  });
  setTxStatus('Transaction sent! Waiting for confirmation...');
  await publicClient.waitForTransactionReceipt({ hash });
  setTxStatus(`🎉 NFT minted successfully! Token ID: ${tokenId}`);
  fetchNfts(collectionAddress, address, publicClient, setNfts, setTxStatus);
}