import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import NFTDisplay from '../components/NFTDisplay';
import { 
  getWalletState, 
  simulateGetCollections,
  simulateGetUserNFTs,
  simulateVerifyOwnership,
  MockCollection,
  MockNFT
} from '../utils/simulation';

const NFTShowcasePage: React.FC = () => {
  const [collections, setCollections] = useState<MockCollection[]>([]);
  const [userNFTs, setUserNFTs] = useState<MockNFT[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<MockCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const wallet = getWalletState();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCollection && wallet.connected) {
      loadUserNFTs();
    }
  }, [selectedCollection, wallet.connected]);

  const loadData = async () => {
    try {
      setLoading(true);
      const collectionsData = await simulateGetCollections();
      setCollections(collectionsData);
      
      if (collectionsData.length > 0 && !selectedCollection) {
        setSelectedCollection(collectionsData[0]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserNFTs = async () => {
    if (!selectedCollection || !wallet.connected) return;
    
    try {
      const nfts = await simulateGetUserNFTs();
      const collectionNFTs = nfts.filter(nft => 
        nft.contractAddress.toLowerCase() === selectedCollection.contractAddress.toLowerCase()
      );
      setUserNFTs(collectionNFTs);
    } catch (error) {
      console.error('Failed to load user NFTs:', error);
    }
  };

  const handleVerifyNFT = async (nft: MockNFT) => {
    if (!wallet.connected) {
      alert('Please connect your wallet first');
      return;
    }

    setVerifying(true);
    try {
      const verification = await simulateVerifyOwnership(
        nft.contractAddress,
        `Verification for ${nft.name}`,
        'NFT Showcase Demo'
      );

      setVerificationResult(verification);

      if (verification.result === 'success') {
        alert(`✅ NFT verified successfully!\n\n${nft.name}\nToken ID: ${verification.tokenId}\n\nThis NFT can now be used for real-world access!`);
      } else {
        alert(`❌ Verification failed: ${verification.reason}`);
      }
    } catch (error) {
      alert('Verification failed: ' + error);
    } finally {
      setVerifying(false);
    }
  };

  const handleTransferNFT = (nft: MockNFT) => {
    alert(`Transfer functionality would be implemented here for ${nft.name}`);
  };

  const handleViewDetails = (nft: MockNFT) => {
    alert(`View details for ${nft.name}\n\nThis would open a detailed modal or navigate to a dedicated page.`);
  };

  if (loading) {
    return (
      <div className="py-3xl">
        <div className="container">
          <div className="text-center">
            <p className="text-muted">Loading NFT showcase...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3xl">
      <div className="container">
        <div className="text-center mb-3xl">
          <h1 className="mb-lg">NFT Showcase & Verification Flow</h1>
          <p className="text-xl text-muted">
            Experience the complete NFT ownership verification process with your example NFT
          </p>
        </div>

        {/* Wallet Status */}
        <Card className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text mb-2">Wallet Status</h2>
              {wallet.connected ? (
                <div className="space-y-1">
                  <p className="text-text">Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</p>
                  <p className="text-success">Balance: {wallet.balance} CFX</p>
                </div>
              ) : (
                <p className="text-muted">Please connect your wallet to view and verify NFTs</p>
              )}
            </div>
            <div className="text-6xl">🎫</div>
          </div>
        </Card>

        {/* Collection Selection */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-text">Select Collection</h2>
          <div className="grid grid-3 gap-4">
            {collections.map((collection) => (
              <div
                key={collection.id}
                onClick={() => setSelectedCollection(collection)}
                className={`p-4 border rounded-xl cursor-pointer transition-all ${
                  selectedCollection?.id === collection.id
                    ? 'border-accent bg-accent bg-opacity-10'
                    : 'border-border hover:border-border-hover'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-weak rounded-lg flex items-center justify-center">
                    <span className="text-bg font-bold text-lg">{collection.symbol[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">{collection.name}</h3>
                    <p className="text-sm text-muted">{collection.symbol}</p>
                    <p className="text-xs text-muted capitalize">{collection.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* NFT Display */}
        {selectedCollection && (
          <Card className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-text">
              Your NFTs in {selectedCollection.name}
            </h2>
            
            {!wallet.connected ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-bg text-2xl">🔗</span>
                </div>
                <p className="text-muted mb-4">Connect your wallet to view your NFTs</p>
                <p className="text-muted text-sm">Click "Connect Wallet" in the header to get started</p>
              </div>
            ) : userNFTs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-surface rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-muted text-2xl">📭</span>
                </div>
                <p className="text-muted">No NFTs found in this collection</p>
                <p className="text-muted text-sm">Try selecting a different collection or connect a different wallet</p>
              </div>
            ) : (
              <div className="grid grid-3 gap-6">
                {userNFTs.map((nft) => (
                  <NFTDisplay
                    key={nft.tokenId}
                    nft={{
                      id: nft.tokenId.toString(),
                      tokenId: nft.tokenId.toString(),
                      name: nft.name,
                      description: nft.description,
                      image: nft.imageUrl,
                      contractAddress: nft.contractAddress,
                      rarity: nft.rarity > 90 ? 'Legendary' : nft.rarity > 80 ? 'Epic' : nft.rarity > 60 ? 'Rare' : nft.rarity > 30 ? 'Uncommon' : 'Common',
                      traits: nft.traits.reduce((acc, trait) => {
                        acc[trait.trait_type] = trait.value;
                        return acc;
                      }, {} as Record<string, string>),
                      owner: nft.owner,
                      verified: true
                    }}
                    onVerify={() => handleVerifyNFT(nft)}
                    onTransfer={() => handleTransferNFT(nft)}
                    onViewDetails={() => handleViewDetails(nft)}
                  />
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <Card className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-text">Verification Result</h2>
            <div className={`p-4 rounded-xl ${
              verificationResult.result === 'success' 
                ? 'bg-success bg-opacity-10 border border-success'
                : 'bg-danger bg-opacity-10 border border-danger'
            }`}>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">
                  {verificationResult.result === 'success' ? '✅' : '❌'}
                </span>
                <h3 className={`text-lg font-semibold ${
                  verificationResult.result === 'success' ? 'text-success' : 'text-danger'
                }`}>
                  {verificationResult.result === 'success' ? 'Verification Successful' : 'Verification Failed'}
                </h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Event:</strong> {verificationResult.eventName}</p>
                <p><strong>Location:</strong> {verificationResult.location}</p>
                <p><strong>Method:</strong> {verificationResult.verificationMethod}</p>
                <p><strong>Timestamp:</strong> {new Date(verificationResult.timestamp).toLocaleString()}</p>
                {verificationResult.tokenId && (
                  <p><strong>Token ID:</strong> #{verificationResult.tokenId}</p>
                )}
                {verificationResult.reason && (
                  <p><strong>Reason:</strong> {verificationResult.reason}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Flow Explanation */}
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-text">How the Verification Flow Works</h2>
          <div className="grid grid-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-bg text-2xl">1</span>
              </div>
              <h3 className="font-semibold text-text mb-2">Own NFT</h3>
              <p className="text-sm text-muted">
                You own an NFT that grants access to real-world benefits or experiences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-weak rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-bg text-2xl">2</span>
              </div>
              <h3 className="font-semibold text-text mb-2">Sign Proof</h3>
              <p className="text-sm text-muted">
                Cryptographically sign a message to prove ownership without transferring the NFT.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-success rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-bg text-2xl">3</span>
              </div>
              <h3 className="font-semibold text-text mb-2">Get Access</h3>
              <p className="text-sm text-muted">
                Receive instant verification and access to the real-world benefit or experience.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NFTShowcasePage;
