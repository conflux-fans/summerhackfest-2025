/**
 * Meson Bridge Integration
 *
 * Based on the original MesonWidget from the old frontend
 * Provides real cross-chain asset bridging to Conflux eSpace using Meson SDK
 */

// Add spinner animation
const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.querySelector('#meson-spinner-styles')) {
  const style = document.createElement('style');
  style.id = 'meson-spinner-styles';
  style.textContent = spinnerStyle;
  document.head.appendChild(style);
}

import { ActionIcon, Alert, Anchor, Badge, Card, Group, Select, Stack, Text } from '@mantine/core';
import { MesonToButton } from '@mesonfi/to/react';
import { IconExternalLink, IconInfoCircle, IconRefresh, IconTransfer } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useId, useState } from 'react';
import { DevKitApiService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import type { IntegrationComponentProps } from '../types';

interface Account {
  index: number;
  addresses: {
    core: string;
    evm: string;
  };
  isAdmin?: boolean;
}

// Button content component for Meson integration
function ButtonContent({ isPending }: { isPending: boolean }) {
  if (isPending) {
    return (
      <Group gap="xs">
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <span>Processing...</span>
      </Group>
    );
  }

  return (
    <Group gap="xs">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <title>Bridge Icon</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
      <span>Bridge Assets</span>
    </Group>
  );
}

interface CompletedData {
  swapId: string;
  amount: number;
  received: number;
  from: {
    chain: string;
    token: string;
  };
  to: {
    chain: string;
    token: string;
  };
}

export const MesonBridgeIntegration: React.FC<IntegrationComponentProps> = ({
  currentNetwork,
  isVisible,
}) => {
  const { sessionId } = useAuthStore();

  const [completedData, setCompletedData] = useState<CompletedData | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState<number>(0);
  const selectId = useId();

  // Fetch accounts for EVM address
  const { data: accountsData } = useQuery({
    queryKey: ['devkit-accounts'],
    queryFn: DevKitApiService.getAllAccounts,
    enabled: !!sessionId,
  });

  // Only show when visible
  if (!isVisible) {
    return null;
  }

  // Show warning for non-mainnet networks but still allow testing
  if (currentNetwork !== 'mainnet') {
    return (
      <Alert icon={<IconInfoCircle size={16} />} color="yellow">
        <Stack gap="xs">
          <Text size="sm">Meson Bridge works best on mainnet for cross-chain transfers.</Text>
          <Text size="xs" c="dimmed">
            Limited functionality available on testnet/local networks.
          </Text>
        </Stack>
      </Alert>
    );
  }

  // Get selected account
  const selectedAccount =
    accountsData?.accounts && accountsData.accounts.length > 0
      ? accountsData.accounts[selectedAccountIndex]
      : null;

  // Handle Meson bridge completion
  const handleCompleted = (data: any) => {
    console.log('Meson bridge completed:', data);
    setIsPending(false);
    setCompletedData({
      swapId: data.swapId || `meson_${Date.now()}`,
      amount: data.amount || 0,
      received: data.received || 0,
      from: {
        chain: data.from?.chain || 'Unknown',
        token: data.from?.token || 'Unknown',
      },
      to: {
        chain: 'conflux',
        token: data.to?.token || 'Unknown',
      },
    });
    setIsPending(false);
  };

  // Only show when visible
  if (!isVisible) {
    return null;
  }

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Group gap="xs">
              <Text fw={600} size="lg">
                Meson Bridge
              </Text>
              <Badge size="sm" color="purple">
                Cross-Chain
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              Transfer stablecoins across blockchains
            </Text>
          </div>
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => setCompletedData(null)}
              title="Reset"
            >
              <IconRefresh size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => window.open('https://meson.fi', '_blank')}
            >
              <IconExternalLink size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Network Notice */}
        <Alert icon={<IconInfoCircle size={16} />} color="orange">
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              EVM Compatible Only
            </Text>
            <Text size="xs">
              Meson supports <strong>Conflux eSpace</strong> (EVM-compatible). Core Space is not
              supported as it's not EVM-compatible.
            </Text>
            {!selectedAccount && (
              <Text size="xs" c="yellow">
                ⚠️ Please select a destination account before bridging.
              </Text>
            )}
          </Stack>
        </Alert>

        {/* Account Selector */}
        {accountsData?.accounts && accountsData.accounts.length > 0 && (
          <div>
            <Text size="sm" mb={5} c="dimmed">
              Destination Account (eSpace)
            </Text>
            <Select
              id={selectId}
              placeholder="Select destination account"
              data={accountsData.accounts.map((account: Account, index: number) => ({
                value: index.toString(),
                label: `Account ${index} (${account.addresses.evm.slice(0, 10)}...)`,
              }))}
              value={selectedAccountIndex.toString()}
              onChange={(value) => {
                if (value) {
                  setSelectedAccountIndex(parseInt(value, 10));
                }
              }}
            />
            {selectedAccount && (
              <Card withBorder p="xs" mt="xs">
                <Text size="xs" c="dimmed">
                  Target Address:
                </Text>
                <Text size="xs" ff="monospace" c="orange">
                  {selectedAccount.addresses.evm}
                </Text>
              </Card>
            )}
          </div>
        )}

        {/* Meson Integration */}
        <Card withBorder p="md">
          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm" fw={500} c="dimmed">
                Bridge to Conflux eSpace
              </Text>
              <Text size="xs" c="dimmed">
                EVM • Low Fees • Fast
              </Text>
            </Group>

            <div style={{ width: '100%' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <MesonToButton
                  options={{
                    to: 'cfx',
                    recipient:
                      selectedAccount?.addresses.evm ||
                      '0x0000000000000000000000000000000000000000',
                  }}
                  onCompleted={handleCompleted}
                >
                  <ButtonContent isPending={isPending} />
                </MesonToButton>
              </div>
            </div>

            {/* CORS Fallback Instructions */}
            <Alert icon={<IconInfoCircle size={16} />} color="blue" p="xs">
              <Text size="xs" fw={500} mb="xs">
                Having issues? Try manual bridging:
              </Text>
              <Stack gap={4}>
                <Text size="xs">
                  1. Visit{' '}
                  <Anchor href="https://meson.fi" target="_blank" size="xs">
                    meson.fi
                  </Anchor>{' '}
                  directly
                </Text>
                <Text size="xs">2. Bridge to Conflux eSpace (CFX)</Text>
                <Text size="xs">
                  3. Use address: {selectedAccount?.addresses.evm || 'Connect account first'}
                </Text>
              </Stack>
            </Alert>
          </Stack>
        </Card>

        {/* Completed Transfer Info */}
        {completedData && (
          <Card
            withBorder
            p="md"
            style={{
              backgroundColor: 'var(--mantine-color-green-0)',
              borderColor: 'var(--mantine-color-green-3)',
            }}
          >
            <Stack gap="sm">
              <Group>
                <IconTransfer size={20} color="var(--mantine-color-green-7)" />
                <Text size="sm" fw={500} c="green">
                  Transfer Completed
                </Text>
              </Group>
              <Stack gap="xs">
                <Text size="xs">
                  {completedData.amount / 1e6} {completedData.from.token} from{' '}
                  {completedData.from.chain}
                </Text>
                <Group gap="xs">
                  <Text size="xs">→</Text>
                  <Text size="xs">
                    {completedData.received / 1e6} {completedData.to.token} on{' '}
                    {completedData.to.chain}
                  </Text>
                </Group>
                <Anchor
                  href={`https://explorer.meson.fi/swap/${completedData.swapId}`}
                  target="_blank"
                  size="xs"
                >
                  View on Meson Explorer
                </Anchor>
              </Stack>
            </Stack>
          </Card>
        )}

        {/* Info Section */}
        <Card withBorder p="sm">
          <Text size="xs" c="dimmed" mb="xs" fw={500}>
            Bridge Info
          </Text>
          <Stack gap={4}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Supported tokens:
              </Text>
              <Text size="xs" ff="monospace">
                USDT, USDC, BUSD
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Fee:
              </Text>
              <Text size="xs" c="green">
                ~0.1%
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Speed:
              </Text>
              <Text size="xs" c="blue">
                1-3 minutes
              </Text>
            </Group>
          </Stack>
        </Card>

        <Text size="xs" c="dimmed" ta="center">
          Powered by Meson • Secure cross-chain infrastructure
        </Text>
      </Stack>
    </Card>
  );
};
