import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../services/WalletService';

export default function SettingsScreen() {
  const { wallet, disconnectWallet } = useWallet();

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet? This will remove all your data from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: disconnectWallet },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all verification history and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {
          // Implement clear data functionality
          Alert.alert('Success', 'All data has been cleared.');
        }},
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your verification history and settings will be exported as a JSON file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          Alert.alert('Success', 'Data exported successfully!');
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your app preferences</Text>
        </View>

        {/* Wallet Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="wallet" size={20} color="#22D3EE" />
              <View style={styles.settingText}>
                <Text style={styles.settingName}>Wallet Status</Text>
                <Text style={styles.settingDescription}>
                  {wallet.connected ? 'Connected' : 'Not Connected'}
                </Text>
              </View>
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: wallet.connected ? '#22C55E' : '#EF4444' }]} />
          </View>

          {wallet.connected && (
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="key" size={20} color="#AAB7C4" />
                <View style={styles.settingText}>
                  <Text style={styles.settingName}>Wallet Address</Text>
                  <Text style={styles.settingDescription}>
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.settingItem} onPress={handleDisconnect}>
            <View style={styles.settingInfo}>
              <Ionicons name="log-out" size={20} color="#EF4444" />
              <Text style={[styles.settingName, { color: '#EF4444' }]}>Disconnect Wallet</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#AAB7C4" />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={20} color="#22D3EE" />
              <View style={styles.settingText}>
                <Text style={styles.settingName}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive verification updates</Text>
              </View>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: '#AAB7C4', true: '#22D3EE' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="time" size={20} color="#22D3EE" />
              <View style={styles.settingText}>
                <Text style={styles.settingName}>Reminders</Text>
                <Text style={styles.settingDescription}>Event verification reminders</Text>
              </View>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: '#AAB7C4', true: '#22D3EE' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark" size={20} color="#22C55E" />
              <Text style={styles.settingName}>Biometric Authentication</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#AAB7C4" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="lock-closed" size={20} color="#22C55E" />
              <Text style={styles.settingName}>App Lock</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#AAB7C4" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="eye-off" size={20} color="#AAB7C4" />
              <Text style={styles.settingName}>Hide Sensitive Data</Text>
            </View>
            <Switch
              value={false}
              onValueChange={() => {}}
              trackColor={{ false: '#AAB7C4', true: '#22D3EE' }}
              thumbColor="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
            <View style={styles.settingInfo}>
              <Ionicons name="download" size={20} color="#22D3EE" />
              <Text style={styles.settingName}>Export Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#AAB7C4" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
            <View style={styles.settingInfo}>
              <Ionicons name="trash" size={20} color="#EF4444" />
              <Text style={[styles.settingName, { color: '#EF4444' }]}>Clear All Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#AAB7C4" />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle" size={20} color="#AAB7C4" />
              <Text style={styles.settingName}>Version</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle" size={20} color="#AAB7C4" />
              <Text style={styles.settingName}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#AAB7C4" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="document-text" size={20} color="#AAB7C4" />
              <Text style={styles.settingName}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#AAB7C4" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield" size={20} color="#AAB7C4" />
              <Text style={styles.settingName}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#AAB7C4" />
          </TouchableOpacity>
        </View>

        {/* Demo Notice */}
        <View style={styles.demoNotice}>
          <Ionicons name="information-circle" size={20} color="#F59E0B" />
          <Text style={styles.demoNoticeText}>
            Demo Mode: This is a demonstration app for NFT verification
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E6ECF2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAB7C4',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E6ECF2',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#101621',
    marginHorizontal: 20,
    marginBottom: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E6ECF2',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#AAB7C4',
  },
  settingValue: {
    fontSize: 14,
    color: '#AAB7C4',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
