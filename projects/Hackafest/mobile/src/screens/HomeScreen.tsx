import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../services/WalletService';
import { useNotifications } from '../services/NotificationService';
import { NFT } from '../types/navigation';

export default function HomeScreen({ navigation }: any) {
  const { wallet, nfts, verificationHistory, refreshNFTs, loading } = useWallet();
  const { sendLocalNotification } = useNotifications();

  const handleVerifyNFT = async (nft: NFT) => {
    try {
      const result = await wallet.verifyOwnership(nft.contractAddress, `Verification for ${nft.name}`);
      
      if (result.success) {
        await sendLocalNotification(
          'Verification Successful!',
          `Your NFT ${nft.name} has been verified successfully.`
        );
      } else {
        await sendLocalNotification(
          'Verification Failed',
          result.reason || 'Unable to verify NFT ownership.'
        );
      }
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  const onRefresh = () => {
    refreshNFTs();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.subtitle}>
              {wallet.connected 
                ? `Manage your ${nfts.length} NFTs` 
                : 'Connect your wallet to get started'
              }
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="person-circle" size={40} color="#22D3EE" />
          </TouchableOpacity>
        </View>

        {/* Wallet Status Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <Ionicons name="wallet" size={24} color="#22D3EE" />
            <Text style={styles.walletTitle}>Wallet Status</Text>
          </View>
          
          {wallet.connected ? (
            <View style={styles.walletInfo}>
              <Text style={styles.walletAddress}>
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </Text>
              <Text style={styles.walletBalance}>{wallet.balance} CFX</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={wallet.connectWallet}
            >
              <Ionicons name="link" size={20} color="#0B0F14" />
              <Text style={styles.connectButtonText}>Connect Wallet</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('QRScanner')}
            >
              <Ionicons name="qr-code" size={24} color="#22D3EE" />
              <Text style={styles.actionText}>Scan QR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Verify')}
            >
              <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
              <Text style={styles.actionText}>Verify</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Events')}
            >
              <Ionicons name="calendar" size={24} color="#F59E0B" />
              <Text style={styles.actionText}>Events</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Wallet')}
            >
              <Ionicons name="wallet" size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>Wallet</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent NFTs */}
        {wallet.connected && nfts.length > 0 && (
          <View style={styles.nftsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your NFTs</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {nfts.slice(0, 3).map((nft) => (
                <TouchableOpacity
                  key={nft.id}
                  style={styles.nftCard}
                  onPress={() => navigation.navigate('NFTDetail', { nft })}
                >
                  <Image source={{ uri: nft.image }} style={styles.nftImage} />
                  <View style={styles.nftInfo}>
                    <Text style={styles.nftName} numberOfLines={1}>
                      {nft.name}
                    </Text>
                    <Text style={styles.nftRarity}>{nft.rarity}</Text>
                  </View>
                  {nft.verified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark" size={12} color="#22C55E" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Verifications */}
        {verificationHistory.length > 0 && (
          <View style={styles.verificationSection}>
            <Text style={styles.sectionTitle}>Recent Verifications</Text>
            {verificationHistory.slice(0, 3).map((verification, index) => (
              <View key={index} style={styles.verificationItem}>
                <View style={styles.verificationIcon}>
                  <Ionicons
                    name={verification.success ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={verification.success ? "#22C55E" : "#EF4444"}
                  />
                </View>
                <View style={styles.verificationInfo}>
                  <Text style={styles.verificationEvent}>
                    {verification.eventName}
                  </Text>
                  <Text style={styles.verificationLocation}>
                    {verification.location}
                  </Text>
                  <Text style={styles.verificationTime}>
                    {new Date(verification.timestamp).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Demo Notice */}
        <View style={styles.demoNotice}>
          <Ionicons name="information-circle" size={20} color="#F59E0B" />
          <Text style={styles.demoNoticeText}>
            Demo Mode: All actions are simulated for demonstration purposes
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E6ECF2',
  },
  subtitle: {
    fontSize: 16,
    color: '#AAB7C4',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  walletCard: {
    backgroundColor: '#101621',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E6ECF2',
    marginLeft: 8,
  },
  walletInfo: {
    marginTop: 8,
  },
  walletAddress: {
    fontSize: 16,
    color: '#AAB7C4',
    fontFamily: 'monospace',
  },
  walletBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22C55E',
    marginTop: 4,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22D3EE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  connectButtonText: {
    color: '#0B0F14',
    fontWeight: '600',
    marginLeft: 8,
  },
  quickActions: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E6ECF2',
    marginBottom: 16,
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
  nftsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#22D3EE',
    fontSize: 14,
    fontWeight: '500',
  },
  nftCard: {
    backgroundColor: '#101621',
    marginRight: 12,
    borderRadius: 12,
    padding: 12,
    width: 140,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  nftImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
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
  nftRarity: {
    fontSize: 12,
    color: '#AAB7C4',
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
  verificationSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101621',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  verificationIcon: {
    marginRight: 12,
  },
  verificationInfo: {
    flex: 1,
  },
  verificationEvent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E6ECF2',
    marginBottom: 2,
  },
  verificationLocation: {
    fontSize: 14,
    color: '#AAB7C4',
    marginBottom: 2,
  },
  verificationTime: {
    fontSize: 12,
    color: '#AAB7C4',
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  demoNoticeText: {
    color: '#F59E0B',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});
