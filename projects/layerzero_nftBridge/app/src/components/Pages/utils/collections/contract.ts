// Contract.ts
import { PublicClient, WalletClient, parseEventLogs, ContractFunctionRevertedError } from 'viem';
import { COLLECTION_ABI } from '../abi/collectionAbi';
import { NFT_MANAGER_CONFLUX } from '../constants';
import { getIpfsUrl } from './ipfs';

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: { trait_type: string; value: string }[];
}

export async function fetchUserCollections(
  address: `0x${string}`,
  publicClient: PublicClient,
  setCollections: (collections: { address: string; name: string; symbol: string; image: string }[]) => void,
  setSelectedCollection: (address: string) => void,
  setTxStatus: (status: string) => void
) {
  if (!publicClient || !address) return;
  try {
    const collectionAddresses = await publicClient.readContract({
      address: NFT_MANAGER_CONFLUX,
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
  collectionMetadataCid: string,
  setSelectedCollection: (address: string) => void,
  setCollections: (collections: { address: string; name: string; symbol: string; image: string }[]) => void,
  setTxStatus: (status: string) => void
) {
  setTxStatus('Preparing collection creation transaction...');
  const collectionImageUri = collectionImageCid ? `ipfs://${collectionImageCid}` : '';
  const contractUri = collectionMetadataCid ? `ipfs://${collectionMetadataCid}` : '';
  const hash = await walletClient.writeContract({
    address: NFT_MANAGER_CONFLUX,
    abi: COLLECTION_ABI,
    functionName: 'createCollection',
    args: [name, symbol, collectionImageUri, contractUri],
  });
  setTxStatus('Transaction sent! Waiting for confirmation...');
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status === 'reverted') {
    setTxStatus('Transaction reverted. Please check the parameters and try again.');
    return;
  }
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
  collAddress: `0x${string}`,
  address: `0x${string}`,
  publicClient: PublicClient,
  setNfts: (nfts: { tokenId: string; uri: string; image: string; name?: string }[]) => void,
  setTxStatus: (status: string) => void
) {
  if (!publicClient || !address) return;
  try {
    const tokenIds = await publicClient.readContract({
      address: NFT_MANAGER_CONFLUX,
      abi: COLLECTION_ABI,
      functionName: 'getCollectionNFTs',
      args: [collAddress],
    }) as bigint[];
    const nftList: { tokenId: string; uri: string; image: string; name?: string }[] = [];
    for (const tokenId of tokenIds) {
      try {
        const owner = await publicClient.readContract({
          address: collAddress,
          abi: COLLECTION_ABI,
          functionName: 'ownerOf',
          args: [tokenId],
        }) as `0x${string}`;
        if (owner.toLowerCase() === address.toLowerCase()) {
          const uri = await publicClient.readContract({
            address: collAddress,
            abi: COLLECTION_ABI,
            functionName: 'tokenURI',
            args: [tokenId],
          }) as string;
          let image = 'https://via.placeholder.com/150?text=NFT+Image';
          let name = `Token #${tokenId}`;
          if (uri.startsWith('ipfs://')) {
            try {
              const response = await fetch(getIpfsUrl(uri.replace('ipfs://', '')));
              const contentType = response.headers.get('content-type');
              if (contentType?.includes('application/json')) {
                const metadata: NFTMetadata = await response.json();
                console.log(`Metadata for token ${tokenId}:`, metadata); // Debug log
                image = metadata.image?.startsWith('ipfs://')
                  ? getIpfsUrl(metadata.image.replace('ipfs://', ''))
                  : metadata.image || image;
                name = metadata.name || name; // Use provided name or fallback
              } else if (contentType?.includes('image')) {
                image = getIpfsUrl(uri.replace('ipfs://', ''));
              }
            } catch (err) {
              console.error(`Failed to fetch metadata for token ${tokenId}:`, err);
              // Retry with a fallback URI if metadata.json fails
              const fallbackUri = uri + '/metadata.json';
              try {
                const fallbackResponse = await fetch(getIpfsUrl(fallbackUri.replace('ipfs://', '')));
                const fallbackContentType = fallbackResponse.headers.get('content-type');
                if (fallbackContentType?.includes('application/json')) {
                  const fallbackMetadata: NFTMetadata = await fallbackResponse.json();
                  console.log(`Fallback metadata for token ${tokenId}:`, fallbackMetadata);
                  image = fallbackMetadata.image?.startsWith('ipfs://')
                    ? getIpfsUrl(fallbackMetadata.image.replace('ipfs://', ''))
                    : fallbackMetadata.image || image;
                  name = fallbackMetadata.name || name;
                }
              } catch (fallbackErr) {
                console.error(`Failed to fetch fallback metadata for token ${tokenId}:`, fallbackErr);
              }
            }
          } else if (uri.startsWith('data:application/json;base64,')) {
            try {
              const base64 = uri.split(',')[1];
              const byteString = atob(base64);
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              const decoder = new TextDecoder();
              const jsonStr = decoder.decode(ia);
              const metadata: NFTMetadata = JSON.parse(jsonStr);
              console.log(`Base64 metadata for token ${tokenId}:`, metadata); // Debug log
              image = metadata.image?.startsWith('ipfs://')
                ? getIpfsUrl(metadata.image.replace('ipfs://', ''))
                : metadata.image || image;
              name = metadata.name || name;
            } catch (err) {
              console.error(`Failed to parse base64 metadata for token ${tokenId}:`, err);
            }
          }
          nftList.push({ tokenId: tokenId.toString(), uri, image, name });
        }
      } catch (err) {
        console.error(`Failed to fetch token ${tokenId}:`, err);
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
  collectionAddress: `0x${string}`,
  address: `0x${string}`,
  tokenUri: string,
  setNfts: (nfts: { tokenId: string; uri: string; image: string; name?: string }[]) => void,
  fetchNfts: (collAddress: `0x${string}`, address: `0x${string}`, publicClient: PublicClient, setNfts: any, setTxStatus: any) => void,
  setTxStatus: (status: string) => void
) {
  setTxStatus('Preparing mint transaction...');
  const uri = tokenUri;
  try {
    const estimatedGas = await publicClient.estimateContractGas({
      address: NFT_MANAGER_CONFLUX,
      abi: COLLECTION_ABI,
      functionName: 'mintNFT',
      args: [collectionAddress, address, uri],
      account: address,
    });
    const hash = await walletClient.writeContract({
      address: NFT_MANAGER_CONFLUX,
      abi: COLLECTION_ABI,
      functionName: 'mintNFT',
      args: [collectionAddress, address, uri],
      gas: estimatedGas * 12n / 10n, // 20% extra
    });
    setTxStatus('Transaction sent! Waiting for confirmation...');
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'reverted') {
      setTxStatus('Transaction reverted on chain. Possible reasons: you may not be the owner of the collection, invalid URI, or other contract requirements not met.');
      return;
    }
    const parsedLogs = parseEventLogs({
      abi: COLLECTION_ABI,
      logs: receipt.logs,
    });
    const mintedEvent = parsedLogs.find((log) => log.eventName === 'NFTMinted');
    if (mintedEvent) {
      const tokenId = mintedEvent.args.tokenId.toString();
      setTxStatus(`🎉 NFT minted successfully! Token ID: ${tokenId}`);
    } else {
      setTxStatus('Failed to parse token ID from transaction');
    }
    fetchNfts(collectionAddress, address, publicClient, setNfts, setTxStatus);
  } catch (err) {
    console.error('Minting error:', err);
    setTxStatus(`Failed to mint NFT: ${err?.message || "Unknown error"}`);
  }
}

export async function batchMintNFT(
  walletClient: WalletClient,
  publicClient: PublicClient,
  collectionAddress: `0x${string}`,
  address: `0x${string}`,
  uris: string[],
  setTxStatus: (status: string) => void
) {
  try {
    setTxStatus('Simulating batch mint transaction...');
    // Simulate to catch revert reasons early
    await publicClient.simulateContract({
      address: NFT_MANAGER_CONFLUX,
      abi: COLLECTION_ABI,
      functionName: 'batchMintNFT',
      args: [collectionAddress, address, uris],
      account: address,
    });
    setTxStatus('Simulation successful. Estimating gas...');
    const estimatedGas = await publicClient.estimateContractGas({
      address: NFT_MANAGER_CONFLUX,
      abi: COLLECTION_ABI,
      functionName: 'batchMintNFT',
      args: [collectionAddress, address, uris],
      account: address,
    });
    setTxStatus('Gas estimated. Preparing to send transaction...');
    const hash = await walletClient.writeContract({
      address: NFT_MANAGER_CONFLUX,
      abi: COLLECTION_ABI,
      functionName: 'batchMintNFT',
      args: [collectionAddress, address, uris],
      gas: estimatedGas * 12n / 10n, // 20% extra gas
    });
    setTxStatus('Transaction sent! Waiting for confirmation...');
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'reverted') {
      setTxStatus('Transaction reverted on chain. Possible reasons: you may not be the owner of the collection, invalid URIs, or other contract requirements not met.');
      return;
    }
    const parsedLogs = parseEventLogs({
      abi: COLLECTION_ABI,
      logs: receipt.logs,
    });
    const batchMintedEvent = parsedLogs.find((log) => log.eventName === 'NFTBatchMinted');
    if (batchMintedEvent) {
      const tokenIds = batchMintedEvent.args.tokenIds.map(id => id.toString()).join(', ');
      setTxStatus(`🎉 Batch NFTs minted successfully! Token IDs: ${tokenIds}`);
    } else {
      setTxStatus('Failed to parse batch mint details from transaction');
    }
    // Optionally, refetch NFTs here if needed
  } catch (err: any) {
    console.error('Batch minting error:', err);
    let errorMessage = `Failed to batch mint NFTs: ${err?.message || "Unknown error"}`;
    if (err instanceof ContractFunctionRevertedError) {
      let revertReason = err.shortMessage || 'Unknown revert reason';
      if (err.data && err.data.errorName === 'Error' && err.data.args && err.data.args.length > 0) {
        revertReason = err.data.args[0] as string;
      } else if (err.details) {
        revertReason = err.details;
      }
      errorMessage = `Transaction reverted: ${revertReason}`;
    } else if (err.name === 'EstimateGasExecutionError') {
      errorMessage = `Gas estimation failed: ${err.shortMessage || 'Possibly due to high gas requirements or contract error'}`;
    }
    setTxStatus(errorMessage);
  }
}