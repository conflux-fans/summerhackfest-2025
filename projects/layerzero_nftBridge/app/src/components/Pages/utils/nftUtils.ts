import { PublicClient, Address } from 'viem';
import { NFT } from './types/types';
import { ERC721_ABI } from './abi/bridgeAbi';
import { CONFLUX_CHAIN_ID, BASE_CHAIN_ID, /* ETH_SEPOLIA_CHAIN_ID, BASE_SEPOLIA_CHAIN_ID, */ ARBITRUM_CHAIN_ID } from './constants';
interface ChainApiConfig {
apiBaseUrl: string;
apiKey: string;
balancesEndpoint: string | null; // null for Etherscan-style; URL template for Conflux-style
tokenNftTxAction: string;
isConfluxStyle: boolean;
chainIdParam?: number; // For unified Etherscan V2 with chainid
}
const chainApiConfigs: Record<number, ChainApiConfig> = {
[CONFLUX_CHAIN_ID]: {
apiBaseUrl: 'https://evmapi.confluxscan.org',
apiKey: '', // ConfluxScan doesn't require API key
balancesEndpoint: 'nft/balances',
tokenNftTxAction: 'tokennfttx',
isConfluxStyle: true,
  },
[BASE_CHAIN_ID]: {
apiBaseUrl: 'https://api.etherscan.io/v2',
apiKey: 'GGTR68G4AATA131GA2W7R7RNKZJARZ5IZN',
balancesEndpoint: null,
tokenNftTxAction: 'tokennfttx',
isConfluxStyle: false,
chainIdParam: 8453,
  },
// [ETH_SEPOLIA_CHAIN_ID]: {
// apiBaseUrl: 'https://api.etherscan.io/v2',
// apiKey: 'GGTR68G4AATA131GA2W7R7RNKZJARZ5IZN',
// balancesEndpoint: null,
// tokenNftTxAction: 'tokennfttx',
// isConfluxStyle: false,
// chainIdParam: 11155111,
//   },
// [BASE_SEPOLIA_CHAIN_ID]: {
// apiBaseUrl: 'https://api.etherscan.io/v2',
// apiKey: 'GGTR68G4AATA131GA2W7R7RNKZJARZ5IZN',
// balancesEndpoint: null,
// tokenNftTxAction: 'tokennfttx',
// isConfluxStyle: false,
// chainIdParam: 84532,
//   },
[ARBITRUM_CHAIN_ID]: {
apiBaseUrl: 'https://api.etherscan.io/v2',
apiKey: 'GGTR68G4AATA131GA2W7R7RNKZJARZ5IZN',
balancesEndpoint: null,
tokenNftTxAction: 'tokennfttx',
isConfluxStyle: false,
chainIdParam: 42161,
  },
};
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
const config = chainApiConfigs[chainId];
if (!config) {
setTxStatus('Unsupported network for NFT fetching');
setIsLoadingNfts(false);
return;
  }
setIsLoadingNfts(true);
try {
const nftList: NFT[] = [];
const contractTokenMap = new Map<
string,
Map<string, { isOwned: boolean; tokenName?: string; tokenSymbol?: string }>
>();
if (config.isConfluxStyle && config.balancesEndpoint) {
// Conflux-style: Fetch contracts via balances endpoint
let skip = 0;
const limit = 100;
let total = Infinity;
while (skip < total) {
const url = `${config.apiBaseUrl}/${config.balancesEndpoint}?owner=${address}&limit=${limit}&skip=${skip}`;
const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
if (!response.ok) {
throw new Error(`API request failed: ${response.statusText}`);
        }
const data = await response.json();
if (data.status !== '1') {
throw new Error(data.message || 'API error');
        }
for (const item of data.result.list) {
const contractAddress = item.contract.toLowerCase();
if (item.type !== 'ERC721') continue;
if (!contractTokenMap.has(contractAddress)) {
contractTokenMap.set(contractAddress, new Map());
          }
        }
total = data.result.total;
skip += limit;
await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } else {
// Etherscan-style: Fetch transactions via tokennfttx
let page = 1;
const pageSize = 100;
let hasMore = true;
while (hasMore) {
const url = `${config.apiBaseUrl}/api?module=account&action=${
config.tokenNftTxAction
}&address=${address}&startblock=0&endblock=latest&page=${page}&offset=${pageSize}&sort=asc&apikey=${
config.apiKey
}&chainid=${config.chainIdParam}`;
const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
if (!response.ok) {
throw new Error(`API request failed: ${response.statusText}`);
        }
const data = await response.json();
if (data.status !== '1') {
if (data.message.includes('Invalid API Key')) {
setTxStatus('Invalid API key. Please check your API key configuration.');
return;
          }
throw new Error(data.message || 'API error');
        }
for (const tx of data.result) {
const contractAddress = tx.contractAddress.toLowerCase();
const tokenId = tx.tokenID;
const from = tx.from.toLowerCase();
const to = tx.to.toLowerCase();
const tokenName = tx.tokenName || `Token #${tokenId}`;
const tokenSymbol = tx.tokenSymbol || '';
if (!contractTokenMap.has(contractAddress)) {
contractTokenMap.set(contractAddress, new Map());
          }
const tokenOwners = contractTokenMap.get(contractAddress)!;
if (to === address.toLowerCase()) {
tokenOwners.set(tokenId, { isOwned: true, tokenName, tokenSymbol });
          }
if (from === address.toLowerCase() && to !== address.toLowerCase()) {
tokenOwners.set(tokenId, { isOwned: false, tokenName, tokenSymbol });
          }
        }
hasMore = data.result.length === pageSize;
page += 1;
await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
// Fetch token IDs for Conflux-style if needed
if (config.isConfluxStyle) {
for (const contractAddress of contractTokenMap.keys()) {
let page = 1;
const pageSize = 100;
let hasMore = true;
while (hasMore) {
const url = `${config.apiBaseUrl}/api?module=account&action=${
config.tokenNftTxAction
}&contractaddress=${contractAddress}&address=${address}&page=${page}&offset=${pageSize}&sort=asc`;
const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
if (!response.ok) {
console.warn(`Failed to fetch tokennfttx for contract ${contractAddress}: ${response.statusText}`);
continue;
          }
const data = await response.json();
if (data.status !== '1') {
console.warn(`API tokennfttx error for contract ${contractAddress}: ${data.message}`);
continue;
          }
const tokenOwners = contractTokenMap.get(contractAddress)!;
for (const tx of data.result) {
const tokenId = tx.tokenID;
const from = tx.from.toLowerCase();
const to = tx.to.toLowerCase();
const tokenName = tx.tokenName || `Token #${tokenId}`;
const tokenSymbol = tx.tokenSymbol || '';
if (to === address.toLowerCase()) {
tokenOwners.set(tokenId, { isOwned: true, tokenName, tokenSymbol });
            }
if (from === address.toLowerCase() && to !== address.toLowerCase()) {
tokenOwners.set(tokenId, { isOwned: false, tokenName, tokenSymbol });
            }
          }
hasMore = data.result.length === pageSize;
page += 1;
await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
    }
// Fetch NFT details using standard ERC721 metadata
for (const [contractAddress, tokenOwners] of contractTokenMap) {
for (const [tokenIdStr, { isOwned, tokenName, tokenSymbol }] of tokenOwners) {
if (!isOwned) continue;
let tokenURI = '';
let name = tokenName || `Token #${tokenIdStr}`;
let image = '';
try {
// Verify ownership
const owner = (await publicClient.readContract({
address: contractAddress as Address,
abi: ERC721_ABI,
functionName: 'ownerOf',
args: [BigInt(tokenIdStr)],
          })) as Address;
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
tokenURI = (await publicClient.readContract({
address: contractAddress as Address,
abi: ERC721_ABI,
functionName: 'tokenURI',
args: [BigInt(tokenIdStr)],
            })) as string;
          } catch (uriErr) {
console.warn(`Failed to fetch tokenURI for token ${tokenIdStr} on contract ${contractAddress}:`, uriErr);
          }
// Fetch metadata from tokenURI
if (tokenURI) {
let metadataUrl = tokenURI;
if (tokenURI.startsWith('ipfs://')) {
metadataUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }
try {
let metadataResponse = await fetch(metadataUrl, { signal: AbortSignal.timeout(5000) });
if (!metadataResponse.ok) {
// Fallback to Cloudflare IPFS gateway
metadataUrl = tokenURI.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/');
metadataResponse = await fetch(metadataUrl, { signal: AbortSignal.timeout(5000) });
              }
if (metadataResponse.ok) {
const contentType = metadataResponse.headers.get('Content-Type') || '';
if (contentType.includes('json')) {
const metadataJson = await metadataResponse.json();
name = metadataJson.name || name;
image = metadataJson.image || '';
if (image.startsWith('ipfs://')) {
image = image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                  } else if (image && !image.startsWith('http')) {
image = `https://ipfs.io/ipfs/${image}`;
                  }
                } else if (contentType.startsWith('image/')) {
image = metadataUrl;
                }
              }
            } catch (metadataErr) {
console.warn(`Failed to fetch metadata for token ${tokenIdStr} on contract ${contractAddress}:`, metadataErr);
            }
          }
// Fallback name if still not set
if (!name) {
name = `Token #${tokenIdStr}`;
          }
nftList.push({
tokenId: tokenIdStr,
tokenURI,
name: `${name} (${tokenSymbol || ''})`,
image,
contractAddress,
          });
        } catch (err) {
console.warn(`Failed to fetch data for token ${tokenIdStr} on contract ${contractAddress}:`, err);
        }
      }
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