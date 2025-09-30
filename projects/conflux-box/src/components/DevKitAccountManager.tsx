import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Code,
  CopyButton,
  Group,
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
  IconSignature,
  IconWallet,
} from '@tabler/icons-react';
import React from 'react';
import { useAutoAccounts, useSignWithDevKitAccount } from '../hooks/useDevKit';
import { useAuthStore } from '../stores/authStore';

export function DevKitAccountManager() {
  const { isConnected } = useAuthStore();
  const { data: accounts } = useAutoAccounts();
  const signMutation = useSignWithDevKitAccount();

  const [selectedAccount, setSelectedAccount] = React.useState<string>('0');
  const [message, setMessage] = React.useState('Hello from Conflux DevKit!');
  const [chain, setChain] = React.useState<'core' | 'evm'>('core');
  const [signature, setSignature] = React.useState<string>('');

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
        chain,
      });

      setSignature(result.signature);
      notifications.show({
        title: 'Message Signed',
        message: 'Message successfully signed with DevKit account',
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

  const handleClearSignature = () => {
    setSignature('');
  };

  if (!isConnected) {
    return (
      <Card withBorder padding="lg" radius="md">
        <Alert icon={<IconInfoCircle size={16} />} color="blue">
          <Text size="sm">Connect your wallet to access DevKit account management features.</Text>
        </Alert>
      </Card>
    );
  }

  return (
    <Card withBorder padding="lg" radius="md">
      <Title order={4} mb="md">
        <Group gap="xs">
          <IconWallet size={20} />
          DevKit Account Manager
        </Group>
      </Title>

      <Tabs defaultValue="signing" variant="outline">
        <Tabs.List>
          <Tabs.Tab value="signing" leftSection={<IconSignature size={16} />}>
            Message Signing
          </Tabs.Tab>
          <Tabs.Tab value="accounts" leftSection={<IconWallet size={16} />}>
            Account Info
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="signing" pt="md">
          <Stack gap="md">
            <Alert icon={<IconInfoCircle size={16} />} color="blue">
              <Text size="sm">
                Sign messages using DevKit managed accounts. These signatures can be used for
                testing authentication flows and message verification.
              </Text>
            </Alert>

            <Group gap="md" grow>
              <Select
                label="DevKit Account"
                value={selectedAccount}
                onChange={(value) => setSelectedAccount(value || '0')}
                data={
                  Array.isArray(accounts)
                    ? accounts.map((account: any, index: number) => ({
                        value: index.toString(),
                        label: `Account ${index} (${account.address?.slice(0, 10)}...)`,
                      }))
                    : []
                }
                disabled={signMutation.isPending}
              />

              <Select
                label="Chain"
                value={chain}
                onChange={(value) => setChain(value as 'core' | 'evm')}
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
                <Button variant="light" color="gray" onClick={handleClearSignature}>
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
                    Chain: {chain}
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

        <Tabs.Panel value="accounts" pt="md">
          <Stack gap="md">
            {accounts && accounts.length > 0 ? (
              accounts.map((account: any, index: number) => (
                <Card key={index} withBorder padding="sm" bg="gray.0">
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={500}>
                      Account {index}
                    </Text>
                    <Group gap="xs">
                      {index === 0 && (
                        <Badge size="xs" color="red">
                          Admin
                        </Badge>
                      )}
                      <CopyButton value={account.address}>
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

                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Core Address:
                      </Text>
                      <Code style={{ fontSize: '11px' }}>{account.address}</Code>
                    </Group>

                    {account.evmAddress && (
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          eSpace Address:
                        </Text>
                        <Code style={{ fontSize: '11px' }}>{account.evmAddress}</Code>
                      </Group>
                    )}

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Balance:
                      </Text>
                      <Text size="xs" ff="monospace">
                        {account.balance || '0'} CFX
                      </Text>
                    </Group>
                  </Stack>
                </Card>
              ))
            ) : (
              <Alert icon={<IconInfoCircle size={16} />} color="gray">
                <Text size="sm">
                  No DevKit accounts available. Start the DevKit node to initialize accounts.
                </Text>
              </Alert>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}
