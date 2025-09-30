import { Alert, Badge, Button, Group, Loader, Menu, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconChevronDown, IconLock, IconNetwork } from '@tabler/icons-react';
import { useAutoDevKitStatus, useCurrentNetwork, useSwitchNetwork } from '../hooks/useDevKit';

export type NetworkType = 'local' | 'testnet' | 'mainnet';

export function NetworkDropdown() {
  const { data: currentNetworkData } = useCurrentNetwork();
  const { data: devkitStatus } = useAutoDevKitStatus();
  const switchNetworkMutation = useSwitchNetwork();

  const currentNetwork = currentNetworkData?.network || 'local';
  const nodeRunning = devkitStatus?.running || false;

  const networks = [
    {
      id: 'local' as NetworkType,
      name: 'Local',
      description: 'DevKit node',
      available: true,
      color: 'green',
    },
    {
      id: 'testnet' as NetworkType,
      name: 'Testnet',
      description: 'Conflux test network',
      available: !nodeRunning,
      color: 'yellow',
    },
    {
      id: 'mainnet' as NetworkType,
      name: 'Mainnet',
      description: 'Conflux mainnet',
      available: !nodeRunning,
      color: 'blue',
    },
  ];

  const currentNetworkConfig = networks.find((n) => n.id === currentNetwork);

  const handleNetworkChange = async (network: NetworkType) => {
    const networkConfig = networks.find((n) => n.id === network);

    if (!networkConfig?.available) {
      if (nodeRunning) {
        notifications.show({
          title: 'Cannot Switch Network',
          message: 'Cannot switch networks while local node is running. Stop the node first.',
          color: 'yellow',
        });
      }
      return;
    }

    if (network === currentNetwork) {
      return;
    }

    try {
      await switchNetworkMutation.mutateAsync(network);
      notifications.show({
        title: 'Network Switched',
        message: `Successfully switched to ${network} network`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Network Switch Failed',
        message: error instanceof Error ? error.message : 'Failed to switch network',
        color: 'red',
      });
    }
  };

  return (
    <Menu shadow="md" width={260} position="bottom-end">
      <Menu.Target>
        <Button
          variant="light"
          leftSection={
            switchNetworkMutation.isPending ? <Loader size={12} /> : <IconNetwork size={14} />
          }
          rightSection={<IconChevronDown size={12} />}
          disabled={switchNetworkMutation.isPending}
          size="xs"
        >
          <Group gap={6}>
            <Badge size="xs" color={currentNetworkConfig?.color} variant="dot" />
            {currentNetworkConfig?.name}
          </Group>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {/* Header */}
        <Menu.Label>
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              Current Network
            </Text>
            <Group gap={6}>
              <Badge size="xs" color={currentNetworkConfig?.color} variant="dot" />
              <Text size="sm">{currentNetworkConfig?.name}</Text>
            </Group>
          </Group>
        </Menu.Label>

        {/* Lock notice */}
        {nodeRunning && (
          <Alert icon={<IconLock size={14} />} color="blue" mb="xs" radius="sm">
            <Text size="xs">Locked to local while node running</Text>
          </Alert>
        )}

        <Menu.Divider />

        {/* Network options */}
        {networks.map((network) => (
          <Menu.Item
            key={network.id}
            leftSection={<Badge size="xs" color={network.color} variant="dot" />}
            rightSection={
              currentNetwork === network.id ? (
                <IconCheck size={16} color="var(--mantine-color-blue-6)" />
              ) : !network.available ? (
                <IconLock size={16} color="var(--mantine-color-gray-5)" />
              ) : null
            }
            disabled={!network.available || switchNetworkMutation.isPending}
            onClick={() => handleNetworkChange(network.id)}
            bg={currentNetwork === network.id ? 'var(--mantine-color-blue-0)' : undefined}
          >
            <div>
              <Text size="sm" fw={currentNetwork === network.id ? 500 : 400}>
                {network.name}
              </Text>
              <Text size="xs" c="dimmed">
                {network.description}
              </Text>
            </div>
          </Menu.Item>
        ))}

        <Menu.Divider />

        {/* Footer info */}
        <Menu.Label>
          <Text size="xs" c="dimmed">
            💡 Each network supports both Core and eSpace
          </Text>
        </Menu.Label>
      </Menu.Dropdown>
    </Menu>
  );
}
