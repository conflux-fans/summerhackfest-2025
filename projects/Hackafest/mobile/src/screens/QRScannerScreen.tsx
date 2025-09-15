import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useWallet } from '../services/WalletService';
import { useNotifications } from '../services/NotificationService';

export default function QRScannerScreen({ navigation }: any) {
  const { wallet, verifyOwnership } = useWallet();
  const { sendLocalNotification } = useNotifications();
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ type, data }: any) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      // Parse QR code data
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'verification_request') {
        await handleVerificationRequest(qrData);
      } else if (qrData.type === 'session_code') {
        await handleSessionCode(qrData.code);
      } else {
        Alert.alert('Invalid QR Code', 'This QR code is not recognized.');
      }
    } catch (error) {
      // Try to handle as simple session code
      if (data.match(/^\d{6}$/)) {
        await handleSessionCode(data);
      } else {
        Alert.alert('Invalid QR Code', 'Unable to process this QR code.');
      }
    }
    
    // Reset after 2 seconds
    setTimeout(() => setScanned(false), 2000);
  };

  const handleVerificationRequest = async (qrData: any) => {
    if (!wallet.connected) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet first.');
      return;
    }

    try {
      const result = await verifyOwnership(
        qrData.contractAddress,
        qrData.eventName || 'QR Code Verification'
      );

      if (result.success) {
        await sendLocalNotification(
          'Verification Successful!',
          'Your NFT has been verified via QR code.'
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
    }
  };

  const handleSessionCode = async (code: string) => {
    // Simulate session code verification
    const isValid = code === '123456' || code === '654321' || code === '888888';
    
    if (isValid) {
      await sendLocalNotification(
        'Session Code Verified!',
        'Your session code has been verified successfully.'
      );
      Alert.alert('Success', 'Session code verified successfully!');
    } else {
      Alert.alert('Error', 'Invalid session code. Please try again.');
    }
  };

  const handleManualInput = () => {
    if (!manualCode.trim()) {
      Alert.alert('Error', 'Please enter a session code');
      return;
    }

    handleSessionCode(manualCode);
    setShowManualInput(false);
    setManualCode('');
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.message}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="camera-off" size={80} color="#AAB7C4" />
          <Text style={styles.title}>Camera Permission Required</Text>
          <Text style={styles.message}>
            This app needs camera access to scan QR codes for verification.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={getCameraPermissions}
          >
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Overlay */}
        <View style={styles.overlay}>
          <View style={styles.topOverlay} />
          <View style={styles.middleRow}>
            <View style={styles.sideOverlay} />
            <View style={styles.scanArea}>
              <View style={styles.corner} style={[styles.corner, styles.topLeft]} />
              <View style={styles.corner} style={[styles.corner, styles.topRight]} />
              <View style={styles.corner} style={[styles.corner, styles.bottomLeft]} />
              <View style={styles.corner} style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.sideOverlay} />
          </View>
          <View style={styles.bottomOverlay} />
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Position the QR code within the frame to scan
          </Text>
        </View>

        {/* Manual Input Button */}
        <TouchableOpacity
          style={styles.manualButton}
          onPress={() => setShowManualInput(true)}
        >
          <Ionicons name="keypad" size={20} color="#22D3EE" />
          <Text style={styles.manualButtonText}>Enter Code Manually</Text>
        </TouchableOpacity>
      </View>

      {/* Manual Input Modal */}
      <Modal
        visible={showManualInput}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManualInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Session Code</Text>
              <TouchableOpacity
                onPress={() => setShowManualInput(false)}
              >
                <Ionicons name="close" size={24} color="#AAB7C4" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Enter the 6-digit session code provided by the event organizer
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Session Code</Text>
              <View style={styles.codeInputContainer}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.codeInput,
                      manualCode.length > index && styles.codeInputFilled
                    ]}
                  >
                    <Text style={styles.codeInputText}>
                      {manualCode[index] || ''}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowManualInput(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalVerifyButton,
                  manualCode.length !== 6 && styles.modalVerifyButtonDisabled
                ]}
                onPress={handleManualInput}
                disabled={manualCode.length !== 6}
              >
                <Text style={styles.modalVerifyText}>Verify</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalHint}>
              Demo: Try codes 123456, 654321, or 888888
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E6ECF2',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#AAB7C4',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#22D3EE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#0B0F14',
    fontWeight: '600',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleRow: {
    flexDirection: 'row',
    height: 250,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#22D3EE',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructions: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  manualButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderWidth: 1,
    borderColor: '#22D3EE',
    paddingVertical: 12,
    borderRadius: 8,
  },
  manualButtonText: {
    color: '#22D3EE',
    fontWeight: '600',
    marginLeft: 8,
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
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E6ECF2',
    marginBottom: 12,
    textAlign: 'center',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  codeInputFilled: {
    borderColor: '#22D3EE',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  codeInputText: {
    fontSize: 24,
    fontWeight: 'bold',
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
