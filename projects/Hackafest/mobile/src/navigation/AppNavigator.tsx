import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import WalletScreen from '../screens/WalletScreen';
import VerificationScreen from '../screens/VerificationScreen';
import EventsScreen from '../screens/EventsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CodeInputScreen from '../screens/CodeInputScreen';
import NFTDetailScreen from '../screens/NFTDetailScreen';

// Types
import { RootStackParamList, TabParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Verify') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#22D3EE',
        tabBarInactiveTintColor: '#AAB7C4',
        tabBarStyle: {
          backgroundColor: '#101621',
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          borderTopWidth: 1,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#0B0F14',
          borderBottomColor: 'rgba(255, 255, 255, 0.08)',
          borderBottomWidth: 1,
        },
        headerTintColor: '#E6ECF2',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'NFTicket' }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{ title: 'My Wallet' }}
      />
      <Tab.Screen 
        name="Verify" 
        component={VerificationScreen}
        options={{ title: 'Verify' }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventsScreen}
        options={{ title: 'Events' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0B0F14',
          borderBottomColor: 'rgba(255, 255, 255, 0.08)',
          borderBottomWidth: 1,
        },
        headerTintColor: '#E6ECF2',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CodeInput" 
        component={CodeInputScreen}
        options={{ 
          title: 'Enter Code',
          presentation: 'modal'
        }}
      />
      <Stack.Screen 
        name="NFTDetail" 
        component={NFTDetailScreen}
        options={{ 
          title: 'NFT Details',
          presentation: 'modal'
        }}
      />
    </Stack.Navigator>
  );
}
