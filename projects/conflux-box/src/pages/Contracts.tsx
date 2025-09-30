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
  Title,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCode,
  IconFileText,
  IconPlayerPlay,
  IconPlus,
  IconRocket,
  IconTemplate,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { ContractInteraction } from '../components/ContractInteraction';
import { DeploymentWizard } from '../components/DeploymentWizard';
import { type ContractTemplate, contractTemplates } from '../data/contractTemplates';
import { useAutoDevKitStatus, useCurrentNetwork, useStartNode } from '../hooks/useDevKit';

interface DeployedContract {
  address: string;
  name: string;
  abi: any[];
  chain: 'core' | 'evm';
  deployedAt: string;
}

export default function Contracts() {
  const { data: devkitStatus } = useAutoDevKitStatus();
  const { data: currentNetworkData } = useCurrentNetwork();
  const startNodeMutation = useStartNode();

  const [wizardOpened, setWizardOpened] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | undefined>(undefined);
  const [deployedContracts, setDeployedContracts] = useState<DeployedContract[]>([]);

  const currentNetwork = currentNetworkData?.network || 'local';
  const nodeRunning = devkitStatus?.running || false;
  const isExternalNetwork = currentNetwork !== 'local';

  // Load deployed contracts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('deployedContracts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setDeployedContracts(parsed);
        else console.warn('deployedContracts in localStorage is not an array, ignoring');
      } catch (error) {
        console.error('Failed to parse deployed contracts:', error);
      }
    }
  }, []);

  // Save deployed contracts to localStorage
  useEffect(() => {
    localStorage.setItem('deployedContracts', JSON.stringify(deployedContracts));
  }, [deployedContracts]);

  const openWizard = (template?: ContractTemplate) => {
    setSelectedTemplate(template);
    setWizardOpened(true);
  };

  const handleDeploymentSuccess = (contracts: DeployedContract[]) => {
    setDeployedContracts((prev) => {
      const combined = [...prev];
      contracts.forEach((c) => {
        const exists = combined.some((x) => x.address === c.address && x.chain === c.chain);
        if (!exists) combined.push(c);
      });
      return combined;
    });
    setWizardOpened(false);
  };

  const handleTemplateQuickDeploy = (template: ContractTemplate) => {
    openWizard(template);
  };

  const removeContract = (index: number) => {
    setDeployedContracts((prev) => prev.filter((_, i) => i !== index));
  };

  // Disable contracts when on local network and node is not running
  const isDisabled = currentNetwork === 'local' && !nodeRunning;

  if (isDisabled) {
    return (
      <Stack>
        <Title order={2}>Smart Contracts</Title>

        <Alert
          icon={<IconAlertCircle size={16} />}
          color="yellow"
          title="Node Required for Contract Operations"
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="sm">
                Contract deployment and interaction requires a running local DevKit node when
                connected to the local network.
              </Text>
            </div>
            <Button
              leftSection={<IconPlayerPlay size={14} />}
              color="green"
              size="sm"
              onClick={() => startNodeMutation.mutate()}
              loading={startNodeMutation.isPending}
            >
              Start Node
            </Button>
          </Group>
        </Alert>

        <Card withBorder padding="xl" radius="md" style={{ opacity: 0.6 }}>
          <Stack align="center" gap="sm">
            <IconCode size={48} color="gray" />
            <Text c="dimmed">Contract operations disabled</Text>
            <Text size="sm" c="dimmed" ta="center">
              Start the local DevKit node to deploy and interact with smart contracts
            </Text>
            <Button
              leftSection={<IconPlayerPlay size={16} />}
              color="green"
              onClick={() => startNodeMutation.mutate()}
              loading={startNodeMutation.isPending}
            >
              Start Node Now
            </Button>
          </Stack>
        </Card>

        <DeploymentWizard
          opened={wizardOpened}
          onClose={() => setWizardOpened(false)}
          selectedTemplate={selectedTemplate}
          onDeploymentSuccess={(contracts) => {
            // Append new contracts (avoid duplicates by address+chain)
            setDeployedContracts((prev) => {
              const combined = [...prev];
              contracts.forEach((c) => {
                const exists = combined.some((x) => x.address === c.address && x.chain === c.chain);
                if (!exists) combined.push(c);
              });
              return combined;
            });
            setWizardOpened(false);
          }}
        />
      </Stack>
    );
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Smart Contracts</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => openWizard()}
          disabled={isExternalNetwork}
        >
          Deploy Contract
        </Button>
      </Group>

      {isExternalNetwork && (
        <Alert icon={<IconAlertCircle size={16} />} color="blue" title="External Network Mode">
          <Text size="sm">
            You are connected to <strong>{currentNetwork}</strong> network. Contract deployment and
            interaction features are currently limited to local DevKit instances. When the backend
            adds external network support, you'll be able to interact with contracts on testnet and
            mainnet.
          </Text>
        </Alert>
      )}

      <Tabs defaultValue="deployed">
        <Tabs.List>
          <Tabs.Tab value="deployed" leftSection={<IconRocket size={16} />}>
            Deployed
          </Tabs.Tab>
          <Tabs.Tab value="templates" leftSection={<IconFileText size={16} />}>
            Templates
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="deployed" pt="md">
          {deployedContracts.length === 0 ? (
            <Card withBorder padding="xl" radius="md">
              <Stack align="center" gap="sm">
                <IconCode size={48} color="gray" />
                <Text c="dimmed">No contracts deployed yet</Text>
                <Button leftSection={<IconPlus size={16} />} onClick={() => openWizard()}>
                  Deploy Your First Contract
                </Button>
              </Stack>
            </Card>
          ) : (
            <Stack gap="md">
              {deployedContracts.map((contract, index) => (
                <ContractInteraction
                  key={`${contract.address}-${contract.chain}`}
                  contract={contract}
                  onRemove={() => removeContract(index)}
                />
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="templates" pt="md">
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
            {contractTemplates.map((template) => (
              <Card key={template.id} withBorder padding="lg" radius="md">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={500}>{template.name}</Text>
                    <Badge size="sm">{template.category}</Badge>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {template.description}
                  </Text>
                  <Group justify="space-between" mt="auto">
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<IconTemplate size={14} />}
                      onClick={() => openWizard(template)}
                    >
                      Configure
                    </Button>
                    <Button size="xs" onClick={() => handleTemplateQuickDeploy(template)}>
                      Quick Deploy
                    </Button>
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>

      <DeploymentWizard
        opened={wizardOpened}
        onClose={() => setWizardOpened(false)}
        selectedTemplate={selectedTemplate}
        onDeploymentSuccess={handleDeploymentSuccess}
      />
    </Stack>
  );
}
