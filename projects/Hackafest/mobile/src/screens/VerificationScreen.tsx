import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../services/WalletService';
import { useNotifications } from '../services/NotificationService';
import { NFT, VerificationResult } from '../types/navigation';

export default function VerificationScreen({ navigation }: any) {
  const { wallet, nfts, verifyOwnership, verificationHistory, loading } = useWallet();
  const { sendLocalNotification } = useNotifications();
  
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const handleVerifyOwnership = async () => {
    if (!selectedNFT) {
      Alert.alert('Error', 'Please select an NFT to verify');
      return;
    }

    try {
      const result = await verifyOwnership(
        selectedNFT.contractAddress,
        eventName || `Verification for ${selectedNFT.name}`
      );

      setVerificationResult(result);

      if (result.success) {
        await sendLocalNotification(
          'Verification Successful!',
          `Your NFT ${selectedNFT.name} has been verified successfully.`
        );
        Alert.alert(
          'Verification Successful!',
          `Your NFT ${selectedNFT.name} has been verified.\n\nEvent: ${result.eventName}\nLocation: ${result.location}`
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
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    Alert.alert(
      '6-Character Code Generated',
      `Your verification code: ${code}\n\nThis code expires in 1 hour. Share it with the verifier.`,
      [{ text: 'OK' }]
    );
  };

  if (!wallet.connected) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={80} color="#AAB7C4" />
          <Text style={styles.emptyTitle}>Wallet Not Connected</Text>
          <Text style={styles.emptySubtitle}>
            Connect your wallet to verify NFT ownership
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
      <ScrollView style={styles.scrollView}>
        {/* Verification Methods */}
        <View style={styles.methodsSection}>
          <Text style={styles.sectionTitle}>Verification Methods</Text>
          
          {/* Direct Verification */}
          <View style={styles.methodCard}>
            <View style={styles.methodHeader}>
              <Ionicons name="finger-print" size={24} color="#22D3EE" />
              <Text style={styles.methodTitle}>Direct Verification</Text>
            </View>
            <Text style={styles.methodDescription}>
              Verify NFT ownership by signing a message with your wallet
            </Text>
            
            {/* NFT Selection */}
            <View style={styles.nftSelection}>
              <Text style={styles.inputLabel}>Select NFT to Verify</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {nfts.map((nft) => (
                  <TouchableOpacity
                    key={nft.id}
                    style={[
                      styles.nftOption,
                      selectedNFT?.id === nft.id && styles.nftOptionSelected
                    ]}
                    onPress={() => setSelectedNFT(nft)}
                  >
                    <Text style={[
                      styles.nftOptionText,
                      selectedNFT?.id === nft.id && styles.nftOptionTextSelected
                    ]}>
                      {nft.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Event Details */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Event Name (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={eventName}
                onChangeText={setEventName}
                placeholder="e.g., VIP Conference Access"
                placeholderTextColor="#AAB7C4"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g., Convention Center, Hall A"
                placeholderTextColor="#AAB7C4"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.verifyButton,
                (!selectedNFT || loading) && styles.verifyButtonDisabled
              ]}
              onPress={handleVerifyOwnership}
              disabled={!selectedNFT || loading}
            >
              <Ionicons name="checkmark-circle" size={20} color="#0B0F14" />
              <Text style={styles.verifyButtonText}>
                {loading ? 'Verifying...' : 'Verify Ownership'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 5-Digit Code Verification */}
          <View style={styles.methodCard}>
            <View style={styles.methodHeader}>
              <Ionicons name="keypad" size={24} color="#22C55E" />
              <Text style={styles.methodTitle}>6-Character Code</Text>
            </View>
            <Text style={styles.methodDescription}>
              Verify using a 6-character code provided by the event organizer
            </Text>
            
            <TouchableOpacity
              style={styles.sessionButton}
              onPress={() => navigation.navigate('CodeInput', { type: 'verify' })}
            >
              <Ionicons name="keypad" size={20} color="#22C55E" />
              <Text style={styles.sessionButtonText}>Enter 6-Character Code</Text>
            </TouchableOpacity>
          </View>

          {/* Generate 6-Character Code */}
          <View style={styles.methodCard}>
            <View style={styles.methodHeader}>
              <Ionicons name="add-circle" size={24} color="#F59E0B" />
              <Text style={styles.methodTitle}>Generate Code</Text>
            </View>
            <Text style={styles.methodDescription}>
              Generate a 6-character code to share with verifiers
            </Text>
            
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateCode}
            >
              <Ionicons name="refresh" size={20} color="#F59E0B" />
              <Text style={styles.generateButtonText}>Generate Code</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Verification History */}
        {verificationHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Recent Verifications</Text>
            {verificationHistory.slice(0, 5).map((verification, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyIcon}>
                  <Ionicons
                    name={verification.success ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={verification.success ? "#22C55E" : "#EF4444"}
                  />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyEvent}>
                    {verification.eventName}
                  </Text>
                  <Text style={styles.historyLocation}>
                    {verification.location}
                  </Text>
                  <Text style={styles.historyTime}>
                    {new Date(verification.timestamp).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.historyMethod}>
                  <Text style={styles.historyMethodText}>
                    {verification.method.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

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
  methodsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E6ECF2',
    marginBottom: 16,
  },
  methodCard: {
    backgroundColor: '#101621',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E6ECF2',
    marginLeft: 8,
  },
  methodDescription: {
    fontSize: 14,
    color: '#AAB7C4',
    marginBottom: 16,
  },
  nftSelection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E6ECF2',
    marginBottom: 8,
  },
  nftOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  nftOptionSelected: {
    backgroundColor: '#22D3EE',
    borderColor: '#22D3EE',
  },
  nftOptionText: {
    fontSize: 12,
    color: '#AAB7C4',
  },
  nftOptionTextSelected: {
    color: '#0B0F14',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#E6ECF2',
    fontSize: 14,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22D3EE',
    paddingVertical: 12,
    borderRadius: 8,
  },
  verifyButtonDisabled: {
    backgroundColor: '#AAB7C4',
  },
  verifyButtonText: {
    color: '#0B0F14',
    fontWeight: '600',
    marginLeft: 8,
  },
  sessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: 8,
  },
  sessionButtonText: {
    color: '#22C55E',
    fontWeight: '600',
    marginLeft: 8,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#F59E0B',
    fontWeight: '600',
    marginLeft: 8,
  },
  historySection: {
    padding: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101621',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  historyIcon: {
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyEvent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E6ECF2',
    marginBottom: 2,
  },
  historyLocation: {
    fontSize: 14,
    color: '#AAB7C4',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 12,
    color: '#AAB7C4',
  },
  historyMethod: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  historyMethodText: {
    fontSize: 10,
    color: '#22D3EE',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#101621',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E6ECF2',
  },
  modalDescription: {
    fontSize: 14,
    color: '#AAB7C4',
    marginBottom: 24,
    textAlign: 'center',
  },
  sessionCodeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: '#22D3EE',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
    color: '#E6ECF2',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#AAB7C4',
    fontWeight: '600',
  },
  modalVerifyButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#22D3EE',
    alignItems: 'center',
  },
  modalVerifyButtonDisabled: {
    backgroundColor: '#AAB7C4',
  },
  modalVerifyText: {
    color: '#0B0F14',
    fontWeight: '600',
  },
  modalHint: {
    fontSize: 12,
    color: '#F59E0B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
