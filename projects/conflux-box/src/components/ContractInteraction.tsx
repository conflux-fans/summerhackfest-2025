import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Code,
  CopyButton,
  Group,
  JsonInput,
  NumberInput,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconCheck, IconCode, IconCopy, IconEdit, IconEye } from '@tabler/icons-react';
import { useState } from 'react';
import { useAutoAccounts, useReadContract, useWriteContract } from '../hooks/useDevKit';

interface ContractInfo {
  address: string;
  name: string;
  abi: any[];
  chain: 'core' | 'evm';
  deployedAt: string;
}

interface ContractInteractionProps {
  contract: ContractInfo;
  onRemove?: () => void;
}

export function ContractInteraction({ contract, onRemove }: ContractInteractionProps) {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [functionArgs, setFunctionArgs] = useState<Record<string, any>>({});
  const [accountIndex, setAccountIndex] = useState(0);
  const [readResult, setReadResult] = useState<any>(null);
  const [callError, setCallError] = useState<string | null>(null);

  const readContract = useReadContract();
  const writeContract = useWriteContract();
  const { data: accountsData } = useAutoAccounts();
  const accounts = Array.isArray(accountsData) ? accountsData : accountsData?.accounts || [];

  const readFunctions = contract.abi.filter(
    (func) =>
      func.type === 'function' &&
      (func.stateMutability === 'view' || func.stateMutability === 'pure')
  );

  const writeFunctions = contract.abi.filter(
    (func) =>
      func.type === 'function' && func.stateMutability !== 'view' && func.stateMutability !== 'pure'
  );

  const selectedFunc = contract.abi.find((func) => func.name === selectedFunction);

  const handleFunctionCall = async (isWrite: boolean) => {
    setCallError(null);
    if (!selectedFunc) {
      setCallError('No function selected');
      return;
    }

    if (!contract.address || !contract.abi || !selectedFunction) {
      setCallError('Address, ABI, and function name are required');
      return;
    }

    try {
      const args =
        selectedFunc.inputs?.map((input: any) => {
          const value = functionArgs[input.name];
          if (input.type.includes('uint') && value) {
            return value.toString();
          }
          return value || '';
        }) || [];

      if (isWrite) {
        await writeContract.mutateAsync({
          address: contract.address,
          abi: contract.abi,
          method: selectedFunction,
          args,
          chain: contract.chain,
          accountIndex,
        });
      } else {
        const result = await readContract.mutateAsync({
          address: contract.address,
          abi: contract.abi,
          method: selectedFunction,
          args,
          chain: contract.chain,
        });
        setReadResult(result);
      }
    } catch (error: any) {
      console.error('Contract call failed:', error);
      setCallError(error?.message || String(error));
    }
  };

  const resetForm = () => {
    setSelectedFunction('');
    setFunctionArgs({});
    setReadResult(null);
  };

  return (
    <Card withBorder padding="lg" radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <div>
            <Group gap="sm" mb="xs">
              <Text fw={500}>{contract.name}</Text>
              <Badge color={contract.chain === 'core' ? 'blue' : 'green'}>
                {contract.chain === 'core' ? 'Core Space' : 'eSpace'}
              </Badge>
            </Group>
            <Group gap="xs">
              <Text size="sm" ff="monospace" c="dimmed">
                {contract.address}
              </Text>
              <CopyButton value={contract.address}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied' : 'Copy address'}>
                    <ActionIcon
                      color={copied ? 'teal' : 'gray'}
                      variant="subtle"
                      onClick={copy}
                      size="sm"
                    >
                      {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Text size="xs" c="dimmed">
              Deployed: {new Date(contract.deployedAt).toLocaleString()}
            </Text>
          </div>
          {onRemove && (
            <Button variant="light" color="red" size="xs" onClick={onRemove}>
              Remove
            </Button>
          )}
        </Group>

        <Tabs defaultValue="read" keepMounted={false}>
          <Tabs.List>
            <Tabs.Tab value="read" leftSection={<IconEye size={16} />}>
              Read ({readFunctions.length})
            </Tabs.Tab>
            <Tabs.Tab value="write" leftSection={<IconEdit size={16} />}>
              Write ({writeFunctions.length})
            </Tabs.Tab>
            <Tabs.Tab value="abi" leftSection={<IconCode size={16} />}>
              ABI
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="read" pt="md">
            <Stack gap="sm">
              <Select
                label="Function"
                placeholder="Select a read function"
                data={readFunctions.map((func) => ({
                  value: func.name,
                  label: `${func.name}(${
                    func.inputs?.map((i: any) => `${i.type} ${i.name}`).join(', ') || ''
                  })`,
                }))}
                value={selectedFunction}
                onChange={(value) => {
                  setSelectedFunction(value || '');
                  setFunctionArgs({});
                  setReadResult(null);
                }}
              />

              {selectedFunc?.inputs && selectedFunc.inputs.length > 0 && (
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Parameters
                  </Text>
                  {selectedFunc.inputs.map((input: any) => (
                    <div key={input.name}>
                      {input.type.includes('uint') ? (
                        <NumberInput
                          label={`${input.name} (${input.type})`}
                          value={functionArgs[input.name] || ''}
                          onChange={(value) =>
                            setFunctionArgs((prev) => ({
                              ...prev,
                              [input.name]: value,
                            }))
                          }
                        />
                      ) : (
                        <TextInput
                          label={`${input.name} (${input.type})`}
                          value={functionArgs[input.name] || ''}
                          onChange={(e) =>
                            setFunctionArgs((prev) => ({
                              ...prev,
                              [input.name]: e.target.value,
                            }))
                          }
                        />
                      )}
                    </div>
                  ))}
                </Stack>
              )}

              <Group>
                <Button
                  leftSection={<IconEye size={16} />}
                  onClick={() => handleFunctionCall(false)}
                  disabled={!selectedFunction}
                  loading={readContract.isPending}
                >
                  Read
                </Button>
                <Button variant="light" onClick={resetForm}>
                  Clear
                </Button>
              </Group>

              {callError && (
                <Alert color="red" title="Call Failed">
                  {callError}
                </Alert>
              )}

              {readResult !== null && (
                <Alert color="green" title="Result">
                  <Code block>
                    {typeof readResult === 'object'
                      ? JSON.stringify(readResult, null, 2)
                      : readResult?.toString()}
                  </Code>
                </Alert>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="write" pt="md">
            <Stack gap="sm">
              <Select
                label="Account"
                data={accounts.map((acc: any, index: number) => ({
                  value: index.toString(),
                  label: `Account ${index} (${acc.balance || '0'} CFX)`,
                }))}
                value={accountIndex.toString()}
                onChange={(value) => setAccountIndex(parseInt(value || '0', 10))}
              />

              <Select
                label="Function"
                placeholder="Select a write function"
                data={writeFunctions.map((func) => ({
                  value: func.name,
                  label: `${func.name}(${
                    func.inputs?.map((i: any) => `${i.type} ${i.name}`).join(', ') || ''
                  })`,
                }))}
                value={selectedFunction}
                onChange={(value) => {
                  setSelectedFunction(value || '');
                  setFunctionArgs({});
                }}
              />

              {selectedFunc?.inputs && selectedFunc.inputs.length > 0 && (
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Parameters
                  </Text>
                  {selectedFunc.inputs.map((input: any) => (
                    <div key={input.name}>
                      {input.type.includes('uint') ? (
                        <NumberInput
                          label={`${input.name} (${input.type})`}
                          value={functionArgs[input.name] || ''}
                          onChange={(value) =>
                            setFunctionArgs((prev) => ({
                              ...prev,
                              [input.name]: value,
                            }))
                          }
                        />
                      ) : (
                        <TextInput
                          label={`${input.name} (${input.type})`}
                          value={functionArgs[input.name] || ''}
                          onChange={(e) =>
                            setFunctionArgs((prev) => ({
                              ...prev,
                              [input.name]: e.target.value,
                            }))
                          }
                        />
                      )}
                    </div>
                  ))}
                </Stack>
              )}

              <Group>
                <Button
                  leftSection={<IconEdit size={16} />}
                  onClick={() => handleFunctionCall(true)}
                  disabled={!selectedFunction}
                  loading={writeContract.isPending}
                  color="orange"
                >
                  Execute
                </Button>
                <Button variant="light" onClick={resetForm}>
                  Clear
                </Button>
              </Group>

              {writeContract.isSuccess && (
                <Alert color="green" title="Transaction Successful">
                  The function was executed successfully.
                </Alert>
              )}

              {writeContract.isError && (
                <Alert color="red" title="Transaction Failed">
                  The function execution failed. Check console for details.
                </Alert>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="abi" pt="md">
            <JsonInput
              label="Contract ABI"
              value={JSON.stringify(contract.abi, null, 2)}
              readOnly
              minRows={8}
              maxRows={12}
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Card>
  );
}
