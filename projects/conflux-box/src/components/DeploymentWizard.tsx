import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  JsonInput,
  Modal,
  NumberInput,
  Select,
  Stack,
  Stepper,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { IconCheck, IconRocket } from '@tabler/icons-react';
import { useState } from 'react';
import { type ContractTemplate, contractTemplates } from '../data/contractTemplates';
import { useAutoAccounts, useDeployContract } from '../hooks/useDevKit';

interface DeploymentWizardProps {
  opened: boolean;
  onClose: () => void;
  selectedTemplate?: ContractTemplate;
  onDeploymentSuccess?: (
    contracts: Array<{
      address: string;
      name: string;
      abi: any[];
      chain: 'core' | 'evm';
      deployedAt: string;
    }>
  ) => void;
}

export function DeploymentWizard({
  opened,
  onClose,
  selectedTemplate,
  onDeploymentSuccess,
}: DeploymentWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [template, setTemplate] = useState<ContractTemplate | null>(selectedTemplate || null);
  const [chain, setChain] = useState<'core' | 'evm'>('core');
  const [accountIndex, setAccountIndex] = useState(0);
  const [constructorArgs, setConstructorArgs] = useState<Record<string, any>>({});
  const [customAbi, setCustomAbi] = useState('');
  const [customBytecode, setCustomBytecode] = useState('');
  const [deployToBoth, setDeployToBoth] = useState(true);

  const deployContract = useDeployContract();
  const { data: accountsData } = useAutoAccounts();
  const accounts = Array.isArray(accountsData) ? accountsData : accountsData?.accounts || [];

  const nextStep = () => setActiveStep((current) => Math.min(current + 1, 3));
  const prevStep = () => setActiveStep((current) => Math.max(current - 1, 0));

  const handleTemplateSelect = (templateId: string) => {
    const selectedTemplate = contractTemplates.find((t) => t.id === templateId);
    setTemplate(selectedTemplate || null);
    if (selectedTemplate?.constructorArgs) {
      const defaultArgs: Record<string, any> = {};
      selectedTemplate.constructorArgs.forEach((arg) => {
        defaultArgs[arg.name] = arg.defaultValue || '';
      });
      setConstructorArgs(defaultArgs);
    }
  };

  const handleDeploy = async () => {
    try {
      let abi: any,
        bytecode: string,
        args: any[] = [];

      if (template) {
        abi = template.abi;
        bytecode = template.bytecode;
        if (template.constructorArgs) {
          args = template.constructorArgs.map((arg) => {
            const value = constructorArgs[arg.name];
            if (arg.type === 'uint256') {
              return value.toString();
            }
            return value;
          });
        }
      } else {
        abi = JSON.parse(customAbi);
        bytecode = customBytecode;
      }

      const deployedContracts: Array<{
        address: string;
        name: string;
        abi: any[];
        chain: 'core' | 'evm';
        deployedAt: string;
      }> = [];

      if (deployToBoth) {
        // Deploy to both chains
        const coreResult = await deployContract.mutateAsync({
          abi,
          bytecode,
          args,
          chain: 'core',
          accountIndex,
        });

        const evmResult = await deployContract.mutateAsync({
          abi,
          bytecode,
          args,
          chain: 'evm',
          accountIndex,
        });

        // Debug: log raw API responses
        // eslint-disable-next-line no-console
        console.debug('Deployment results:', { coreResult, evmResult });

        if (coreResult?.address) {
          deployedContracts.push({
            address: coreResult.address,
            name: template?.name || 'Custom Contract',
            abi,
            chain: 'core',
            deployedAt: new Date().toISOString(),
          });
        }

        if (evmResult?.address) {
          deployedContracts.push({
            address: evmResult.address,
            name: template?.name || 'Custom Contract',
            abi,
            chain: 'evm',
            deployedAt: new Date().toISOString(),
          });
        }
      } else {
        const result = await deployContract.mutateAsync({
          abi,
          bytecode,
          args,
          chain,
          accountIndex,
        });

        // Debug: log raw API response
        // eslint-disable-next-line no-console
        console.debug('Deployment single-chain result:', { result });

        if (result?.address) {
          deployedContracts.push({
            address: result.address,
            name: template?.name || 'Custom Contract',
            abi,
            chain,
            deployedAt: new Date().toISOString(),
          });
        }
      }

      // Debug final constructed array
      // eslint-disable-next-line no-console
      console.debug('Final deployedContracts array:', deployedContracts);

      // Notify parent component of successful deployment
      if (deployedContracts.length > 0 && onDeploymentSuccess) {
        onDeploymentSuccess(deployedContracts);
      }

      setActiveStep(3); // Success step
    } catch (error) {
      console.error('Deployment failed:', error);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setTemplate(selectedTemplate || null);
    setConstructorArgs({});
    setCustomAbi('');
    setCustomBytecode('');
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Deploy Smart Contract" size="lg" centered>
      <Stepper active={activeStep}>
        <Stepper.Step label="Select" description="Choose contract type">
          <Stack gap="md">
            {!selectedTemplate && (
              <Select
                label="Contract Template"
                placeholder="Choose a template or select custom"
                data={[
                  ...contractTemplates.map((t) => ({
                    value: t.id,
                    label: t.name,
                  })),
                  { value: 'custom', label: 'Custom Contract' },
                ]}
                value={template?.id || ''}
                onChange={(value) => {
                  if (value === 'custom') {
                    setTemplate(null);
                  } else if (value) {
                    handleTemplateSelect(value);
                  }
                }}
              />
            )}

            {selectedTemplate && (
              <Card withBorder padding="md">
                <Group justify="space-between" mb="sm">
                  <Text fw={500}>{selectedTemplate.name}</Text>
                  <Badge>{selectedTemplate.category}</Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  {selectedTemplate.description}
                </Text>
              </Card>
            )}

            {template && (
              <Card withBorder padding="md">
                <Group justify="space-between" mb="sm">
                  <Text fw={500}>{template.name}</Text>
                  <Badge>{template.category}</Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  {template.description}
                </Text>
              </Card>
            )}

            {template === null && !selectedTemplate && (
              <Stack gap="sm">
                <Text fw={500}>Custom Contract</Text>
                <JsonInput
                  label="Contract ABI"
                  placeholder="Paste contract ABI JSON..."
                  value={customAbi}
                  onChange={setCustomAbi}
                  minRows={4}
                  validationError="Invalid JSON"
                />
                <TextInput
                  label="Bytecode"
                  placeholder="0x..."
                  value={customBytecode}
                  onChange={(e) => setCustomBytecode(e.target.value)}
                />
              </Stack>
            )}
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Configure" description="Set parameters">
          <Stack gap="md">
            <Group grow>
              <Select
                label="Deploy From Account"
                data={accounts.map((acc: any, index: number) => ({
                  value: index.toString(),
                  label: `Account ${index} (${acc.balance || '0'} CFX)`,
                }))}
                value={accountIndex.toString()}
                onChange={(value) => setAccountIndex(parseInt(value || '0', 10))}
              />
            </Group>

            <Switch
              label="Deploy to both Core and eSpace"
              description="Deploy the same contract to both Conflux chains"
              checked={deployToBoth}
              onChange={(e) => setDeployToBoth(e.currentTarget.checked)}
            />

            {!deployToBoth && (
              <Select
                label="Target Chain"
                data={[
                  { value: 'core', label: 'Core Space' },
                  { value: 'evm', label: 'eSpace (EVM)' },
                ]}
                value={chain}
                onChange={(value) => setChain(value as 'core' | 'evm')}
              />
            )}

            {template?.constructorArgs && template.constructorArgs.length > 0 && (
              <Stack gap="sm">
                <Text fw={500}>Constructor Arguments</Text>
                {template.constructorArgs.map((arg) => (
                  <div key={arg.name}>
                    {arg.type === 'uint256' ? (
                      <NumberInput
                        label={arg.name}
                        description={arg.description}
                        value={constructorArgs[arg.name] || ''}
                        onChange={(value) =>
                          setConstructorArgs((prev) => ({
                            ...prev,
                            [arg.name]: value,
                          }))
                        }
                      />
                    ) : (
                      <TextInput
                        label={arg.name}
                        description={arg.description}
                        value={constructorArgs[arg.name] || ''}
                        onChange={(e) =>
                          setConstructorArgs((prev) => ({
                            ...prev,
                            [arg.name]: e.target.value,
                          }))
                        }
                      />
                    )}
                  </div>
                ))}
              </Stack>
            )}
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Deploy" description="Deploy contract">
          <Stack gap="md">
            <Alert icon={<IconRocket size={16} />} color="blue">
              Ready to deploy contract to {deployToBoth ? 'both Core and eSpace' : chain}.
            </Alert>

            {template && (
              <Card withBorder padding="md">
                <Text fw={500} mb="sm">
                  Contract Details
                </Text>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Template:</Text>
                  <Text size="sm" fw={500}>
                    {template.name}
                  </Text>
                </Group>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Account:</Text>
                  <Text size="sm" ff="monospace">
                    Account {accountIndex}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Target:</Text>
                  <Text size="sm" fw={500}>
                    {deployToBoth ? 'Core + eSpace' : chain === 'core' ? 'Core Space' : 'eSpace'}
                  </Text>
                </Group>
              </Card>
            )}

            <Button
              fullWidth
              onClick={handleDeploy}
              loading={deployContract.isPending}
              leftSection={<IconRocket size={16} />}
            >
              Deploy Contract
            </Button>
          </Stack>
        </Stepper.Step>

        <Stepper.Completed>
          <Stack gap="md" align="center">
            <IconCheck size={48} color="green" />
            <Text fw={500} size="lg">
              Contract Deployed Successfully!
            </Text>
            <Text size="sm" ta="center" c="dimmed">
              Your contract has been deployed and is now available for interaction.
            </Text>
            <Button onClick={handleClose}>Close</Button>
          </Stack>
        </Stepper.Completed>
      </Stepper>

      {activeStep < 3 && (
        <Group justify="space-between" mt="xl">
          <Button variant="default" onClick={prevStep} disabled={activeStep === 0}>
            Back
          </Button>
          <Button
            onClick={nextStep}
            disabled={(activeStep === 0 && !template && !customAbi) || activeStep === 2}
          >
            {activeStep === 2 ? 'Deploy' : 'Next'}
          </Button>
        </Group>
      )}
    </Modal>
  );
}
