import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconExternalLink, IconInfoCircle } from '@tabler/icons-react';
import { useCurrentNetwork } from '../hooks/useDevKit';
import {
  type Integration,
  type IntegrationType,
  integrationRegistry,
  type NetworkType,
} from '../integrations';

export default function Protocols() {
  const { data: currentNetworkData } = useCurrentNetwork();
  const currentNetwork = (currentNetworkData?.network || 'local') as NetworkType;

  // Filter integrations based on current network
  const availableIntegrations = integrationRegistry.getIntegrationsForNetwork(currentNetwork);

  const getCategoryColor = (category: IntegrationType): string => {
    switch (category) {
      case 'dex':
        return 'blue';
      case 'bridge':
        return 'purple';
      case 'lending':
        return 'green';
      case 'yield':
        return 'orange';
      case 'tools':
        return 'cyan';
      default:
        return 'gray';
    }
  };

  const getCategoryLabel = (category: IntegrationType): string => {
    switch (category) {
      case 'dex':
        return 'DEX';
      case 'bridge':
        return 'Bridge';
      case 'lending':
        return 'Lending';
      case 'yield':
        return 'Yield';
      case 'tools':
        return 'Tools';
      default:
        return 'Other';
    }
  };

  // Group integrations by category
  const integrationsByCategory = availableIntegrations.reduce(
    (acc, integration) => {
      const category = integration.metadata.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(integration);
      return acc;
    },
    {} as Record<IntegrationType, Integration[]>
  );

  return (
    <Stack gap="xl">
      <div>
        <Title order={2} mb="xs">
          DeFi Protocols
        </Title>
        <Text c="dimmed">
          Integrated DeFi protocols on Conflux Network. Connect your wallet to interact directly.
        </Text>
      </div>

      <Group>
        <Badge variant="light" size="lg">
          Network: {currentNetwork.charAt(0).toUpperCase() + currentNetwork.slice(1)}
        </Badge>
        <Badge variant="outline" size="lg">
          {availableIntegrations.length} Available Integration
          {availableIntegrations.length !== 1 ? 's' : ''}
        </Badge>
      </Group>

      {currentNetwork === 'local' && (
        <Alert icon={<IconInfoCircle size={16} />} color="yellow">
          You're on the local network. Some protocols may not be available or use testnet contracts.
        </Alert>
      )}

      {/* Protocol Overview Cards */}
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
        {availableIntegrations.map((integration) => (
          <Card key={integration.metadata.id} withBorder radius="md" p="md">
            <Stack gap="sm">
              <Group justify="space-between">
                <Group gap="sm">
                  <ThemeIcon
                    size="md"
                    radius="md"
                    variant="light"
                    color={getCategoryColor(integration.metadata.category)}
                  >
                    {integration.metadata.icon}
                  </ThemeIcon>
                  <div>
                    <Text fw={600} size="sm">
                      {integration.metadata.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {integration.metadata.description}
                    </Text>
                  </div>
                </Group>
              </Group>

              <Group justify="space-between">
                <Badge
                  color={getCategoryColor(integration.metadata.category)}
                  variant="light"
                  size="xs"
                >
                  {getCategoryLabel(integration.metadata.category)}
                </Badge>
                {integration.metadata.tvl && (
                  <Text size="xs" fw={500} c="green">
                    TVL: {integration.metadata.tvl}
                  </Text>
                )}
              </Group>

              <Group justify="space-between">
                <Group gap="xs">
                  {integration.metadata.networks.map((network) => (
                    <Badge
                      key={network}
                      size="xs"
                      variant={network === currentNetwork ? 'filled' : 'outline'}
                      color={network === currentNetwork ? 'green' : 'gray'}
                    >
                      {network}
                    </Badge>
                  ))}
                </Group>
                {integration.metadata.website && (
                  <Button
                    size="xs"
                    variant="subtle"
                    leftSection={<IconExternalLink size={12} />}
                    onClick={() => window.open(integration.metadata.website, '_blank')}
                  >
                    Visit
                  </Button>
                )}
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {availableIntegrations.length === 0 && (
        <Alert icon={<IconInfoCircle size={16} />} color="blue">
          No protocols available for the current network. Switch to testnet or mainnet to access
          DeFi protocols.
        </Alert>
      )}

      {/* Interactive Integration Widgets */}
      {availableIntegrations.length > 0 && (
        <>
          <Title order={3} mt="xl">
            Interactive Protocols
          </Title>

          <Tabs defaultValue={availableIntegrations[0]?.metadata.id}>
            <Tabs.List>
              {availableIntegrations.map((integration) => (
                <Tabs.Tab
                  key={integration.metadata.id}
                  value={integration.metadata.id}
                  leftSection={integration.metadata.icon}
                >
                  {integration.metadata.name}
                </Tabs.Tab>
              ))}
            </Tabs.List>

            {availableIntegrations.map((integration) => {
              const IntegrationComponent = integration.component;
              return (
                <Tabs.Panel key={integration.metadata.id} value={integration.metadata.id} pt="md">
                  <IntegrationComponent currentNetwork={currentNetwork} isVisible={true} />
                </Tabs.Panel>
              );
            })}
          </Tabs>
        </>
      )}

      {/* All Protocols Overview */}
      {Object.keys(integrationsByCategory).length > 0 && (
        <>
          <Title order={3} mt="xl">
            All Protocol Categories
          </Title>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {(Object.entries(integrationsByCategory) as [IntegrationType, Integration[]][]).map(
              ([category, integrations]) => (
                <Card key={category} withBorder radius="md" p="md">
                  <Stack gap="sm">
                    <Group>
                      <Badge color={getCategoryColor(category)} variant="light">
                        {getCategoryLabel(category)}
                      </Badge>
                      <Text size="sm" c="dimmed">
                        {integrations.length} protocol
                        {integrations.length !== 1 ? 's' : ''}
                      </Text>
                    </Group>

                    <Stack gap="xs">
                      {integrations.map((integration) => (
                        <Group key={integration.metadata.id} justify="space-between">
                          <Group gap="xs">
                            {integration.metadata.icon}
                            <Text size="sm">{integration.metadata.name}</Text>
                          </Group>
                          {integration.metadata.tvl && (
                            <Text size="xs" c="dimmed">
                              {integration.metadata.tvl}
                            </Text>
                          )}
                        </Group>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              )
            )}
          </SimpleGrid>
        </>
      )}

      <Text size="xs" c="dimmed" ta="center" mt="xl">
        Integrations are modular and can be easily added or removed. Each integration is
        network-aware and will only show when compatible.
      </Text>
    </Stack>
  );
}
