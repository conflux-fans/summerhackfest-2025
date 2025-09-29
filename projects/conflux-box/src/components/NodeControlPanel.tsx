import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  NumberInput,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconActivity,
  IconClock,
  IconPlayerPlay,
  IconPlayerStop,
  IconSettings,
  IconShield,
  IconTool,
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { DevKitApiService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { handleApiError, handleApiSuccess } from '../utils/errorHandling';

interface NodeControlPanelProps {
  currentMiningStatus?: {
    isRunning: boolean;
    interval: number;
    blocksMined: number;
  };
  nodeRunning: boolean;
  networkType: 'local' | 'testnet' | 'mainnet';
}

export function NodeControlPanel({
  currentMiningStatus,
  nodeRunning,
  networkType,
}: NodeControlPanelProps) {
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();
  const [miningInterval, setMiningInterval] = React.useState(currentMiningStatus?.interval || 1000);
  const [blocksToMine, setBlocksToMine] = React.useState(1);

  // Mutations for node operations (moved to top to avoid hook rule violations)
  const startNodeMutation = useMutation({
    mutationFn: DevKitApiService.startNode,
    onSuccess: () => {
      handleApiSuccess('Node started successfully');
      queryClient.invalidateQueries({ queryKey: ['devkit-status'] });
    },
    onError: (error) => {
      handleApiError(error as any, 'Failed to start node');
    },
  });

  const stopNodeMutation = useMutation({
    mutationFn: DevKitApiService.stopNode,
    onSuccess: () => {
      handleApiSuccess('Node stopped successfully');
      queryClient.invalidateQueries({ queryKey: ['devkit-status'] });
    },
    onError: (error) => {
      handleApiError(error as any, 'Failed to stop node');
    },
  });

  const startMiningMutation = useMutation({
    mutationFn: DevKitApiService.startMining,
    onSuccess: () => {
      handleApiSuccess('Mining started successfully');
      queryClient.invalidateQueries({ queryKey: ['devkit-status'] });
    },
    onError: (error) => {
      handleApiError(error as any, 'Failed to start mining');
    },
  });

  const stopMiningMutation = useMutation({
    mutationFn: DevKitApiService.stopMining,
    onSuccess: () => {
      handleApiSuccess('Mining stopped successfully');
      queryClient.invalidateQueries({ queryKey: ['devkit-status'] });
    },
    onError: (error) => {
      handleApiError(error as any, 'Failed to stop mining');
    },
  });

  const setMiningIntervalMutation = useMutation({
    mutationFn: DevKitApiService.setMiningInterval,
    onSuccess: () => {
      handleApiSuccess(`Mining interval set to ${miningInterval}ms`);
      queryClient.invalidateQueries({ queryKey: ['devkit-status'] });
    },
    onError: (error) => {
      handleApiError(error as any, 'Failed to update mining interval');
    },
  });

  const mineBlocksMutation = useMutation({
    mutationFn: DevKitApiService.mineBlocks,
    onSuccess: () => {
      handleApiSuccess(`Successfully mined ${blocksToMine} blocks`);
      queryClient.invalidateQueries({ queryKey: ['devkit-status'] });
    },
    onError: (error) => {
      handleApiError(error as any, 'Failed to mine blocks');
    },
  });

  const isLoading =
    startNodeMutation.isPending ||
    stopNodeMutation.isPending ||
    startMiningMutation.isPending ||
    stopMiningMutation.isPending ||
    setMiningIntervalMutation.isPending ||
    mineBlocksMutation.isPending;

  // Show alert if not local network
  if (networkType !== 'local') {
    return (
      <Card withBorder padding="lg" radius="md">
        <Title order={4} mb="md">
          <Group gap="xs">
            <IconActivity size={20} />
            Network Health Check
          </Group>
        </Title>
        <Alert color="blue">
          <Text size="sm">
            You are connected to <strong>{networkType}</strong> network. Node control is only
            available for local DevKit instances. This will show health checks for remote blockchain
            nodes.
          </Text>
        </Alert>

        {/* TODO: Add remote network health check components */}
        <Stack gap="sm" mt="md">
          <Group justify="space-between">
            <Text size="sm">Core Space RPC</Text>
            <Badge color="green" size="sm">
              Healthy
            </Badge>
          </Group>
          <Group justify="space-between">
            <Text size="sm">eSpace RPC</Text>
            <Badge color="green" size="sm">
              Healthy
            </Badge>
          </Group>
          <Group justify="space-between">
            <Text size="sm">Latest Block</Text>
            <Text size="sm" ff="monospace">
              12,345,678
            </Text>
          </Group>
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder padding="lg" radius="md">
      <Title order={4} mb="md">
        <Group gap="xs">
          <IconActivity size={20} />
          DevKit Node Control
        </Group>
      </Title>

      {!isAdmin && (
        <Alert icon={<IconShield size={16} />} color="yellow" mb="md">
          <Text size="sm">Admin access required for node control operations</Text>
        </Alert>
      )}

      <Stack gap="md">
        {/* Node Operations */}
        <div>
          <Text size="sm" fw={500} mb="xs">
            Node Operations
          </Text>
          <Group gap="xs">
            <Button
              leftSection={<IconPlayerPlay size={16} />}
              color="green"
              variant={nodeRunning ? 'light' : 'filled'}
              disabled={!isAdmin || isLoading || nodeRunning}
              onClick={() => startNodeMutation.mutate()}
              loading={startNodeMutation.isPending}
            >
              {nodeRunning ? 'Node Running' : 'Start Node'}
            </Button>
            <Button
              leftSection={<IconPlayerStop size={16} />}
              color="red"
              disabled={!isAdmin || isLoading || !nodeRunning}
              onClick={() => stopNodeMutation.mutate()}
              loading={stopNodeMutation.isPending}
            >
              Stop Node
            </Button>
          </Group>
        </div>

        <Divider />

        {/* Mining Controls */}
        <div>
          <Text size="sm" fw={500} mb="xs">
            Mining Controls
          </Text>
          <Stack gap="sm">
            <Group gap="xs">
              <Button
                leftSection={<IconTool size={16} />}
                color="blue"
                variant={currentMiningStatus?.isRunning ? 'light' : 'filled'}
                disabled={!isAdmin || isLoading || !nodeRunning || currentMiningStatus?.isRunning}
                onClick={() => startMiningMutation.mutate()}
                loading={startMiningMutation.isPending}
              >
                {currentMiningStatus?.isRunning ? 'Mining Active' : 'Start Mining'}
              </Button>
              <Button
                leftSection={<IconPlayerStop size={16} />}
                color="orange"
                disabled={!isAdmin || isLoading || !nodeRunning || !currentMiningStatus?.isRunning}
                onClick={() => stopMiningMutation.mutate()}
                loading={stopMiningMutation.isPending}
              >
                Pause Mining
              </Button>
            </Group>

            {/* Mining Interval Control */}
            <Group gap="xs" align="end">
              <NumberInput
                label="Mining Interval (ms)"
                value={miningInterval}
                onChange={(value) => setMiningInterval(Number(value))}
                min={100}
                max={60000}
                step={100}
                disabled={!isAdmin || isLoading}
                style={{ width: 150 }}
              />
              <Button
                leftSection={<IconSettings size={16} />}
                color="purple"
                disabled={!isAdmin || isLoading || !nodeRunning}
                onClick={() => setMiningIntervalMutation.mutate(miningInterval)}
                loading={setMiningIntervalMutation.isPending}
              >
                Update
              </Button>
            </Group>

            {/* Manual Mining */}
            <Group gap="xs" align="end">
              <NumberInput
                label="Mine Blocks"
                value={blocksToMine}
                onChange={(value) => setBlocksToMine(Number(value))}
                min={1}
                max={100}
                disabled={!isAdmin || isLoading}
                style={{ width: 120 }}
              />
              <Button
                leftSection={<IconClock size={16} />}
                color="indigo"
                disabled={!isAdmin || isLoading || !nodeRunning}
                onClick={() => mineBlocksMutation.mutate(blocksToMine)}
                loading={mineBlocksMutation.isPending}
              >
                Mine Now
              </Button>
            </Group>
          </Stack>
        </div>

        {/* Mining Status Display */}
        {currentMiningStatus && (
          <>
            <Divider />
            <div>
              <Text size="sm" fw={500} mb="xs">
                Mining Status
              </Text>
              <Card withBorder padding="sm" bg="gray.0">
                <Grid>
                  <Grid.Col span={6}>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Status:
                      </Text>
                      <Badge size="xs" color={currentMiningStatus.isRunning ? 'green' : 'gray'}>
                        {currentMiningStatus.isRunning ? 'Running' : 'Stopped'}
                      </Badge>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Interval:
                      </Text>
                      <Text size="xs" ff="monospace">
                        {currentMiningStatus.interval}ms
                      </Text>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Blocks Mined:
                      </Text>
                      <Text size="xs" fw={500}>
                        {currentMiningStatus.blocksMined}
                      </Text>
                    </Group>
                  </Grid.Col>
                </Grid>
              </Card>
            </div>
          </>
        )}
      </Stack>
    </Card>
  );
}
