import {
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconDeviceFloppy, IconRefresh } from '@tabler/icons-react';

export default function Settings() {
  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Settings</Title>
        <Group>
          <Button leftSection={<IconRefresh size={16} />} variant="light">
            Reset
          </Button>
          <Button leftSection={<IconDeviceFloppy size={16} />}>Save Changes</Button>
        </Group>
      </Group>

      <Card withBorder padding="lg" radius="md">
        <Text fw={500} mb="md">
          Development Node
        </Text>
        <Stack gap="md">
          <Group grow>
            <NumberInput
              label="Block Interval (ms)"
              placeholder="1000"
              min={100}
              max={10000}
              defaultValue={1000}
            />
            <Select
              label="Network Mode"
              placeholder="Select mode"
              data={[
                { value: 'local', label: 'Local Development' },
                { value: 'testnet', label: 'Testnet' },
                { value: 'mainnet', label: 'Mainnet' },
              ]}
              defaultValue="local"
            />
          </Group>
          <Group grow>
            <Switch label="Auto Mining" description="Automatically mine blocks" defaultChecked />
            <Switch
              label="Instant Mining"
              description="Mine blocks immediately on transaction"
              defaultChecked
            />
          </Group>
        </Stack>
      </Card>

      <Card withBorder padding="lg" radius="md">
        <Text fw={500} mb="md">
          Backend Configuration
        </Text>
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="API Endpoint"
              placeholder="http://localhost:3001"
              defaultValue="http://localhost:3001"
            />
            <TextInput
              label="WebSocket Endpoint"
              placeholder="ws://localhost:3002"
              defaultValue="ws://localhost:3002"
            />
          </Group>
          <Switch
            label="Auto Reconnect"
            description="Automatically reconnect to backend services"
            defaultChecked
          />
        </Stack>
      </Card>

      <Card withBorder padding="lg" radius="md">
        <Text fw={500} mb="md">
          UI Preferences
        </Text>
        <Stack gap="md">
          <Select
            label="Theme"
            placeholder="Select theme"
            data={[
              { value: 'auto', label: 'Auto (System)' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            defaultValue="auto"
          />
          <Switch
            label="Show Advanced Options"
            description="Display advanced configuration options"
          />
          <Switch
            label="Enable Notifications"
            description="Show desktop notifications for transactions"
            defaultChecked
          />
        </Stack>
      </Card>
    </Stack>
  );
}
