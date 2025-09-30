import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../services/WalletService';

interface CodeInputScreenProps {
  navigation: any;
  route: {
    params: {
      type: 'connect' | 'verify';
    };
  };
}

export default function CodeInputScreen({ navigation, route }: CodeInputScreenProps) {
  const { type } = route.params;
  const { connectWallet, verifyOwnership, wallet, loading } = useWallet();
  const [code, setCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Focus input when screen loads
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCodeChange = (text: string) => {
    // Only allow alphanumeric characters and limit to 6 characters
    const alphanumericText = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (alphanumericText.length <= 6) {
      setCode(alphanumericText);
    }
  };

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmit = async () => {
    if (code.length !== 6) {
      shakeInput();
      Alert.alert('Invalid Code', 'Please enter a 6-character code');
      return;
    }

    setIsProcessing(true);
    Keyboard.dismiss();

    try {
      if (type === 'connect') {
        await connectWallet();
        Alert.alert(
          'Success!',
          'Wallet connected successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        // For verification, we'll use a mock contract address
        const result = await verifyOwnership('0x1234567890123456789012345678901234567890', 'Event Verification');
        
        if (result.success) {
          Alert.alert(
            'Verification Successful!',
            `Your NFT has been verified for the event.`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert(
            'Verification Failed',
            result.reason || 'Unable to verify NFT ownership.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isConnectMode = type === 'connect';
  const isWalletConnected = wallet.connected;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#E6ECF2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isConnectMode ? 'Connect Wallet' : 'Verify NFT'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={isConnectMode ? "wallet" : "checkmark-circle"}
            size={64}
            color="#22D3EE"
          />
        </View>

        <Text style={styles.title}>
          {isConnectMode ? 'Enter 6-Character Code' : 'Enter Verification Code'}
        </Text>

        <Text style={styles.subtitle}>
          {isConnectMode
            ? 'Enter the 6-character code to link your wallet to this device'
            : 'Enter the 6-character code to verify your NFT ownership'
          }
        </Text>

        <Animated.View style={[styles.inputContainer, { transform: [{ translateX: shakeAnimation }] }]}>
          <TextInput
            ref={inputRef}
            style={styles.codeInput}
            value={code}
            onChangeText={handleCodeChange}
            placeholder="ABC123"
            placeholderTextColor="#AAB7C4"
            keyboardType="default"
            maxLength={6}
            autoCapitalize="characters"
            textAlign="center"
            selectTextOnFocus
          />
        </Animated.View>

        <View style={styles.codeDisplay}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.codeDigit,
                code.length > index && styles.codeDigitFilled,
              ]}
            >
              <Text style={styles.codeDigitText}>
                {code[index] || ''}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (code.length !== 5 || isProcessing || loading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={code.length !== 5 || isProcessing || loading}
        >
          <Text style={styles.submitButtonText}>
            {isProcessing || loading ? 'Processing...' : isConnectMode ? 'Connect Wallet' : 'Verify NFT'}
          </Text>
        </TouchableOpacity>

        {isConnectMode && isWalletConnected && (
          <View style={styles.walletInfo}>
            <Ionicons name="information-circle" size={20} color="#F59E0B" />
            <Text style={styles.walletInfoText}>
              Wallet is already connected. Use verification to check NFT ownership.
            </Text>
          </View>
        )}

        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>How it works:</Text>
          <Text style={styles.helpText}>
            {isConnectMode
              ? '1. Generate a 6-character code on your wallet app\n2. Enter the code here to link your wallet\n3. Your NFTs will be synced to this device'
              : '1. Get a 6-character verification code from the event organizer\n2. Enter the code to verify your NFT ownership\n3. Your verification will be recorded'
            }
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E6ECF2',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E6ECF2',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAB7C4',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  codeInput: {
    backgroundColor: '#101621',
    borderWidth: 2,
    borderColor: '#22D3EE',
    borderRadius: 12,
    color: '#E6ECF2',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    width: 280,
    letterSpacing: 3,
    alignSelf: 'center',
  },
  codeDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  codeDigit: {
    width: 55,
    height: 55,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#101621',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeDigitFilled: {
    borderColor: '#22D3EE',
    backgroundColor: '#1a1a2e',
  },
  codeDigitText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E6ECF2',
  },
  submitButton: {
    backgroundColor: '#22D3EE',
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: 'center',
    minWidth: 200,
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
  },
  submitButtonText: {
    color: '#0B0F14',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  walletInfoText: {
    color: '#F59E0B',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  helpContainer: {
    backgroundColor: '#101621',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
    alignSelf: 'center',
  },
  helpTitle: {
    color: '#E6ECF2',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  helpText: {
    color: '#AAB7C4',
    fontSize: 14,
    lineHeight: 20,
  },
});
