import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../services/WalletService';
import { NFT } from '../types/navigation';

export default function WalletScreen({ navigation }: any) {
  const { wallet, nfts, disconnectWallet, refreshNFTs, loading } = useWallet();
  const [refreshing, setRefreshing] = useState(false);

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: disconnectWallet },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNFTs();
    setRefreshing(false);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return '#F59E0B';
      case 'epic': return '#8B5CF6';
      case 'rare': return '#3B82F6';
      case 'uncommon': return '#22C55E';
      default: return '#9CA3AF';
    }
  };

  if (!wallet.connected) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={80} color="#AAB7C4" />
          <Text style={styles.emptyTitle}>No Wallet Connected</Text>
          <Text style={styles.emptySubtitle}>
            Connect your wallet to view and manage your NFTs
          </Text>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={wallet.connectWallet}
          >
            <Ionicons name="link" size={20} color="#0B0F14" />
            <Text style={styles.connectButtonText}>Connect Wallet</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Wallet Header */}
        <View style={styles.walletHeader}>
          <View style={styles.walletInfo}>
            <Text style={styles.walletTitle}>My Wallet</Text>
            <Text style={styles.walletAddress}>
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </Text>
            <Text style={styles.walletBalance}>{wallet.balance} CFX</Text>
          </View>
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={handleDisconnect}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* NFT Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{nfts.length}</Text>
            <Text style={styles.statLabel}>Total NFTs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {nfts.filter(nft => nft.verified).length}
            </Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {nfts.filter(nft => nft.rarity === 'Legendary').length}
            </Text>
            <Text style={styles.statLabel}>Legendary</Text>
          </View>
        </View>

        {/* NFT Collection */}
        <View style={styles.nftSection}>
          <Text style={styles.sectionTitle}>Your NFT Collection</Text>
          
          {nfts.length === 0 ? (
            <View style={styles.emptyNFTs}>
              <Ionicons name="image-outline" size={60} color="#AAB7C4" />
              <Text style={styles.emptyNFTsTitle}>No NFTs Found</Text>
              <Text style={styles.emptyNFTsSubtitle}>
                Your NFTs will appear here once you own some
              </Text>
            </View>
          ) : (
            <View style={styles.nftGrid}>
              {nfts.map((nft) => (
                <TouchableOpacity
                  key={nft.id}
                  style={styles.nftCard}
                  onPress={() => navigation.navigate('NFTDetail', { nft })}
                >
                  <View style={styles.nftImageContainer}>
                    <Image source={{ uri: nft.image }} style={styles.nftImage} />
                    {nft.verified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark" size={12} color="#22C55E" />
                      </View>
                    )}
                    <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(nft.rarity) }]}>
                      <Text style={styles.rarityText}>{nft.rarity}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.nftInfo}>
                    <Text style={styles.nftName} numberOfLines={1}>
                      {nft.name}
                    </Text>
                    <Text style={styles.nftTokenId}>#{nft.tokenId}</Text>
                    
                    <View style={styles.traitsContainer}>
                      {Object.entries(nft.traits).slice(0, 2).map(([key, value]) => (
                        <View key={key} style={styles.traitItem}>
                          <Text style={styles.traitKey}>{key}</Text>
                          <Text style={styles.traitValue}>{value}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('QRScanner')}
            >
              <Ionicons name="qr-code" size={24} color="#22D3EE" />
              <Text style={styles.actionText}>Scan QR Code</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Verify')}
            >
              <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
              <Text style={styles.actionText}>Verify NFT</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Events')}
            >
              <Ionicons name="calendar" size={24} color="#F59E0B" />
              <Text style={styles.actionText}>View Events</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E6ECF2',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#AAB7C4',
    textAlign: 'center',
    marginBottom: 24,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22D3EE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#0B0F14',
    fontWeight: '600',
    marginLeft: 8,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#101621',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  walletInfo: {
    flex: 1,
  },
  walletTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E6ECF2',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 16,
    color: '#AAB7C4',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22C55E',
  },
  disconnectButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#101621',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22D3EE',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#AAB7C4',
    textAlign: 'center',
  },
  nftSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E6ECF2',
    marginBottom: 16,
  },
  emptyNFTs: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyNFTsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E6ECF2',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyNFTsSubtitle: {
    fontSize: 14,
    color: '#AAB7C4',
    textAlign: 'center',
  },
  nftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nftCard: {
    backgroundColor: '#101621',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  nftImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  nftImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#22C55E',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  nftInfo: {
    flex: 1,
  },
  nftName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E6ECF2',
    marginBottom: 4,
  },
  nftTokenId: {
    fontSize: 12,
    color: '#AAB7C4',
    marginBottom: 8,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  traitItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  traitKey: {
    fontSize: 10,
    color: '#AAB7C4',
  },
  traitValue: {
    fontSize: 10,
    color: '#E6ECF2',
    fontWeight: '600',
  },
  actionsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#101621',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionText: {
    color: '#E6ECF2',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
});
