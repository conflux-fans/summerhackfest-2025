import type { LeaderboardData } from "@chainbrawler/core";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  LoadingOverlay,
  Progress,
  ScrollArea,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconAward,
  IconClock,
  IconCrown,
  IconDownload,
  IconMedal,
  IconRefresh,
  IconTrophy,
  IconUsers,
} from "@tabler/icons-react";
import { rateLimitedRead } from "../../utils/rateLimiter";

interface LeaderboardDisplayProps {
  leaderboard: LeaderboardData | null;
  isLoading: boolean;
  error: string | null;
  onLoadLeaderboard: () => Promise<void>;
  onRefreshLeaderboard: () => Promise<void>;
}

export function LeaderboardDisplay({
  leaderboard,
  isLoading,
  error,
  onLoadLeaderboard,
  onRefreshLeaderboard,
}: LeaderboardDisplayProps) {
  const handleLoadLeaderboard = async () => {
    try {
      await rateLimitedRead(
        "leaderboardDisplay_loadLeaderboard",
        () => onLoadLeaderboard(),
        15000 // 15 seconds cache
      );
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  };

  const handleRefreshLeaderboard = async () => {
    try {
      await rateLimitedRead(
        "leaderboardDisplay_refreshLeaderboard",
        () => onRefreshLeaderboard(),
        10000 // 10 seconds cache
      );
    } catch (error) {
      console.error("Failed to refresh leaderboard:", error);
    }
  };

  const formatTimeRemaining = (seconds: bigint) => {
    const hours = Number(seconds) / 3600;
    if (hours >= 24) {
      return `${(hours / 24).toFixed(1)} days`;
    } else if (hours >= 1) {
      return `${hours.toFixed(1)} hours`;
    } else {
      return `${(Number(seconds) / 60).toFixed(1)} minutes`;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <IconCrown size={16} color="#FFD700" />;
    if (rank === 2) return <IconMedal size={16} color="#C0C0C0" />;
    if (rank === 3) return <IconAward size={16} color="#CD7F32" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "yellow";
    if (rank === 2) return "gray";
    if (rank === 3) return "orange";
    if (rank <= 10) return "blue";
    return "default";
  };

  const rows = leaderboard?.topPlayers?.slice(0, 10).map((player, index) => (
    <Table.Tr
      key={index}
      style={{
        backgroundColor: player.isCurrentPlayer ? "rgba(59, 130, 246, 0.1)" : "transparent",
      }}
    >
      <Table.Td>
        <Group gap="xs">
          {getRankIcon(Number(player.rank) || index + 1)}
          <Text fw={700} c={getRankColor(Number(player.rank) || index + 1)}>
            #{player.rank ? Number(player.rank).toString() : index + 1}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Avatar size="sm" color="blue" radius="xl">
            {player.address?.slice(0, 2).toUpperCase()}
          </Avatar>
          <Text ff="monospace" size="sm">
            {player.address?.slice(0, 6)}...{player.address?.slice(-4)}
            {player.isCurrentPlayer && (
              <Badge size="xs" variant="light" color="blue" ml="xs">
                You
              </Badge>
            )}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fw={600} c="white">
          {player.score?.toString() || "0"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color="green">
          Level {player.level || 0}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Card withBorder radius="md" p="xl" style={{ position: "relative" }}>
      <LoadingOverlay visible={isLoading} overlayProps={{ radius: "md", blur: 2 }} />

      <Group justify="space-between" mb="md">
        <Title order={3} c="white">
          Leaderboard
        </Title>
        <Group>
          <Button
            leftSection={<IconDownload size={16} />}
            onClick={handleLoadLeaderboard}
            disabled={isLoading}
            variant="light"
            size="sm"
          >
            Load
          </Button>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={handleRefreshLeaderboard}
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

      {leaderboard && (
        <Stack gap="md">
          {/* Stats Overview */}
          <Card withBorder radius="md" p="md" bg="dark.6">
            <Grid>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Group gap="xs" mb="xs">
                  <ThemeIcon color="blue" variant="light" size="sm">
                    <IconTrophy size={16} />
                  </ThemeIcon>
                  <Text fw={600} size="sm" c="dimmed">
                    Current Epoch
                  </Text>
                </Group>
                <Text fw={700} size="xl" c="white">
                  {leaderboard.currentEpoch ? Number(leaderboard.currentEpoch).toString() : "0"}
                </Text>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Group gap="xs" mb="xs">
                  <ThemeIcon color="green" variant="light" size="sm">
                    <IconUsers size={16} />
                  </ThemeIcon>
                  <Text fw={600} size="sm" c="dimmed">
                    Your Rank
                  </Text>
                </Group>
                <Text fw={700} size="xl" c="white">
                  #{leaderboard.playerRank ? Number(leaderboard.playerRank).toString() : "0"}
                </Text>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Group gap="xs" mb="xs">
                  <ThemeIcon color="yellow" variant="light" size="sm">
                    <IconTrophy size={16} />
                  </ThemeIcon>
                  <Text fw={600} size="sm" c="dimmed">
                    Your Score
                  </Text>
                </Group>
                <Text fw={700} size="xl" c="white">
                  {leaderboard.playerScore ? Number(leaderboard.playerScore).toString() : "0"}
                </Text>
              </Grid.Col>
            </Grid>

            {/* Time Remaining */}
            {leaderboard.epochTimeRemaining && Number(leaderboard.epochTimeRemaining) > 0 ? (
              <Box mt="md">
                <Group gap="xs" mb="xs">
                  <ThemeIcon color="orange" variant="light" size="sm">
                    <IconClock size={16} />
                  </ThemeIcon>
                  <Text fw={600} size="sm" c="dimmed">
                    Time Remaining
                  </Text>
                </Group>
                <Progress value={100} size="lg" radius="xl" color="orange" animated />
                <Text size="sm" c="dimmed" mt="xs">
                  {formatTimeRemaining(leaderboard.epochTimeRemaining)}
                </Text>
              </Box>
            ) : null}

            {/* Total Players */}
            <Box mt="md">
              <Text size="sm" c="dimmed">
                Total Players:{" "}
                <Text span fw={600} c="white">
                  {leaderboard.totalPlayers ? Number(leaderboard.totalPlayers).toString() : "0"}
                </Text>
              </Text>
            </Box>
          </Card>

          {/* Top Players Table */}
          {leaderboard.topPlayers && leaderboard.topPlayers.length > 0 && (
            <Card withBorder radius="md" p="md">
              <Title order={4} mb="md" c="white">
                Top Players
              </Title>

              <ScrollArea>
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Rank</Table.Th>
                      <Table.Th>Player</Table.Th>
                      <Table.Th>Score</Table.Th>
                      <Table.Th>Level</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              </ScrollArea>
            </Card>
          )}

          {/* Last Updated */}
          {leaderboard.lastUpdated && (
            <Text size="xs" c="dimmed" ta="center">
              Last updated: {new Date(leaderboard.lastUpdated).toLocaleString()}
            </Text>
          )}
        </Stack>
      )}

      {!leaderboard && !isLoading && !error && (
        <Box ta="center" py="xl">
          <Text c="dimmed">No leaderboard data available. Click "Load" to fetch data.</Text>
        </Box>
      )}
    </Card>
  );
}
