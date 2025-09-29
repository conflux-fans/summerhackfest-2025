/**
 * Integration Registry
 *
 * Auto-discovers and registers all available integrations
 */

import { IconArrowsExchange, IconTransfer } from '@tabler/icons-react';
import React from 'react';
// Import integration components
import { GinsenSwapIntegration } from './ginsenswap/GinsenSwapIntegration';
import { MesonBridgeIntegration } from './meson/MesonIntegration';
import { createIntegration, type IntegrationMetadata, IntegrationRegistry } from './types';

// Get registry instance
const registry = IntegrationRegistry.getInstance();

// Register all integrations
export function registerIntegrations() {
  // GinsenSwap integration
  const ginsenSwapMetadata: IntegrationMetadata = {
    id: 'ginsenswap',
    name: 'GinsenSwap',
    description: 'Innovative DEX on Conflux - Uniswap V3 compatible stablecoin DEX',
    category: 'dex',
    networks: ['testnet', 'mainnet'],
    icon: React.createElement(IconArrowsExchange, { size: 24, color: 'blue' }),
    tvl: '$2.1M',
    website: 'https://ginsenswap.io',
    isActive: true,
    requiresWallet: true,
  };

  // Meson Bridge integration
  const mesonBridgeMetadata: IntegrationMetadata = {
    id: 'meson-bridge',
    name: 'Meson Bridge',
    description: 'Cross-chain bridge for fast and secure transfers',
    category: 'bridge',
    networks: ['mainnet'],
    icon: React.createElement(IconTransfer, { size: 24, color: 'purple' }),
    tvl: '$15.8M',
    website: 'https://meson.fi',
    isActive: true,
    requiresWallet: true,
  };

  // Register integrations
  registry.register(createIntegration(ginsenSwapMetadata, GinsenSwapIntegration));
  registry.register(createIntegration(mesonBridgeMetadata, MesonBridgeIntegration));
}

// Initialize registration
registerIntegrations();

// Export registry instance
export { registry as integrationRegistry };
