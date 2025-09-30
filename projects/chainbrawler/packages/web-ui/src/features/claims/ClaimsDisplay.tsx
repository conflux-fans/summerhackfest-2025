import type { ClaimableReward, ClaimsData } from "@chainbrawler/core";
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
  IconCheck,
  IconCoins,
  IconDownload,
  IconGift,
  IconRefresh,
} from "@tabler/icons-react";
import { rateLimitedRead } from "../../utils/rateLimiter";

interface ClaimsDisplayProps {
  claims: ClaimsData | null;
  isLoading: boolean;
  error: string | null;
  onLoadClaims: () => Promise<void>;
  onRefreshClaims: () => Promise<void>;
  onClaimPrize: (epoch: bigint, index: bigint, amount: bigint, proof: string[]) => Promise<void>;
}

export function ClaimsDisplay({
  claims,
  isLoading,
  error,
  onLoadClaims,
  onRefreshClaims,
  onClaimPrize,
}: ClaimsDisplayProps) {
  const handleLoadClaims = async () => {
    try {
      await rateLimitedRead(
        "claimsDisplay_loadClaims",
        () => onLoadClaims(),
        20000 // 20 seconds cache
      );
    } catch (error) {
      console.error("Failed to load claims:", error);
    }
  };

  const handleRefreshClaims = async () => {
    try {
      await rateLimitedRead(
        "claimsDisplay_refreshClaims",
        () => onRefreshClaims(),
        10000 // 10 seconds cache
      );
    } catch (error) {
      console.error("Failed to refresh claims:", error);
    }
  };

  const handleClaimPrize = async (reward: ClaimableReward) => {
    if (!reward.epoch || !reward.index || !reward.amount || !reward.proof) {
      console.error("Invalid reward data for claiming");
      return;
    }

    try {
      await onClaimPrize(
        BigInt(reward.epoch),
        BigInt(reward.index),
        BigInt(reward.amount),
        reward.proof
      );
    } catch (error) {
      console.error("Failed to claim prize:", error);
    }
  };

  const formatAmount = (amount: bigint | number) => {
    const value = typeof amount === "bigint" ? Number(amount) : amount;
    return `${(value / 1e18).toFixed(4)} CFX`;
  };

  return (
    <Card withBorder radius="md" p="xl" style={{ position: "relative" }}>
      <LoadingOverlay visible={isLoading} overlayProps={{ radius: "md", blur: 2 }} />

      <Group justify="space-between" mb="md">
        <Title order={3} c="white">
          Prize Claims
        </Title>
        <Group>
          <Button
            leftSection={<IconDownload size={16} />}
            onClick={handleLoadClaims}
            disabled={isLoading}
            variant="light"
            size="sm"
          >
            Load
          </Button>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={handleRefreshClaims}
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

      {claims && (
        <Stack gap="md">
          {/* Summary Stats */}
          <Card withBorder radius="md" p="md" bg="dark.6">
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group gap="xs" mb="xs">
                  <ThemeIcon color="green" variant="light" size="sm">
                    <IconCoins size={16} />
                  </ThemeIcon>
                  <Text fw={600} size="sm" c="dimmed">
                    Total Claimable
                  </Text>
                </Group>
                <Text fw={700} size="xl" c="white">
                  {formatAmount(claims.totalClaimable || 0n)}
                </Text>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group gap="xs" mb="xs">
                  <ThemeIcon color="blue" variant="light" size="sm">
                    <IconGift size={16} />
                  </ThemeIcon>
                  <Text fw={600} size="sm" c="dimmed">
                    Available Rewards
                  </Text>
                </Group>
                <Text fw={700} size="xl" c="white">
                  {claims.available?.length || 0}
                </Text>
              </Grid.Col>
            </Grid>

            {claims.lastChecked && (
              <Text size="xs" c="dimmed" mt="md">
                Last checked: {new Date(claims.lastChecked).toLocaleString()}
              </Text>
            )}
          </Card>

          {/* Available Rewards */}
          {claims.available && claims.available.length > 0 ? (
            <Card withBorder radius="md" p="md">
              <Title order={4} mb="md" c="white">
                Available Rewards
              </Title>

              <Stack gap="md">
                {claims.available.map((reward, index) => (
                  <Card
                    key={index}
                    withBorder
                    radius="md"
                    p="md"
                    style={{
                      backgroundColor: reward.canClaim
                        ? "rgba(34, 197, 94, 0.1)"
                        : "rgba(107, 114, 128, 0.1)",
                      borderColor: reward.canClaim
                        ? "rgba(34, 197, 94, 0.3)"
                        : "rgba(107, 114, 128, 0.3)",
                    }}
                  >
                    <Group justify="space-between" align="flex-start">
                      <Box style={{ flex: 1 }}>
                        <Group gap="xs" mb="xs">
                          <ThemeIcon
                            color={reward.canClaim ? "green" : "gray"}
                            variant="light"
                            size="sm"
                          >
                            {reward.canClaim ? <IconGift size={16} /> : <IconCheck size={16} />}
                          </ThemeIcon>
                          <Text fw={600} size="lg" c="white">
                            {reward.description || `Epoch ${Number(reward.epoch)} Reward`}
                          </Text>
                          {reward.canClaim && (
                            <Badge color="green" variant="light" size="sm">
                              Claimable
                            </Badge>
                          )}
                        </Group>

                        <Stack gap="xs">
                          <Group gap="lg">
                            <Text size="sm" c="dimmed">
                              <Text span fw={600}>
                                Amount:
                              </Text>{" "}
                              {formatAmount(reward.amount || 0)}
                            </Text>
                            {reward.epoch && (
                              <Text size="sm" c="dimmed">
                                <Text span fw={600}>
                                  Epoch:
                                </Text>{" "}
                                {Number(reward.epoch)}
                              </Text>
                            )}
                            {reward.index !== undefined && reward.index !== 0n && (
                              <Text size="sm" c="dimmed">
                                <Text span fw={600}>
                                  Index:
                                </Text>{" "}
                                {Number(reward.index)}
                              </Text>
                            )}
                          </Group>
                        </Stack>
                      </Box>

                      <Button
                        onClick={() => handleClaimPrize(reward)}
                        disabled={!reward.canClaim}
                        leftSection={
                          reward.canClaim ? <IconGift size={16} /> : <IconCheck size={16} />
                        }
                        variant={reward.canClaim ? "filled" : "light"}
                        color={reward.canClaim ? "green" : "gray"}
                        size="md"
                      >
                        {reward.canClaim ? "Claim" : "Claimed"}
                      </Button>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Card>
          ) : (
            <Card withBorder radius="md" p="xl" ta="center">
              <ThemeIcon size="xl" color="gray" variant="light" mx="auto" mb="md">
                <IconGift size={32} />
              </ThemeIcon>
              <Text c="dimmed" size="lg">
                No claimable rewards available
              </Text>
              <Text c="dimmed" size="sm" mt="xs">
                Complete battles and climb the leaderboard to earn rewards!
              </Text>
            </Card>
          )}
        </Stack>
      )}

      {!claims && !isLoading && !error && (
        <Box ta="center" py="xl">
          <Text c="dimmed">No claims data available. Click "Load" to fetch data.</Text>
        </Box>
      )}
    </Card>
  );
}
