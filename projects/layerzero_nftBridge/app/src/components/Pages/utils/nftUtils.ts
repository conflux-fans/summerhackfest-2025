import { PublicClient, Address } from 'viem';
import { NFT } from './types';
import { CONFLUX_CHAIN_ID } from './constants';
import { ERC721_ABI, IMAGE_MINT_NFT_ABI } from './abis';

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
    setIsLoadingNfts(false);
    return;
  }

  setIsLoadingNfts(true);
  try {
    const nftList: NFT[] = [];

    if (chainId === 8453) {
      // Base: Use Basescan API
      const basescanApiKey = "GGTR68G4AATA131GA2W7R7RNKZJARZ5IZN";
      if (!basescanApiKey) {
        setTxStatus('Basescan API key missing. Please configure VITE_BASESCAN_API_KEY.');
        return;
      }
      let page = 1;
      const pageSize = 100;
      let hasMore = true;

      while (hasMore) {
        const url = `https://api.etherscan.io/v2/api?module=account&action=tokennfttx&address=${address}&startblock=0&endblock=latest&page=${page}&offset=${pageSize}&sort=asc&apikey=${basescanApiKey}&chainid=8453`;
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!response.ok) {
          throw new Error(`Basescan API request failed: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.status !== '1') {
          if (data.message.includes('Invalid API Key')) {
            setTxStatus('Invalid Basescan API key. Please check VITE_BASESCAN_API_KEY in your .env file or generate a new key at https://basescan.org/myaccount.');
            return;
          }
          throw new Error(data.message || 'Basescan API error');
        }

        // Process transactions to find owned NFTs
        const contractTokenMap = new Map<string, Map<string, boolean>>();
        for (const tx of data.result) {
          const contractAddress = tx.contractAddress.toLowerCase();
          const tokenId = tx.tokenID;
          const from = tx.from.toLowerCase();
          const to = tx.to.toLowerCase();

          if (!contractTokenMap.has(contractAddress)) {
            contractTokenMap.set(contractAddress, new Map<string, boolean>());
          }
          const tokenOwners = contractTokenMap.get(contractAddress)!;

          if (to === address.toLowerCase()) {
            tokenOwners.set(tokenId, true);
          }
          if (from === address.toLowerCase() && to !== address.toLowerCase()) {
            tokenOwners.set(tokenId, false);
          }
        }

        for (const [contractAddress, tokenOwners] of contractTokenMap) {
          for (const [tokenIdStr, isOwned] of tokenOwners) {
            if (!isOwned) continue;

            let tokenURI = '';
            let name = '';
            let image = '';
            try {
              // Verify ownership
              const owner = await publicClient.readContract({
                address: contractAddress as Address,
                abi: ERC721_ABI,
                functionName: 'ownerOf',
                args: [BigInt(tokenIdStr)],
              }) as Address;
              if (owner.toLowerCase() !== address.toLowerCase()) continue;

              // Check if contract is ERC-721
              const isERC721 = await publicClient.readContract({
                address: contractAddress as Address,
                abi: ERC721_ABI,
                functionName: 'supportsInterface',
                args: ['0x80ac58cd'],
              });
              if (!isERC721) {
                console.warn(`Contract ${contractAddress} is not ERC-721 for token ${tokenIdStr}`);
                continue;
              }

              // Fetch tokenURI
              try {
                tokenURI = await publicClient.readContract({
                  address: contractAddress as Address,
                  abi: ERC721_ABI,
                  functionName: 'tokenURI',
                  args: [BigInt(tokenIdStr)],
                }) as string;
              } catch (uriErr) {
                console.warn(`Failed to fetch tokenURI for token ${tokenIdStr} on contract ${contractAddress}:`, uriErr);
              }

              // Fetch metadata from tokenURI
              if (tokenURI) {
                if (tokenURI.startsWith('ipfs://')) {
                  tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
                }
                try {
                  const metadataResponse = await fetch(tokenURI, { signal: AbortSignal.timeout(5000) });
                  if (metadataResponse.ok) {
                    const metadataJson = await metadataResponse.json();
                    name = metadataJson.name || `Token #${tokenIdStr}`;
                    image = metadataJson.image || '';
                    if (image.startsWith('ipfs://')) {
                      image = image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                    } else if (image && !image.startsWith('http')) {
                      image = `https://ipfs.io/ipfs/${image}`;
                    }
                  }
                } catch (uriErr) {
                  console.warn(`Failed to fetch metadata from tokenURI for token ${tokenIdStr} on contract ${contractAddress}:`, uriErr);
                }
              }

              // Fallback name
              if (!name) {
                name = `Token #${tokenIdStr}`;
              }

              nftList.push({ tokenId: tokenIdStr, tokenURI, name, image, contractAddress });
            } catch (err) {
              console.warn(`Failed to fetch data for token ${tokenIdStr} on contract ${contractAddress}:`, err);
            }
          }
        }

        // Check for more data
        hasMore = data.result.length === pageSize;
        page += 1;
        // Avoid rate limits (5 calls/second)
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } else if (chainId === CONFLUX_CHAIN_ID) {
      // Conflux: Use ConfluxScan API (https://evmapi.confluxscan.org/nft/balances)
      let skip = 0;
      const limit = 100;
      let total = Infinity;
      const contractTokenMap = new Map<string, Map<string, boolean>>();

      // Fetch NFT contracts owned by the address
      while (skip < total) {
        const url = `https://evmapi.confluxscan.org/nft/balances?owner=${address}&limit=${limit}&skip=${skip}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!response.ok) {
          throw new Error(`ConfluxScan API request failed: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.status !== '1') {
          throw new Error(data.message || 'ConfluxScan API error');
        }

        for (const item of data.result.list) {
          const contractAddress = item.contract.toLowerCase();
          if (item.type !== 'ERC721') {
            console.warn(`Skipping non-ERC721 contract ${contractAddress}`);
            continue;
          }
          if (!contractTokenMap.has(contractAddress)) {
            contractTokenMap.set(contractAddress, new Map<string, boolean>());
          }
        }

        total = data.result.total;
        skip += limit;
        // Avoid potential rate limits
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Fetch token IDs for each contract using tokennfttx
      for (const contractAddress of contractTokenMap.keys()) {
        let page = 1;
        const pageSize = 100;
        let hasMore = true;

        while (hasMore) {
          const url = `https://evmapi.confluxscan.org/api?module=account&action=tokennfttx&contractaddress=${contractAddress}&address=${address}&page=${page}&offset=${pageSize}&sort=asc`;
          const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
          if (!response.ok) {
            console.warn(`Failed to fetch tokennfttx for contract ${contractAddress}: ${response.statusText}`);
            continue;
          }
          const data = await response.json();
          if (data.status !== '1') {
            console.warn(`ConfluxScan tokennfttx error for contract ${contractAddress}: ${data.message}`);
            continue;
          }

          const tokenOwners = contractTokenMap.get(contractAddress)!;
          for (const tx of data.result) {
            const tokenId = tx.tokenID;
            const from = tx.from.toLowerCase();
            const to = tx.to.toLowerCase();

            if (to === address.toLowerCase()) {
              tokenOwners.set(tokenId, true);
            }
            if (from === address.toLowerCase() && to !== address.toLowerCase()) {
              tokenOwners.set(tokenId, false);
            }
          }

          hasMore = data.result.length === pageSize;
          page += 1;
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      // Fetch NFT details
      for (const [contractAddress, tokenOwners] of contractTokenMap) {
        for (const [tokenIdStr, isOwned] of tokenOwners) {
          if (!isOwned) continue;

          let tokenURI = '';
          let name = '';
          let image = '';
          try {
            // Verify ownership
            const owner = await publicClient.readContract({
              address: contractAddress as Address,
              abi: ERC721_ABI,
              functionName: 'ownerOf',
              args: [BigInt(tokenIdStr)],
            }) as Address;
            if (owner.toLowerCase() !== address.toLowerCase()) continue;

            // Check if contract is ERC-721
            const isERC721 = await publicClient.readContract({
              address: contractAddress as Address,
              abi: ERC721_ABI,
              functionName: 'supportsInterface',
              args: ['0x80ac58cd'],
            });
            if (!isERC721) {
              console.warn(`Contract ${contractAddress} is not ERC-721 for token ${tokenIdStr}`);
              continue;
            }

            // Fetch tokenURI
            try {
              tokenURI = await publicClient.readContract({
                address: contractAddress as Address,
                abi: ERC721_ABI,
                functionName: 'tokenURI',
                args: [BigInt(tokenIdStr)],
              }) as string;
            } catch (uriErr) {
              console.warn(`Failed to fetch tokenURI for token ${tokenIdStr} on contract ${contractAddress}:`, uriErr);
            }

            // Try tokenMetadata for additional metadata
            try {
              const metadata = await publicClient.readContract({
                address: contractAddress as Address,
                abi: IMAGE_MINT_NFT_ABI,
                functionName: 'tokenMetadata',
                args: [BigInt(tokenIdStr)],
              }) as [string, string];
              name = metadata[0] || `Token #${tokenIdStr}`;
              const ipfsHash = metadata[1];
              if (ipfsHash && !image) {
                let metadataUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
                let metadataResponse = await fetch(metadataUrl, { signal: AbortSignal.timeout(5000) });
                if (!metadataResponse.ok) {
                  metadataUrl = `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`;
                  metadataResponse = await fetch(metadataUrl, { signal: AbortSignal.timeout(5000) });
                }
                if (metadataResponse.ok) {
                  const contentType = metadataResponse.headers.get('Content-Type') || '';
                  if (contentType.startsWith('image/')) {
                    image = metadataUrl;
                  } else if (contentType.includes('json')) {
                    const metadataJson = await metadataResponse.json();
                    image = metadataJson.image || image;
                    if (image.startsWith('ipfs://')) {
                      image = image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                    } else if (image && !image.startsWith('http')) {
                      image = `https://ipfs.io/ipfs/${image}`;
                    }
                  }
                }
              }
            } catch (metadataErr) {
              console.warn(`Failed to fetch tokenMetadata for token ${tokenIdStr} on contract ${contractAddress}:`, metadataErr);
            }

            // Fallback to tokenURI metadata
            if (!name && tokenURI) {
              if (tokenURI.startsWith('ipfs://')) {
                tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
              }
              try {
                const metadataResponse = await fetch(tokenURI, { signal: AbortSignal.timeout(5000) });
                if (metadataResponse.ok) {
                  const metadataJson = await metadataResponse.json();
                  name = metadataJson.name || `Token #${tokenIdStr}`;
                  image = metadataJson.image || image;
                  if (image.startsWith('ipfs://')) {
                    image = image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                  } else if (image && !image.startsWith('http')) {
                    image = `https://ipfs.io/ipfs/${image}`;
                  }
                }
              } catch (uriErr) {
                console.warn(`Failed to fetch metadata from tokenURI for token ${tokenIdStr} on contract ${contractAddress}:`, uriErr);
              }
            }

            // Fallback name
            if (!name) {
              name = `Token #${tokenIdStr}`;
            }

            nftList.push({ tokenId: tokenIdStr, tokenURI, name, image, contractAddress });
          } catch (err) {
            console.warn(`Failed to fetch data for token ${tokenIdStr} on contract ${contractAddress}:`, err);
          }
        }
      }
    } else {
      setTxStatus('Unsupported network for NFT fetching');
      return;
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