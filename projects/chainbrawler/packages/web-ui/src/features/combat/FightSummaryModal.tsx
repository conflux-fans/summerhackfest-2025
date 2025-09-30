import type { FightSummaryData } from "@chainbrawler/core";
import {
  Box,
  Button,
  Card,
  Grid,
  Group,
  Modal,
  Progress,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconClock,
  IconGift,
  IconHeart,
  IconRefresh,
  IconSkull,
  IconSword,
  IconTrophy,
  IconX,
} from "@tabler/icons-react";

interface FightSummaryModalProps {
  fightSummary: FightSummaryData | null;
  onContinueFight: () => Promise<void>;
  onFleeRound: () => Promise<void>;
  onClose: () => void;
  opened: boolean;
}

export function FightSummaryModal({
  fightSummary,
  onContinueFight,
  onFleeRound,
  onClose,
  opened,
}: FightSummaryModalProps) {
  if (!fightSummary) return null;

  const enemyName = fightSummary.enemyName || `Enemy ${fightSummary.enemyId}`;

  // Ensure all numeric values are properly converted from BigInt
  const playerHealth = Number(fightSummary.playerHealthRemaining);
  const enemyHealth = Number(fightSummary.enemyHealthRemaining);
  const playerStartHealth = Number(fightSummary.playerStartEndurance);
  const enemyStartHealth = Number(fightSummary.enemyStartEndurance);
  const xpGained = Number(fightSummary.xpGained);
  const enemyLevel = Number(fightSummary.enemyLevel);
  const roundsElapsed = Number(fightSummary.roundsElapsed);

  // Convert equipment drop values
  const equipmentDrop = fightSummary.equipmentDropped
    ? {
        combat: Number(fightSummary.equipmentDropped.combat),
        endurance: Number(fightSummary.equipmentDropped.endurance),
        defense: Number(fightSummary.equipmentDropped.defense),
        luck: Number(fightSummary.equipmentDropped.luck),
      }
    : null;

  // Convert round data
  const rounds = {
    count: Number(fightSummary.rounds.count),
    numbers: fightSummary.rounds.numbers.map(Number),
    playerDamages: fightSummary.rounds.playerDamages.map(Number),
    enemyDamages: fightSummary.rounds.enemyDamages.map(Number),
    playerCriticals: fightSummary.rounds.playerCriticals.map(Boolean),
    enemyCriticals: fightSummary.rounds.enemyCriticals.map(Boolean),
  };

  const getOutcomeColor = () => {
    if (fightSummary.victory) return "green";
    if (fightSummary.playerDied) return "red";
    if (fightSummary.unresolved) return "yellow";
    return "gray";
  };

  const getOutcomeText = () => {
    if (fightSummary.victory) return "VICTORY!";
    if (fightSummary.playerDied) return "DEFEAT";
    if (fightSummary.unresolved) return "UNRESOLVED";
    return "FIGHT ENDED";
  };

  const getOutcomeIcon = () => {
    if (fightSummary.victory) return <IconTrophy size={32} />;
    if (fightSummary.playerDied) return <IconSkull size={32} />;
    if (fightSummary.unresolved) return <IconClock size={32} />;
    return <IconSword size={32} />;
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon color={getOutcomeColor()} variant="light" size="lg">
            {getOutcomeIcon()}
          </ThemeIcon>
          <Title order={2} c={getOutcomeColor()}>
            {getOutcomeText()}
          </Title>
        </Group>
      }
      size="xl"
      centered
    >
      <Stack gap="md">
        {/* Fight Header */}
        <Box ta="center" mb="md">
          <Text c="dimmed" size="lg">
            vs {enemyName} (Level {enemyLevel})
          </Text>
        </Box>

        {/* Fight Stats */}
        <Grid>
          <Grid.Col span={6}>
            <Card withBorder radius="md" p="md" bg="dark.6">
              <Group gap="xs" mb="xs">
                <ThemeIcon color="blue" variant="light" size="sm">
                  <IconSword size={16} />
                </ThemeIcon>
                <Text fw={600} size="sm" c="dimmed">
                  Rounds
                </Text>
              </Group>
              <Text fw={700} size="xl" c="white">
                {roundsElapsed}
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={6}>
            <Card withBorder radius="md" p="md" bg="dark.6">
              <Group gap="xs" mb="xs">
                <ThemeIcon color="green" variant="light" size="sm">
                  <IconTrophy size={16} />
                </ThemeIcon>
                <Text fw={600} size="sm" c="dimmed">
                  XP Gained
                </Text>
              </Group>
              <Text fw={700} size="xl" c="green">
                +{xpGained}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Health Status */}
        <Grid>
          <Grid.Col span={6}>
            <Card withBorder radius="md" p="md" bg="blue.9">
              <Group gap="xs" mb="xs">
                <ThemeIcon color="blue" variant="light" size="sm">
                  <IconHeart size={16} />
                </ThemeIcon>
                <Text fw={600} size="sm" c="white">
                  Your Health
                </Text>
              </Group>
              <Progress
                value={(playerHealth / playerStartHealth) * 100}
                size="lg"
                radius="xl"
                color={playerHealth > 0 ? "green" : "red"}
                animated
              />
              <Text fw={600} c="white" mt="xs" ta="center">
                {playerHealth}/{playerStartHealth}
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={6}>
            <Card withBorder radius="md" p="md" bg="red.9">
              <Group gap="xs" mb="xs">
                <ThemeIcon color="red" variant="light" size="sm">
                  <IconSkull size={16} />
                </ThemeIcon>
                <Text fw={600} size="sm" c="white">
                  Enemy Health
                </Text>
              </Group>
              <Progress
                value={(enemyHealth / enemyStartHealth) * 100}
                size="lg"
                radius="xl"
                color={enemyHealth > 0 ? "red" : "green"}
                animated
              />
              <Text fw={600} c="white" mt="xs" ta="center">
                {enemyHealth}/{enemyStartHealth}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Equipment Drop */}
        {equipmentDrop && (
          <Card withBorder radius="md" p="md" bg="yellow.9">
            <Group gap="xs" mb="md">
              <ThemeIcon color="yellow" variant="light" size="sm">
                <IconGift size={16} />
              </ThemeIcon>
              <Title order={4} c="white">
                🎁 Equipment Dropped!
              </Title>
            </Group>

            <Grid>
              <Grid.Col span={3}>
                <Box ta="center">
                  <Text fw={600} c="orange" size="sm">
                    Combat
                  </Text>
                  <Text fw={700} size="xl" c="orange">
                    +{equipmentDrop.combat}
                  </Text>
                </Box>
              </Grid.Col>
              <Grid.Col span={3}>
                <Box ta="center">
                  <Text fw={600} c="green" size="sm">
                    Endurance
                  </Text>
                  <Text fw={700} size="xl" c="green">
                    +{equipmentDrop.endurance}
                  </Text>
                </Box>
              </Grid.Col>
              <Grid.Col span={3}>
                <Box ta="center">
                  <Text fw={600} c="blue" size="sm">
                    Defense
                  </Text>
                  <Text fw={700} size="xl" c="blue">
                    +{equipmentDrop.defense}
                  </Text>
                </Box>
              </Grid.Col>
              <Grid.Col span={3}>
                <Box ta="center">
                  <Text fw={600} c="purple" size="sm">
                    Luck
                  </Text>
                  <Text fw={700} size="xl" c="purple">
                    +{equipmentDrop.luck}
                  </Text>
                </Box>
              </Grid.Col>
            </Grid>
          </Card>
        )}

        {/* Round Details */}
        {rounds.count > 0 && (
          <Card withBorder radius="md" p="md">
            <Title order={4} c="white" mb="md">
              Round Details
            </Title>

            <ScrollArea h={200}>
              <Stack gap="xs">
                {rounds.numbers.map((roundNum, index) => (
                  <Card key={index} withBorder radius="sm" p="sm" bg="dark.6">
                    <Group justify="space-between">
                      <Text fw={600} c="white">
                        Round {roundNum}
                      </Text>
                      <Group gap="lg">
                        <Group gap="xs">
                          <ThemeIcon color="green" variant="light" size="xs">
                            <IconSword size={12} />
                          </ThemeIcon>
                          <Text size="sm" c="green">
                            You: {rounds.playerDamages[index]} damage
                            {rounds.playerCriticals[index] && " 💥"}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <ThemeIcon color="red" variant="light" size="xs">
                            <IconSword size={12} />
                          </ThemeIcon>
                          <Text size="sm" c="red">
                            Enemy: {rounds.enemyDamages[index]} damage
                            {rounds.enemyCriticals[index] && " 💥"}
                          </Text>
                        </Group>
                      </Group>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </ScrollArea>
          </Card>
        )}

        {/* Action Buttons */}
        <Group justify="center" gap="md">
          {fightSummary.unresolved && !fightSummary.playerDied && (
            <>
              <Button
                onClick={onContinueFight}
                leftSection={<IconRefresh size={16} />}
                color="purple"
                size="lg"
              >
                Continue Fight
              </Button>
              <Button
                onClick={onFleeRound}
                leftSection={<IconX size={16} />}
                color="gray"
                size="lg"
              >
                Flee
              </Button>
            </>
          )}

          <Button
            onClick={onClose}
            leftSection={<IconX size={16} />}
            variant={fightSummary.unresolved ? "light" : "filled"}
            color={fightSummary.unresolved ? "gray" : "blue"}
            size="lg"
          >
            {fightSummary.unresolved ? "Cancel" : "Continue"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
