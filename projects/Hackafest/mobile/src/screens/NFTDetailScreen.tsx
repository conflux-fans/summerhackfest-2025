import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../services/WalletService';
import { useNotifications } from '../services/NotificationService';
import { NFT } from '../types/navigation';

export default function NFTDetailScreen({ route, navigation }: any) {
  const { nft }: { nft: NFT } = route.params;
  const { verifyOwnership } = useWallet();
  const { sendLocalNotification } = useNotifications();
  
  const [verifying, setVerifying] = useState(false);

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return '#F59E0B';
      case 'epic': return '#8B5CF6';
      case 'rare': return '#3B82F6';
      case 'uncommon': return '#22C55E';
      default: return '#9CA3AF';
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const result = await verifyOwnership(
        nft.contractAddress,
        `Verification for ${nft.name}`
      );

      if (result.success) {
        await sendLocalNotification(
          'Verification Successful!',
          `Your NFT ${nft.name} has been verified successfully.`
        );
        Alert.alert(
          'Verification Successful!',
          `Your NFT has been verified.\n\nEvent: ${result.eventName}\nLocation: ${result.location}`
        );
      } else {
        await sendLocalNotification(
          'Verification Failed',
          result.reason || 'Unable to verify NFT ownership.'
        );
        Alert.alert(
          'Verification Failed',
          result.reason || 'Unable to verify NFT ownership.'
        );
      }
    } catch (error) {
      console.error('Verification failed:', error);
      Alert.alert('Error', 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my NFT: ${nft.name} #${nft.tokenId}\n\nThis NFT grants access to real-world benefits and experiences.`,
        title: nft.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleTransfer = () => {
    Alert.alert(
      'Transfer NFT',
      'Transfer functionality would be implemented here. This would allow you to send this NFT to another wallet address.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* NFT Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: nft.image }} style={styles.nftImage} />
          {nft.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={16} color="#22C55E" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* NFT Info */}
        <View style={styles.infoContainer}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.nftName}>{nft.name}</Text>
              <Text style={styles.tokenId}>#{nft.tokenId}</Text>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share" size={20} color="#22D3EE" />
            </TouchableOpacity>
          </View>

          {nft.description && (
            <Text style={styles.description}>{nft.description}</Text>
          )}

          {/* Rarity */}
          <View style={styles.rarityContainer}>
            <Text style={styles.rarityLabel}>Rarity</Text>
            <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(nft.rarity) }]}>
              <Text style={styles.rarityText}>{nft.rarity}</Text>
            </View>
          </View>

          {/* Contract Address */}
          <View style={styles.contractContainer}>
            <Text style={styles.contractLabel}>Contract Address</Text>
            <View style={styles.contractAddress}>
              <Text style={styles.contractText}>
                {nft.contractAddress.slice(0, 6)}...{nft.contractAddress.slice(-4)}
              </Text>
              <TouchableOpacity>
                <Ionicons name="copy" size={16} color="#22D3EE" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Traits */}
          {nft.traits && Object.keys(nft.traits).length > 0 && (
            <View style={styles.traitsContainer}>
              <Text style={styles.traitsTitle}>Traits</Text>
              <View style={styles.traitsGrid}>
                {Object.entries(nft.traits).map(([key, value]) => (
                  <View key={key} style={styles.traitItem}>
                    <Text style={styles.traitKey}>{key}</Text>
                    <Text style={styles.traitValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.verifyButton, verifying && styles.verifyButtonDisabled]}
              onPress={handleVerify}
              disabled={verifying}
            >
              <Ionicons name="checkmark-circle" size={20} color="#0B0F14" />
              <Text style={styles.verifyButtonText}>
                {verifying ? 'Verifying...' : 'Verify Ownership'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.transferButton}
              onPress={handleTransfer}
            >
              <Ionicons name="arrow-forward" size={20} color="#22D3EE" />
              <Text style={styles.transferButtonText}>Transfer</Text>
            </TouchableOpacity>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Real-World Benefits</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                <Text style={styles.benefitText}>Access to exclusive events</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                <Text style={styles.benefitText}>VIP treatment and perks</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                <Text style={styles.benefitText}>Priority access to new features</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                <Text style={styles.benefitText}>Community membership</Text>
              </View>
            </View>
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
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  nftImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  nftName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E6ECF2',
    marginBottom: 4,
  },
  tokenId: {
    fontSize: 16,
    color: '#AAB7C4',
    fontFamily: 'monospace',
  },
  shareButton: {
    padding: 8,
  },
  description: {
    fontSize: 16,
    color: '#AAB7C4',
    lineHeight: 24,
    marginBottom: 20,
  },
  rarityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rarityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E6ECF2',
    marginRight: 12,
  },
  rarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  contractContainer: {
    marginBottom: 20,
  },
  contractLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E6ECF2',
    marginBottom: 8,
  },
  contractAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contractText: {
    fontSize: 14,
    color: '#AAB7C4',
    fontFamily: 'monospace',
  },
  traitsContainer: {
    marginBottom: 20,
  },
  traitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E6ECF2',
    marginBottom: 12,
  },
  traitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  traitItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  traitKey: {
    fontSize: 12,
    color: '#AAB7C4',
    marginBottom: 2,
  },
  traitValue: {
    fontSize: 14,
    color: '#E6ECF2',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  verifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22D3EE',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  verifyButtonDisabled: {
    backgroundColor: '#AAB7C4',
  },
  verifyButtonText: {
    color: '#0B0F14',
    fontWeight: '600',
    marginLeft: 8,
  },
  transferButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderWidth: 1,
    borderColor: '#22D3EE',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  transferButtonText: {
    color: '#22D3EE',
    fontWeight: '600',
    marginLeft: 8,
  },
  benefitsContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E6ECF2',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: '#AAB7C4',
    marginLeft: 8,
  },
});
