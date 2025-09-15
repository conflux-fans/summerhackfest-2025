import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import FormField from '../components/FormField';
import NFTDisplay from '../components/NFTDisplay';
import { 
  simulateVerifyOwnership, 
  simulateSignMessage, 
  getWalletState, 
  simulateGetCollections,
  simulateGetVerificationHistory,
  simulateGetUserNFTs,
  simulateGenerateSessionCode,
  simulateVerifyWalletOwnership,
  MockCollection,
  MockVerificationDetailed,
  MockNFT
} from '../utils/simulation';

type UserRole = 'owner' | 'verifier';

const VerifyPage: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>('owner');
  const [collections, setCollections] = useState<MockCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<MockCollection | null>(null);
  const [userNFTs, setUserNFTs] = useState<MockNFT[]>([]);
  const [verificationHistory, setVerificationHistory] = useState<MockVerificationDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  
  // Owner flow states
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [generatedSessionCode, setGeneratedSessionCode] = useState<string>('');
  const [sessionExpiry, setSessionExpiry] = useState<string>('');

  // Verifier flow states
  const [targetWalletAddress, setTargetWalletAddress] = useState('');
  const [sessionCodeToCheck, setSessionCodeToCheck] = useState('');
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
      const [collectionsData, historyData] = await Promise.all([
        simulateGetCollections(),
        wallet.connected ? simulateGetVerificationHistory() : Promise.resolve([])
      ]);
      
      setCollections(collectionsData);
      setVerificationHistory(historyData);
      
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

  // Owner Functions
  const handleProveOwnership = async () => {
    if (!selectedCollection || !wallet.connected) {
      alert('Please connect your wallet and select a collection');
      return;
    }

    setVerifying(true);
    try {
      const verification = await simulateVerifyOwnership(
        selectedCollection.contractAddress,
        eventName || `${selectedCollection.name} Ownership Proof`,
        location || 'Online Verification'
      );

      await loadData();

      if (verification.result === 'success') {
        alert(`✅ Ownership proven successfully!\n\nToken ID: ${verification.tokenId}\nEvent: ${verification.eventName}\n\nYou can now show this verification to any verifier.`);
      } else {
        alert(`❌ Ownership proof failed: ${verification.reason}`);
      }
    } catch (error) {
      alert('Ownership proof failed: ' + error);
    } finally {
      setVerifying(false);
    }
  };

  const handleGenerateSessionCode = async () => {
    if (!selectedCollection || !wallet.connected) {
      alert('Please connect your wallet and select a collection');
      return;
    }

    if (userNFTs.length === 0) {
      alert('You must own at least one NFT in this collection to generate a session code');
      return;
    }

    setVerifying(true);
    try {
      const { sessionCode, expiresAt } = await simulateGenerateSessionCode(eventName, location);
      
      setGeneratedSessionCode(sessionCode);
      setSessionExpiry(expiresAt);
      
      alert(`🎫 Session code generated!\n\nCode: ${sessionCode}\nExpires: ${new Date(expiresAt).toLocaleString()}\n\nShare this code with the verifier to prove your ownership.`);
    } catch (error) {
      alert('Failed to generate session code: ' + error);
    } finally {
      setVerifying(false);
    }
  };

  // Verifier Functions
  const handleCheckWalletOwnership = async () => {
    if (!selectedCollection || !targetWalletAddress) {
      alert('Please select a collection and enter a wallet address');
      return;
    }

    setVerifying(true);
    try {
      const result = await simulateVerifyWalletOwnership(targetWalletAddress, selectedCollection.contractAddress);
      setVerificationResult(result);
      
      if (result.success) {
        alert(`✅ Ownership confirmed!\n\nWallet: ${result.ownershipDetails?.walletAddress}\nNFTs owned: ${result.ownershipDetails?.balance}\nToken IDs: ${result.ownershipDetails?.tokenIds.join(', ')}`);
      } else {
        alert(`❌ Ownership verification failed: ${result.reason}`);
      }
    } catch (error) {
      alert('Verification failed: ' + error);
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifySessionCode = async () => {
    if (!sessionCodeToCheck.trim()) {
      alert('Please enter a session code');
      return;
    }

    setVerifying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate session code verification
      if (!/^\d{6}$/.test(sessionCodeToCheck)) {
        throw new Error('Invalid session code format');
      }
      
      // In demo, we'll say it's valid if it matches our generated code or is 123456
      const isValid = sessionCodeToCheck === generatedSessionCode || sessionCodeToCheck === '123456';
      
      if (isValid) {
        setVerificationResult({
          success: true,
          sessionCode: sessionCodeToCheck,
          ownershipDetails: {
            walletAddress: wallet.address,
            collectionName: selectedCollection?.name,
            verified: true
          }
        });
        alert(`✅ Session code verified!\n\nCode: ${sessionCodeToCheck}\nOwnership confirmed for: ${selectedCollection?.name}`);
      } else {
        throw new Error('Invalid or expired session code');
      }
    } catch (error) {
      setVerificationResult({
        success: false,
        reason: error instanceof Error ? error.message : 'Verification failed'
      });
      alert(`❌ Session code verification failed: ${error}`);
    } finally {
      setVerifying(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="py-3xl">
        <div className="container max-w-6xl">
          <div className="text-center">
            <p className="text-muted">Loading verification data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3xl">
      <div className="container max-w-6xl">
        <div className="text-center mb-3xl">
          <h1 className="mb-lg">NFT Ownership Verification</h1>
          <p className="text-xl text-muted">
            Choose your role: Prove you own an NFT or verify someone else's ownership
          </p>
        </div>

        {/* Role Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-surface border border-border rounded-xl p-2 flex">
            <button
              onClick={() => setUserRole('owner')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                userRole === 'owner'
                  ? 'bg-accent text-bg'
                  : 'text-muted hover:text-text'
              }`}
            >
              👤 I Own NFTs (Prove Ownership)
            </button>
            <button
              onClick={() => setUserRole('verifier')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                userRole === 'verifier'
                  ? 'bg-accent text-bg'
                  : 'text-muted hover:text-text'
              }`}
            >
              🔍 I Need to Check (Verify Others)
            </button>
          </div>
        </div>

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

        {/* Owner Interface */}
        {userRole === 'owner' && (
          <div className="grid grid-2 gap-8">
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-text">🔐 Prove Your Ownership</h2>
              
              {!wallet.connected ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-bg text-2xl">🔗</span>
                  </div>
                  <p className="text-muted mb-4">Connect your wallet to prove NFT ownership</p>
                  <p className="text-muted text-sm">Click "Connect Wallet" in the header to get started</p>
                </div>
              ) : selectedCollection ? (
                <div className="space-y-6">
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <h3 className="font-semibold text-text mb-2">{selectedCollection.name}</h3>
                    <div className="text-sm text-muted space-y-1">
                      <div>Contract: {selectedCollection.contractAddress.slice(0, 10)}...{selectedCollection.contractAddress.slice(-8)}</div>
                      <div>Your NFTs: {userNFTs.length}</div>
                    </div>
                  </div>

                  {userNFTs.length > 0 && (
                    <div>
                      <h4 className="font-medium text-text mb-3">Your NFTs</h4>
                      <div className="grid grid-2 gap-4">
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
                            showActions={false}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <FormField label="Event Name (Optional)">
                      <input
                        type="text"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        placeholder="e.g., VIP Event Access, Membership Verification"
                        className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </FormField>

                    <FormField label="Location (Optional)">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Convention Center, Online Event"
                        className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </FormField>

                    <div className="grid grid-2 gap-4">
                      <Button
                        variant="primary"
                        onClick={handleProveOwnership}
                        disabled={verifying || userNFTs.length === 0}
                      >
                        {verifying ? 'Proving...' : '🔐 Prove Ownership'}
                      </Button>
                      
                      <Button
                        variant="secondary"
                        onClick={handleGenerateSessionCode}
                        disabled={verifying || userNFTs.length === 0}
                      >
                        {verifying ? 'Generating...' : '🎫 Generate Code'}
                      </Button>
                    </div>

                    {generatedSessionCode && (
                      <div className="bg-success bg-opacity-10 border border-success rounded-xl p-4">
                        <h4 className="font-semibold text-success mb-2">Your Session Code</h4>
                        <div className="text-center">
                          <div className="text-3xl font-mono font-bold text-success mb-2">
                            {generatedSessionCode}
                          </div>
                          <p className="text-sm text-success">
                            Expires: {new Date(sessionExpiry).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted mt-2">
                            Share this code with the verifier to prove ownership
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted">Please select a collection to prove ownership</p>
              )}
            </Card>

            <Card>
              <h2 className="text-xl font-semibold mb-4 text-text">📋 My Verification History</h2>
              
              {verificationHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted">No verifications yet. Prove ownership to see history!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {verificationHistory.slice(0, 5).map((verification) => {
                    const collection = collections.find(c => c.contractAddress === verification.contractAddress);
                    return (
                      <div key={verification.id} className="bg-surface border border-border rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`w-4 h-4 rounded-full ${
                            verification.result === 'success' ? 'bg-success' : 'bg-danger'
                          }`}></span>
                          <h4 className="font-medium text-text text-sm">{verification.eventName}</h4>
                        </div>
                        <p className="text-xs text-muted">{collection?.name}</p>
                        <p className="text-xs text-muted">Token: #{verification.tokenId} • {formatDate(verification.timestamp)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Verifier Interface */}
        {userRole === 'verifier' && (
          <div className="grid grid-2 gap-8">
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-text">🔍 Check Wallet Ownership</h2>
              
              {selectedCollection ? (
                <div className="space-y-6">
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <h3 className="font-semibold text-text mb-2">Checking: {selectedCollection.name}</h3>
                    <p className="text-sm text-muted">Contract: {selectedCollection.contractAddress.slice(0, 10)}...{selectedCollection.contractAddress.slice(-8)}</p>
                  </div>

                  <FormField label="Wallet Address to Check">
                    <input
                      type="text"
                      value={targetWalletAddress}
                      onChange={(e) => setTargetWalletAddress(e.target.value)}
                      placeholder="0x1234567890abcdef1234567890abcdef12345678"
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </FormField>

                  <Button
                    variant="primary"
                    onClick={handleCheckWalletOwnership}
                    disabled={verifying || !targetWalletAddress.trim()}
                    className="w-full"
                  >
                    {verifying ? 'Checking...' : '🔍 Check Ownership'}
                  </Button>

                  {verificationResult && (
                    <div className={`border rounded-xl p-4 ${
                      verificationResult.success 
                        ? 'bg-success bg-opacity-10 border-success'
                        : 'bg-danger bg-opacity-10 border-danger'
                    }`}>
                      <h4 className={`font-semibold mb-2 ${
                        verificationResult.success ? 'text-success' : 'text-danger'
                      }`}>
                        {verificationResult.success ? '✅ Ownership Confirmed' : '❌ Verification Failed'}
                      </h4>
                      
                      {verificationResult.success ? (
                        <div className="space-y-1 text-sm">
                          <p>Wallet: {verificationResult.ownershipDetails?.walletAddress}</p>
                          <p>NFTs Owned: {verificationResult.ownershipDetails?.balance}</p>
                          <p>Token IDs: {verificationResult.ownershipDetails?.tokenIds?.join(', ')}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-danger">Reason: {verificationResult.reason}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted">Please select a collection to verify ownership</p>
              )}
            </Card>

            <Card>
              <h2 className="text-xl font-semibold mb-4 text-text">🎫 Verify Session Code</h2>
              
              <div className="space-y-6">
                <div className="bg-surface border border-border rounded-xl p-4">
                  <h3 className="font-semibold text-text mb-2">Session Code Verification</h3>
                  <p className="text-sm text-muted">Ask the NFT owner for their 6-digit session code</p>
                </div>

                <FormField label="Session Code">
                  <input
                    type="text"
                    value={sessionCodeToCheck}
                    onChange={(e) => setSessionCodeToCheck(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text text-center text-2xl font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </FormField>

                <Button
                  variant="primary"
                  onClick={handleVerifySessionCode}
                  disabled={verifying || sessionCodeToCheck.length !== 6}
                  className="w-full"
                >
                  {verifying ? 'Verifying...' : '🎫 Verify Code'}
                </Button>

                <div className="bg-bg border border-border rounded-xl p-4">
                  <h4 className="font-medium text-text mb-2">💡 Demo Tip</h4>
                  <p className="text-sm text-muted">
                    Try using code <span className="font-mono bg-surface px-2 py-1 rounded">123456</span> or 
                    generate a code as an owner first!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;