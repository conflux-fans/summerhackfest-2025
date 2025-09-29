/**
 * Integration Framework for Conflux DevKit
 *
 * Modular system for DeFi protocol integrations that allows easy addition
 * of new protocols and network-specific filtering.
 */

import type React from 'react';

export type NetworkType = 'local' | 'testnet' | 'mainnet';
export type IntegrationType = 'dex' | 'bridge' | 'lending' | 'yield' | 'tools';

export interface IntegrationMetadata {
  id: string;
  name: string;
  description: string;
  category: IntegrationType;
  networks: NetworkType[];
  icon: React.ReactNode;
  tvl?: string;
  website?: string;
  isActive: boolean;
  requiresWallet?: boolean;
}

export interface IntegrationComponentProps {
  currentNetwork: NetworkType;
  isVisible: boolean;
  onNetworkSwitch?: (network: NetworkType) => void;
}

export interface Integration {
  metadata: IntegrationMetadata;
  component: React.ComponentType<IntegrationComponentProps>;
}

export class IntegrationRegistry {
  private static instance: IntegrationRegistry;
  private integrations = new Map<string, Integration>();

  static getInstance(): IntegrationRegistry {
    if (!IntegrationRegistry.instance) {
      IntegrationRegistry.instance = new IntegrationRegistry();
    }
    return IntegrationRegistry.instance;
  }

  register(integration: Integration): void {
    this.integrations.set(integration.metadata.id, integration);
  }

  getIntegration(id: string): Integration | undefined {
    return this.integrations.get(id);
  }

  getAllIntegrations(): Integration[] {
    return Array.from(this.integrations.values());
  }

  getIntegrationsForNetwork(network: NetworkType): Integration[] {
    return this.getAllIntegrations().filter(
      (integration) =>
        integration.metadata.networks.includes(network) ||
        (integration.metadata.networks.includes('local') && network === 'local')
    );
  }

  getIntegrationsByCategory(category: IntegrationType): Integration[] {
    return this.getAllIntegrations().filter(
      (integration) => integration.metadata.category === category
    );
  }

  getActiveIntegrations(): Integration[] {
    return this.getAllIntegrations().filter((integration) => integration.metadata.isActive);
  }
}

// Helper function to create an integration
export function createIntegration(
  metadata: IntegrationMetadata,
  component: React.ComponentType<IntegrationComponentProps>
): Integration {
  return { metadata, component };
}

// Export singleton instance
export const integrationRegistry = IntegrationRegistry.getInstance();
