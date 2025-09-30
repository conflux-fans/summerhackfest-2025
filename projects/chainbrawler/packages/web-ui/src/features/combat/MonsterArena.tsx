import {
  type CharacterData,
  calculateEnemyRewards,
  calculateEnemyStats,
  ENEMY_CONFIGS,
  getEnemyConfig,
  type OperationState,
} from "@chainbrawler/core";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Center,
  // Progress,
  Divider,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Slider,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  Transition,
} from "@mantine/core";
import {
  IconBolt,
  // IconCrown,
  IconClover,
  IconFlame,
  IconHeart,
  IconPlayerPlay,
  IconRun,
  IconShield,
  IconSkull,
  IconSparkles,
  IconSword,
  IconSwords,
  IconTarget,
  IconTrophy,
} from "@tabler/icons-react";
import React from "react";

interface MonsterArenaProps {
  character: CharacterData | null;
  operation: OperationState | null;
  onFightEnemy: (enemyId: number, enemyLevel: number) => Promise<void>;
  onContinueFight: () => Promise<void>;
  onFleeRound: () => Promise<void>;
  isLoading: boolean;
}

export function MonsterArena({
  character,
  // operation,
  onFightEnemy,
  onContinueFight,
  onFleeRound,
  isLoading,
}: MonsterArenaProps) {
  const [selectedEnemyId, setSelectedEnemyId] = React.useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = React.useState<number>(1);

  const canStartFight =
    character?.exists && character?.isAlive && !character?.inCombat && !isLoading;
  const inCombat = character?.inCombat;

  // Get selected enemy config and calculated stats
  const selectedEnemy = selectedEnemyId !== null ? getEnemyConfig(selectedEnemyId) : null;
  const enemyStats =
    selectedEnemyId !== null ? calculateEnemyStats(selectedEnemyId, selectedLevel) : null;
  const enemyRewards =
    selectedEnemyId !== null ? calculateEnemyRewards(selectedEnemyId, selectedLevel) : null;

  const handleFightStart = async () => {
    console.log("MonsterArena: handleFightStart called");
    console.log("MonsterArena: selectedEnemyId:", selectedEnemyId);
    console.log("MonsterArena: selectedLevel:", selectedLevel);
    console.log("MonsterArena: canStartFight:", canStartFight);
    console.log("MonsterArena: onFightEnemy function:", typeof onFightEnemy);

    if (selectedEnemyId !== null && canStartFight) {
      console.log("MonsterArena: Calling onFightEnemy...");
      try {
        await onFightEnemy(selectedEnemyId, selectedLevel);
        console.log("MonsterArena: onFightEnemy completed");
      } catch (error) {
        console.error("MonsterArena: onFightEnemy error:", error);
      }
    } else {
      console.log("MonsterArena: Cannot start fight - conditions not met");
    }
  };

  if (!character?.exists) {
    return (
      <Card shadow="xl" padding="xl" radius="lg" h="100%" style={{ minHeight: "600px" }}>
        <Center h="100%">
          <Stack align="center" gap="xl">
            <Avatar size={120} color="dark" variant="filled">
              <IconTarget size={60} />
            </Avatar>
            <Stack align="center" gap="md">
              <Title order={3} c="dimmed">
                Combat Arena
              </Title>
              <Text size="sm" c="dimmed" ta="center" maw={300}>
                Create a character to enter the arena and fight monsters!
              </Text>
            </Stack>
          </Stack>
        </Center>
      </Card>
    );
  }

  return (
    <Card shadow="xl" padding="xl" radius="lg" h="100%" style={{ minHeight: "600px" }}>
      <Stack gap="lg" h="100%">
        {/* Arena Header */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon
              size="xl"
              color="red"
              variant="gradient"
              gradient={{ from: "red", to: "orange", deg: 45 }}
            >
              <IconSwords size={28} />
            </ThemeIcon>
            <Stack gap={0}>
              <Title order={2} c="white">
                Monster Arena
              </Title>
              <Text size="sm" c="dimmed">
                Choose your battle
              </Text>
            </Stack>
          </Group>

          {inCombat && (
            <Badge
              variant="gradient"
              gradient={{ from: "red", to: "orange", deg: 45 }}
              size="xl"
              leftSection={<IconFlame size={16} />}
            >
              IN COMBAT
            </Badge>
          )}
        </Group>

        <Divider />

        {inCombat ? (
          /* Combat Interface */
          <Stack gap="lg" align="center">
            <Paper p="xl" bg="red.9" radius="md" withBorder style={{ width: "100%" }}>
              <Stack gap="lg" align="center">
                <Group gap="xs">
                  <IconFlame size={24} color="orange" />
                  <Text size="xl" fw={700} c="white" ta="center">
                    BATTLE IN PROGRESS
                  </Text>
                  <IconFlame size={24} color="orange" />
                </Group>

                <Text size="md" c="dimmed" ta="center">
                  You are currently fighting! Choose your next action.
                </Text>

                <Group justify="center" gap="md">
                  <Button
                    variant="gradient"
                    gradient={{ from: "red", to: "orange", deg: 45 }}
                    leftSection={<IconPlayerPlay size={18} />}
                    onClick={onContinueFight}
                    loading={isLoading}
                    size="lg"
                  >
                    Continue Fight
                  </Button>

                  <Button
                    variant="light"
                    color="yellow"
                    leftSection={<IconRun size={18} />}
                    onClick={onFleeRound}
                    loading={isLoading}
                    size="lg"
                  >
                    Flee Battle
                  </Button>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        ) : (
          /* Monster Selection Interface */
          <Stack gap="lg">
            {/* Enemy Grid */}
            <Stack gap="md">
              <Group gap="xs">
                <IconTarget size={20} />
                <Text size="lg" fw={700} c="white">
                  Choose Your Opponent
                </Text>
              </Group>

              <SimpleGrid cols={2} spacing="md">
                {Object.values(ENEMY_CONFIGS).map((enemy) => (
                  <Transition key={enemy.id} mounted={true} transition="scale" duration={200}>
                    {(styles) => (
                      <Paper
                        p="lg"
                        bg={selectedEnemyId === enemy.id ? "dark.5" : "dark.6"}
                        radius="md"
                        withBorder={selectedEnemyId === enemy.id}
                        style={{
                          ...styles,
                          cursor: canStartFight ? "pointer" : "not-allowed",
                          borderColor:
                            selectedEnemyId === enemy.id
                              ? `var(--mantine-color-${enemy.color}-6)`
                              : undefined,
                          opacity: canStartFight ? 1 : 0.6,
                          transform: selectedEnemyId === enemy.id ? "scale(1.02)" : "scale(1)",
                          transition: "all 0.2s ease",
                          boxShadow:
                            selectedEnemyId === enemy.id
                              ? `0 0 20px var(--mantine-color-${enemy.color}-9)`
                              : "none",
                        }}
                        onClick={() => canStartFight && setSelectedEnemyId(enemy.id)}
                      >
                        <Stack align="center" gap="md">
                          <Box pos="relative">
                            <Text
                              size="3xl"
                              style={{
                                filter:
                                  selectedEnemyId === enemy.id
                                    ? "drop-shadow(0 0 10px gold)"
                                    : "none",
                                fontSize: "3rem",
                              }}
                            >
                              {enemy.icon}
                            </Text>
                            {selectedEnemyId === enemy.id && (
                              <Box
                                pos="absolute"
                                top={-5}
                                right={-5}
                                style={{
                                  background: `var(--mantine-color-${enemy.color}-6)`,
                                  borderRadius: "50%",
                                  width: 16,
                                  height: 16,
                                  border: "3px solid white",
                                }}
                              />
                            )}
                          </Box>

                          <Stack align="center" gap="xs">
                            <Text size="lg" fw={700} c="white">
                              {enemy.name}
                            </Text>
                            <Badge
                              color={enemy.color}
                              size="md"
                              variant={selectedEnemyId === enemy.id ? "filled" : "light"}
                            >
                              {enemy.difficulty}
                            </Badge>
                            <Text size="xs" c="dimmed" ta="center" maw={200}>
                              {enemy.description}
                            </Text>
                          </Stack>

                          {/* Base Stats Preview */}
                          <Group gap="xs" justify="center">
                            <Tooltip label="Base Combat">
                              <Badge variant="outline" color="red" size="xs">
                                <IconSword size={10} style={{ marginRight: 2 }} />
                                {enemy.baseStats.combat}
                              </Badge>
                            </Tooltip>
                            <Tooltip label="Base Defense">
                              <Badge variant="outline" color="blue" size="xs">
                                <IconShield size={10} style={{ marginRight: 2 }} />
                                {enemy.baseStats.defense}
                              </Badge>
                            </Tooltip>
                            <Tooltip label="Base Luck">
                              <Badge variant="outline" color="green" size="xs">
                                <IconClover size={10} style={{ marginRight: 2 }} />
                                {enemy.baseStats.luck}
                              </Badge>
                            </Tooltip>
                          </Group>
                        </Stack>
                      </Paper>
                    )}
                  </Transition>
                ))}
              </SimpleGrid>
            </Stack>

            {/* Level Selection */}
            {selectedEnemy && (
              <Stack gap="md">
                <Group gap="xs">
                  <IconTrophy size={20} />
                  <Text size="lg" fw={700} c="white">
                    Challenge Level
                  </Text>
                </Group>

                <Paper p="lg" bg="dark.7" radius="md" withBorder>
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Text size="md" c="white" fw={600}>
                        Level: {selectedLevel}
                      </Text>
                      <Badge variant="light" color="violet" size="md">
                        {selectedLevel === 1
                          ? "Beginner"
                          : selectedLevel <= 3
                            ? "Easy"
                            : selectedLevel <= 5
                              ? "Medium"
                              : selectedLevel <= 7
                                ? "Hard"
                                : selectedLevel <= 9
                                  ? "Expert"
                                  : "Master"}
                      </Badge>
                    </Group>

                    <Slider
                      value={selectedLevel}
                      onChange={setSelectedLevel}
                      min={1}
                      max={10}
                      step={1}
                      marks={[
                        { value: 1, label: "1" },
                        { value: 3, label: "3" },
                        { value: 5, label: "5" },
                        { value: 7, label: "7" },
                        { value: 10, label: "10" },
                      ]}
                      disabled={!canStartFight}
                      color="violet"
                      size="lg"
                    />
                  </Stack>
                </Paper>
              </Stack>
            )}

            {/* Enemy Stats Preview */}
            {selectedEnemy && enemyStats && enemyRewards && (
              <Paper p="lg" bg="dark.6" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Text size="lg" fw={700} c="white">
                      {selectedEnemy.name} Level {selectedLevel} Stats
                    </Text>
                    <Badge variant="light" color={selectedEnemy.color} size="lg">
                      Battle Preview
                    </Badge>
                  </Group>

                  <Grid>
                    <Grid.Col span={6}>
                      <Stack gap="sm">
                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconSword size={16} color="red" />
                            <Text size="sm" c="white">
                              Combat Power
                            </Text>
                          </Group>
                          <Text size="sm" fw={700} c="red">
                            {enemyStats.scaledStats.combat}
                          </Text>
                        </Group>

                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconShield size={16} color="blue" />
                            <Text size="sm" c="white">
                              Defense Rating
                            </Text>
                          </Group>
                          <Text size="sm" fw={700} c="blue">
                            {enemyStats.scaledStats.defense}
                          </Text>
                        </Group>

                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconClover size={16} color="green" />
                            <Text size="sm" c="white">
                              Luck Factor
                            </Text>
                          </Group>
                          <Text size="sm" fw={700} c="green">
                            {enemyStats.scaledStats.luck}
                          </Text>
                        </Group>

                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconHeart size={16} color="pink" />
                            <Text size="sm" c="white">
                              Health Points
                            </Text>
                          </Group>
                          <Text size="sm" fw={700} c="pink">
                            {enemyStats.scaledStats.health}
                          </Text>
                        </Group>
                      </Stack>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Stack gap="sm">
                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconBolt size={16} color="yellow" />
                            <Text size="sm" c="white">
                              XP Reward
                            </Text>
                          </Group>
                          <Text size="sm" fw={700} c="yellow">
                            {enemyRewards.xp}
                          </Text>
                        </Group>

                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconTrophy size={16} color="orange" />
                            <Text size="sm" c="white">
                              Drop Rate
                            </Text>
                          </Group>
                          <Text size="sm" fw={700} c="orange">
                            {Math.round(enemyRewards.equipmentDropChance * 100)}%
                          </Text>
                        </Group>

                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconSparkles size={16} color="violet" />
                            <Text size="sm" c="white">
                              Rare Drop
                            </Text>
                          </Group>
                          <Text size="sm" fw={700} c="violet">
                            {Math.round(enemyRewards.rareDropChance * 100)}%
                          </Text>
                        </Group>

                        <Divider size="xs" />

                        <Group justify="center">
                          <Badge variant="outline" color={selectedEnemy.color} size="sm">
                            {selectedEnemy.difficulty} Difficulty
                          </Badge>
                        </Group>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Paper>
            )}

            {/* Fight Button */}
            <Paper p="lg" bg="dark.7" radius="md" withBorder>
              <Stack gap="md">
                {selectedEnemy && (
                  <Group justify="center" gap="lg">
                    <Stack align="center" gap="xs">
                      <Avatar size={40} color="violet" variant="light">
                        <IconSwords size={20} />
                      </Avatar>
                      <Text size="xs" c="white" fw={600}>
                        {character.className}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Lv.{character.level}
                      </Text>
                    </Stack>

                    <Text size="2xl" c="red" fw={900}>
                      VS
                    </Text>

                    <Stack align="center" gap="xs">
                      <Avatar size={40} color={selectedEnemy.color} variant="light">
                        <Text size="lg">{selectedEnemy.icon}</Text>
                      </Avatar>
                      <Text size="xs" c="white" fw={600}>
                        {selectedEnemy.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Lv.{selectedLevel}
                      </Text>
                    </Stack>
                  </Group>
                )}

                <Button
                  variant="gradient"
                  gradient={{ from: "violet", to: "blue", deg: 45 }}
                  size="xl"
                  leftSection={<IconSword size={24} />}
                  onClick={handleFightStart}
                  disabled={!canStartFight || selectedEnemyId === null}
                  loading={isLoading}
                  fullWidth
                  style={{
                    height: 64,
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                >
                  {selectedEnemyId !== null
                    ? `⚔️ BATTLE ${ENEMY_CONFIGS[selectedEnemyId].name.toUpperCase()} (LV.${selectedLevel}) ⚔️`
                    : "🎯 SELECT A MONSTER TO FIGHT"}
                </Button>

                {!character.isAlive && (
                  <Paper p="md" bg="red.9" radius="md">
                    <Group justify="center" gap="xs">
                      <IconSkull size={16} />
                      <Text size="sm" c="white">
                        Your character must be alive to fight
                      </Text>
                    </Group>
                  </Paper>
                )}
              </Stack>
            </Paper>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
