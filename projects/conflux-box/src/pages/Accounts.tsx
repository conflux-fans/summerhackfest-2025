import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Code,
  CopyButton,
  Group,
  NumberInput,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
  Title,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconCopy,
  IconInfoCircle,
  IconPlus,
  IconRefresh,
  IconSend,
  IconSignature,
  IconWallet,
} from '@tabler/icons-react';
import React from 'react';
import { useAutoAccounts, useSendTransaction, useSignWithDevKitAccount } from '../hooks/useDevKit';
import { useAuthStore } from '../stores/authStore';

export default function Accounts() {
  const { isConnected } = useAuthStore();
  const { data: accountsData, isLoading, refetch } = useAutoAccounts();
  const accounts = Array.isArray(accountsData) ? accountsData : accountsData?.accounts || [];

  const sendMutation = useSendTransaction();
  const signMutation = useSignWithDevKitAccount();

  const [selectedAccount, setSelectedAccount] = React.useState<string>('0');
  const [activeTab, setActiveTab] = React.useState('overview');

  // Transfer form state
  const [transferTo, setTransferTo] = React.useState('');
  const [transferAmount, setTransferAmount] = React.useState<number | ''>('');
  const [transferChain, setTransferChain] = React.useState<'core' | 'evm'>('core');

  // Sign message state
  const [message, setMessage] = React.useState('Hello from Conflux DevKit!');
  const [signChain, setSignChain] = React.useState<'core' | 'evm'>('core');
  const [signature, setSignature] = React.useState<string>('');

  const selectedAccountData = accounts?.[parseInt(selectedAccount, 10)] || accounts?.[0];

  const handleTransfer = async () => {
    if (!transferTo.trim() || !transferAmount) {
      notifications.show({
        title: 'Error',
        message: 'Please fill in recipient address and amount',
        color: 'red',
      });
      return;
    }

    try {
      const result = await sendMutation.mutateAsync({
        to: transferTo.trim(),
        value: transferAmount.toString(),
        chain: transferChain,
        accountIndex: parseInt(selectedAccount, 10),
      });

      notifications.show({
        title: 'Transfer Sent',
        message: `Transaction hash: ${result.transactionHash}`,
        color: 'green',
      });

      setTransferTo('');
      setTransferAmount('');
    } catch (error) {
      notifications.show({
        title: 'Transfer Failed',
        message: error instanceof Error ? error.message : 'Failed to send transaction',
        color: 'red',
      });
    }
  };

  const handleSign = async () => {
    if (!message.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Please enter a message to sign',
        color: 'red',
      });
      return;
    }

    try {
      const result = await signMutation.mutateAsync({
        accountIndex: parseInt(selectedAccount, 10),
        message: message.trim(),
        chain: signChain,
      });

      setSignature(result.signature);
      notifications.show({
        title: 'Message Signed',
        message: 'Message successfully signed',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Signing Failed',
        message: error instanceof Error ? error.message : 'Failed to sign message',
        color: 'red',
      });
    }
  };

  if (!isConnected) {
    return (
      <Stack>
        <Title order={2}>Accounts</Title>
        <Card withBorder padding="lg" radius="md">
          <Alert icon={<IconInfoCircle size={16} />} color="blue">
            <Text size="sm">Connect your wallet to access DevKit account management features.</Text>
          </Alert>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>DevKit Account Manager</Title>
        <Group>
          <Button
            leftSection={<IconRefresh size={16} />}
            variant="light"
            onClick={() => refetch()}
            loading={isLoading}
          >
            Refresh
          </Button>
          <Button leftSection={<IconPlus size={16} />}>Create Account</Button>
        </Group>
      </Group>

      {(!accounts || accounts.length === 0) && !isLoading ? (
        <Card withBorder padding="xl" radius="md">
          <Stack align="center" gap="sm">
            <IconWallet size={48} color="gray" />
            <Text c="dimmed">No DevKit accounts found</Text>
            <Text size="sm" c="dimmed">
              Start the DevKit node to initialize accounts
            </Text>
          </Stack>
        </Card>
      ) : (
        <Card withBorder padding="lg" radius="md">
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')}>
            <Tabs.List>
              <Tabs.Tab value="overview" leftSection={<IconWallet size={16} />}>
                Account Overview
              </Tabs.Tab>
              <Tabs.Tab value="transfer" leftSection={<IconSend size={16} />}>
                Transfer CFX
              </Tabs.Tab>
              <Tabs.Tab value="signing" leftSection={<IconSignature size={16} />}>
                Message Signing
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview" pt="md">
              <Stack gap="md">
                <Group gap="md" grow>
                  <Select
                    label="Select Account"
                    value={selectedAccount}
                    onChange={(value) => setSelectedAccount(value || '0')}
                    data={
                      accounts?.map((account: any, index: number) => ({
                        value: index.toString(),
                        label: `Account ${index} (${(
                          account.addresses?.core || account.address
                        )?.slice(0, 10)}...)`,
                      })) || []
                    }
                  />
                </Group>

                {selectedAccountData && (
                  <Card withBorder padding="md" bg="gray.0">
                    <Group justify="space-between" mb="sm">
                      <Text size="lg" fw={600}>
                        Account {selectedAccount}
                      </Text>
                      <Group gap="xs">
                        {parseInt(selectedAccount, 10) === 0 && (
                          <Badge size="sm" color="red">
                            Admin
                          </Badge>
                        )}
                        <Badge size="sm" color="blue">
                          Balance: {selectedAccountData.balance || '0'} CFX
                        </Badge>
                      </Group>
                    </Group>

                    <Stack gap="sm">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Core Address:
                        </Text>
                        <Group gap="xs">
                          <Code style={{ fontSize: '11px' }}>
                            {selectedAccountData.addresses?.core || selectedAccountData.address}
                          </Code>
                          <CopyButton
                            value={
                              selectedAccountData.addresses?.core || selectedAccountData.address
                            }
                          >
                            {({ copied, copy }) => (
                              <Tooltip label={copied ? 'Copied!' : 'Copy address'}>
                                <ActionIcon
                                  size="sm"
                                  color={copied ? 'teal' : 'gray'}
                                  variant="subtle"
                                  onClick={copy}
                                >
                                  {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </CopyButton>
                        </Group>
                      </Group>

                      {selectedAccountData.addresses?.evm && (
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            eSpace Address:
                          </Text>
                          <Group gap="xs">
                            <Code style={{ fontSize: '11px' }}>
                              {selectedAccountData.addresses.evm}
                            </Code>
                            <CopyButton value={selectedAccountData.addresses.evm}>
                              {({ copied, copy }) => (
                                <Tooltip label={copied ? 'Copied!' : 'Copy address'}>
                                  <ActionIcon
                                    size="sm"
                                    color={copied ? 'teal' : 'gray'}
                                    variant="subtle"
                                    onClick={copy}
                                  >
                                    {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </CopyButton>
                          </Group>
                        </Group>
                      )}
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="transfer" pt="md">
              <Stack gap="md">
                <Alert icon={<IconInfoCircle size={16} />} color="blue">
                  <Text size="sm">Send CFX from your selected DevKit account to any address.</Text>
                </Alert>

                <Group gap="md" grow>
                  <Select
                    label="From Account"
                    value={selectedAccount}
                    onChange={(value) => setSelectedAccount(value || '0')}
                    data={
                      accounts?.map((account: any, index: number) => ({
                        value: index.toString(),
                        label: `Account ${index} (${account.balance || '0'} CFX)`,
                      })) || []
                    }
                    disabled={sendMutation.isPending}
                  />

                  <Select
                    label="Chain"
                    value={transferChain}
                    onChange={(value) => setTransferChain(value as 'core' | 'evm')}
                    data={[
                      { value: 'core', label: 'Core Space' },
                      { value: 'evm', label: 'eSpace (EVM)' },
                    ]}
                    disabled={sendMutation.isPending}
                  />
                </Group>

                <Textarea
                  label="Recipient Address"
                  placeholder="Enter the destination address..."
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  disabled={sendMutation.isPending}
                  minRows={2}
                />

                <NumberInput
                  label="Amount (CFX)"
                  placeholder="Enter amount to send..."
                  value={transferAmount}
                  onChange={(value) =>
                    setTransferAmount(typeof value === 'string' ? parseFloat(value) || '' : value)
                  }
                  disabled={sendMutation.isPending}
                  min={0}
                  step={0.1}
                  decimalScale={6}
                />

                <Button
                  leftSection={<IconSend size={16} />}
                  onClick={handleTransfer}
                  loading={sendMutation.isPending}
                  disabled={!transferTo.trim() || !transferAmount}
                >
                  Send Transaction
                </Button>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="signing" pt="md">
              <Stack gap="md">
                <Alert icon={<IconInfoCircle size={16} />} color="blue">
                  <Text size="sm">
                    Sign messages using DevKit managed accounts for testing authentication flows.
                  </Text>
                </Alert>

                <Group gap="md" grow>
                  <Select
                    label="DevKit Account"
                    value={selectedAccount}
                    onChange={(value) => setSelectedAccount(value || '0')}
                    data={
                      accounts?.map((account: any, index: number) => ({
                        value: index.toString(),
                        label: `Account ${index} (${(
                          account.addresses?.core || account.address
                        )?.slice(0, 10)}...)`,
                      })) || []
                    }
                    disabled={signMutation.isPending}
                  />

                  <Select
                    label="Chain"
                    value={signChain}
                    onChange={(value) => setSignChain(value as 'core' | 'evm')}
                    data={[
                      { value: 'core', label: 'Core Space' },
                      { value: 'evm', label: 'eSpace (EVM)' },
                    ]}
                    disabled={signMutation.isPending}
                  />
                </Group>

                <Textarea
                  label="Message to Sign"
                  placeholder="Enter the message you want to sign..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  minRows={3}
                  maxRows={6}
                  disabled={signMutation.isPending}
                />

                <Group gap="xs">
                  <Button
                    leftSection={<IconSignature size={16} />}
                    onClick={handleSign}
                    loading={signMutation.isPending}
                    disabled={!message.trim()}
                  >
                    Sign Message
                  </Button>

                  {signature && (
                    <Button variant="light" color="gray" onClick={() => setSignature('')}>
                      Clear Result
                    </Button>
                  )}
                </Group>

                {signature && (
                  <Card withBorder padding="md" bg="gray.0">
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" fw={500}>
                        Signature Result
                      </Text>
                      <CopyButton value={signature}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Copied!' : 'Copy signature'}>
                            <ActionIcon
                              color={copied ? 'teal' : 'gray'}
                              variant="subtle"
                              onClick={copy}
                            >
                              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>
                    <Code block style={{ fontSize: '12px', overflowWrap: 'break-word' }}>
                      {signature}
                    </Code>

                    <Group gap="xs" mt="xs">
                      <Badge size="xs" color="blue">
                        Chain: {signChain}
                      </Badge>
                      <Badge size="xs" color="green">
                        Account: {selectedAccount}
                      </Badge>
                      <Badge size="xs" color="purple">
                        Length: {signature.length}
                      </Badge>
                    </Group>
                  </Card>
                )}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Card>
      )}
    </Stack>
  );
}
