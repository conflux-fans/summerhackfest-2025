import type { PoolsData } from "@chainbrawler/core";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconClock,
  IconCode,
  IconCoins,
  IconDownload,
  IconGasStation,
  IconRefresh,
  IconShield,
} from "@tabler/icons-react";
import { rateLimitedRead } from "../../utils/rateLimiter";

interface PoolsDisplayProps {
  pools: PoolsData | null;
  isLoading: boolean;
  error: string | null;
  onLoadPools: () => Promise<void>;
  onRefreshPools: () => Promise<void>;
}

export function PoolsDisplay({
  pools,
  isLoading,
  error,
  onLoadPools,
  onRefreshPools,
}: PoolsDisplayProps) {
  const handleLoadPools = async () => {
    try {
      await rateLimitedRead(
        "poolsDisplay_loadPools",
        () => onLoadPools(),
        10000 // 10 seconds cache
      );
    } catch (error) {
      console.error("Failed to load pools:", error);
    }
  };

  const handleRefreshPools = async () => {
    try {
      await rateLimitedRead(
        "poolsDisplay_refreshPools",
        () => onRefreshPools(),
        5000 // 5 seconds cache
      );
    } catch (error) {
      console.error("Failed to refresh pools:", error);
    }
  };

  const formatAmount = (amount: bigint | number | undefined) => {
    if (!amount) return "0 CFX";
    const value = typeof amount === "bigint" ? Number(amount) : amount;
    return `${(value / 1e18).toFixed(4)} CFX`;
  };

  const poolItems = [
    {
      key: "prizePool",
      title: "Prize Pool",
      description: "Rewards for top players each epoch",
      icon: IconCoins,
      color: "yellow",
      value: pools?.prizePool?.formatted || "0 CFX",
      rawValue: pools?.prizePool?.value,
    },
    {
      key: "equipmentPool",
      title: "Equipment Pool",
      description: "Funding for equipment drops",
      icon: IconShield,
      color: "blue",
      value: pools?.equipmentPool?.formatted || "0 CFX",
      rawValue: pools?.equipmentPool?.value,
    },
    {
      key: "gasRefundPool",
      title: "Gas Refund Pool",
      description: "Gas fee reimbursements",
      icon: IconGasStation,
      color: "green",
      value: pools?.gasRefundPool?.formatted || "0 CFX",
      rawValue: pools?.gasRefundPool?.value,
    },
    {
      key: "developerPool",
      title: "Developer Pool",
      description: "Development funding",
      icon: IconCode,
      color: "purple",
      value: pools?.developerPool?.formatted || "0 CFX",
      rawValue: pools?.developerPool?.value,
    },
    {
      key: "nextEpochPool",
      title: "Next Epoch Pool",
      description: "Reserved for next epoch rewards",
      icon: IconClock,
      color: "cyan",
      value: pools?.nextEpochPool?.formatted || "0 CFX",
      rawValue: pools?.nextEpochPool?.value,
    },
    {
      key: "emergencyPool",
      title: "Emergency Pool",
      description: "Emergency funds and contingency",
      icon: IconAlertTriangle,
      color: "red",
      value: pools?.emergencyPool?.formatted || "0 CFX",
      rawValue: pools?.emergencyPool?.value,
    },
  ];

  return (
    <Card withBorder radius="md" p="xl" style={{ position: "relative" }}>
      <LoadingOverlay visible={isLoading} overlayProps={{ radius: "md", blur: 2 }} />

      <Group justify="space-between" mb="md">
        <Title order={3} c="white">
          Treasury Pools
        </Title>
        <Group>
          <Button
            leftSection={<IconDownload size={16} />}
            onClick={handleLoadPools}
            disabled={isLoading}
            variant="light"
            size="sm"
          >
            Load
          </Button>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={handleRefreshPools}
            disabled={isLoading}
            variant="filled"
            size="sm"
          >
            Refresh
          </Button>
        </Group>
      </Group>

      {error && (
        <Alert icon={<IconAlertTriangle size={16} />} title="Error" color="red" mb="md">
          {error}
        </Alert>
      )}

      {pools && (
        <Stack gap="md">
          {/* Pool Grid */}
          <Grid>
            {poolItems.map((pool) => (
              <Grid.Col key={pool.key} span={{ base: 12, sm: 6, md: 4 }}>
                <Card withBorder radius="md" p="md" h="100%">
                  <Group mb="xs">
                    <ThemeIcon color={pool.color} variant="light" size="sm">
                      <pool.icon size={16} />
                    </ThemeIcon>
                    <Text fw={500} size="sm" c="dimmed">
                      {pool.title}
                    </Text>
                  </Group>

                  <Text fw={700} size="lg" c="white">
                    {pool.value}
                  </Text>

                  <Text size="xs" c="dimmed" mt="xs">
                    {pool.description}
                  </Text>
                </Card>
              </Grid.Col>
            ))}
          </Grid>

          {/* Total Value */}
          <Card withBorder radius="md" p="md" bg="dark.6">
            <Group justify="space-between">
              <Text fw={600} size="lg" c="white">
                Total Treasury Value
              </Text>
              <Badge size="lg" variant="gradient" gradient={{ from: "blue", to: "purple" }}>
                {pools.totalValue ? formatAmount(pools.totalValue) : "0 CFX"}
              </Badge>
            </Group>
          </Card>

          {/* Last Updated */}
          {pools.lastUpdated && (
            <Text size="xs" c="dimmed" ta="center">
              Last updated: {new Date(pools.lastUpdated).toLocaleString()}
            </Text>
          )}
        </Stack>
      )}

      {!pools && !isLoading && !error && (
        <Box ta="center" py="xl">
          <Text c="dimmed">No pools data available. Click "Load" to fetch data.</Text>
        </Box>
      )}
    </Card>
  );
}
