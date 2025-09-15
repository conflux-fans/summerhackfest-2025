import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import FormField from '../components/FormField';
import { simulateGetCollections, getWalletState, MockCollection } from '../utils/simulation';

interface NFTListing {
  id: string;
  collectionName: string;
  tokenStandard: 'ERC-721' | 'ERC-1155';
  price: number;
  currency: string;
  remainingSupply: number;
  accessRule: string;
  creator: string;
  traits?: Record<string, string>;
}

const mockListings: NFTListing[] = [
  {
    id: '1',
    collectionName: 'VIP Conference Access',
    tokenStandard: 'ERC-721',
    price: 0.5,
    currency: 'CFX',
    remainingSupply: 25,
    accessRule: 'Conference VIP lounge access',
    creator: '0x1234...5678',
    traits: { rarity: 'Rare', tier: 'VIP', venue: 'Main Hall' }
  },
  {
    id: '2',
    collectionName: 'Premium Gym Membership',
    tokenStandard: 'ERC-1155',
    price: 2.0,
    currency: 'CFX',
    remainingSupply: 100,
    accessRule: 'Member-only gym access',
    creator: '0x9abc...def0',
    traits: { duration: '1 Year', location: 'Downtown', tier: 'Premium' }
  },
  {
    id: '3',
    collectionName: 'Exclusive Art Gallery',
    tokenStandard: 'ERC-721',
    price: 0.3,
    currency: 'CFX',
    remainingSupply: 50,
    accessRule: 'Gallery opening events',
    creator: '0x2468...ace0',
    traits: { type: 'Opening Access', location: 'Art District', expires: 'Dec 2024' }
  }
];

const MarketplacePage: React.FC = () => {
  const [collections, setCollections] = useState<MockCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterType, setFilterType] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedCollection, setSelectedCollection] = useState<MockCollection | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const data = await simulateGetCollections();
      setCollections(data);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.creator.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || collection.category === filterType;
    
    const price = parseFloat(collection.price);
    const matchesPrice = (!priceRange.min || price >= parseFloat(priceRange.min)) &&
                        (!priceRange.max || price <= parseFloat(priceRange.max));
    
    return matchesSearch && matchesType && matchesPrice && collection.isActive;
  });

  const sortedCollections = [...filteredCollections].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'ending-soon':
        return (a.maxSupply - a.totalSupply) - (b.maxSupply - b.totalSupply);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleBuy = async (collection: MockCollection) => {
    const wallet = getWalletState();
    if (!wallet.connected) {
      alert('Please connect your wallet first');
      return;
    }

    setPurchasing(true);
    try {
      // Simulate purchase transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const totalCost = parseFloat(collection.price) * quantity;
      alert(`🎉 Successfully purchased ${quantity} NFT(s) from "${collection.name}" for ${totalCost} CFX!\n\nTransaction simulated in demo mode.`);
      
      // Update collection supply
      const updatedCollections = collections.map(c => 
        c.id === collection.id 
          ? { ...c, totalSupply: c.totalSupply + quantity }
          : c
      );
      setCollections(updatedCollections);
      
      setSelectedCollection(null);
      setQuantity(1);
    } catch (error) {
      alert('Purchase failed: ' + error);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="py-3xl">
      <div className="container">
        <div className="text-center mb-3xl">
          <h1 className="mb-lg">Browse & Buy NFTs</h1>
          <p className="text-xl text-muted">
            Discover NFTs that unlock real-world access and experiences.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <div className="grid grid-4 gap-6 mb-6">
            <FormField label="Search">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Collection name or creator address"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </FormField>

            <FormField label="Sort by">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="ending-soon">Ending Soon</option>
              </select>
            </FormField>

            <FormField label="Access Type">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Types</option>
                <option value="event">Event</option>
                <option value="membership">Membership</option>
                <option value="space">Premium Space</option>
              </select>
            </FormField>

            <FormField label="Availability">
              <select className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-accent">
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="limited">Limited Supply</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-2 gap-6">
            <FormField label="Price Range">
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  placeholder="Min"
                  className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <span className="text-muted self-center">to</span>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  placeholder="Max"
                  className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </FormField>
          </div>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted">Loading collections...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted">
                {sortedCollections.length} collection{sortedCollections.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Collection Grid */}
            <div className="grid grid-3 gap-6">
              {sortedCollections.map((collection) => (
                <Card key={collection.id} hover>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-text mb-2">{collection.name}</h3>
                    <div className="text-sm text-muted space-y-1">
                      <div>Symbol: {collection.symbol}</div>
                      <div>Creator: {collection.creator.slice(0, 10)}...</div>
                      <div>Category: {collection.category}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-muted line-clamp-2">{collection.description}</p>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-2xl font-semibold text-text">
                        {collection.price} <span className="text-sm text-muted">CFX</span>
                      </div>
                      <div className="text-sm text-muted">
                        {collection.maxSupply - collection.totalSupply} / {collection.maxSupply} available
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setSelectedCollection(collection)}
                    disabled={collection.totalSupply >= collection.maxSupply}
                  >
                    {collection.totalSupply >= collection.maxSupply ? 'Sold Out' : 'View Details'}
                  </Button>
                </Card>
              ))}
            </div>

            {sortedCollections.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted">No collections found matching your criteria.</p>
              </div>
            )}
          </>
        )}

        {/* Purchase Modal */}
        {selectedCollection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface border border-border rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-semibold mb-6 text-text">{selectedCollection.name}</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-muted mb-2">Description</h3>
                  <p className="text-text">{selectedCollection.description}</p>
                </div>
                
                <div className="grid grid-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted">Symbol:</span>
                    <span className="text-text ml-2">{selectedCollection.symbol}</span>
                  </div>
                  <div>
                    <span className="text-muted">Category:</span>
                    <span className="text-text ml-2 capitalize">{selectedCollection.category}</span>
                  </div>
                  <div>
                    <span className="text-muted">Total Supply:</span>
                    <span className="text-text ml-2">{selectedCollection.totalSupply} / {selectedCollection.maxSupply}</span>
                  </div>
                  <div>
                    <span className="text-muted">Status:</span>
                    <span className={`ml-2 ${selectedCollection.isActive ? 'text-success' : 'text-danger'}`}>
                      {selectedCollection.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <FormField label="Quantity">
                  <input
                    type="number"
                    min="1"
                    max={selectedCollection.maxSupply - selectedCollection.totalSupply}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={purchasing}
                  />
                </FormField>

                <div className="bg-bg border border-border rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted">Total Cost</span>
                    <span className="text-xl font-semibold text-text">
                      {(parseFloat(selectedCollection.price) * quantity).toFixed(3)} CFX
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setSelectedCollection(null)}
                  disabled={purchasing}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleBuy(selectedCollection)}
                  disabled={purchasing}
                >
                  {purchasing ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;