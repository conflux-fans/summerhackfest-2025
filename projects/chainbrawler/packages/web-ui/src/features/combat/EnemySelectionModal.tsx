import {
  Badge,
  Box,
  Divider,
  Flex,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconDice, IconHeart, IconShield, IconSword } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { GameButton, GameCard, GameModal } from "../../components/game";
import { designTokens } from "../../theme";

interface EnemyStats {
  name: string;
  description: string;
  baseStats: {
    health: number;
    combat: number;
    defense: number;
    luck: number;
  };
  scaledStats: {
    health: number;
    combat: number;
    defense: number;
    luck: number;
  };
  difficultyMultiplier: number;
}

interface EnemySelectionModalProps {
  onFightEnemy: (enemyId: number, enemyLevel: number) => Promise<void>;
  onClose: () => void;
  opened: boolean;
}

const ENEMY_TYPES = [
  { id: 1, name: "Goblin Warrior", description: "A small but fierce warrior" },
  { id: 2, name: "Orc Berserker", description: "A massive, rage-filled fighter" },
  { id: 3, name: "Shadow Assassin", description: "A stealthy, deadly killer" },
  { id: 4, name: "Ice Troll", description: "A massive, frost-covered beast" },
  { id: 5, name: "Fire Elemental", description: "A living flame creature" },
  { id: 6, name: "Stone Golem", description: "An ancient, animated statue" },
  { id: 7, name: "Dark Wizard", description: "A powerful spellcaster" },
  { id: 8, name: "Skeleton Knight", description: "An undead warrior" },
  { id: 9, name: "Dragon Whelp", description: "A young but dangerous dragon" },
  { id: 10, name: "Demon Scout", description: "A fast, agile demon" },
  { id: 11, name: "Crystal Spider", description: "A crystalline arachnid" },
  { id: 12, name: "Storm Giant", description: "A towering giant of storms" },
  { id: 13, name: "Lich King", description: "An undead master of dark magic" },
  { id: 14, name: "Phoenix Guardian", description: "A reborn fire bird" },
  { id: 15, name: "Void Stalker", description: "A creature from the void" },
  { id: 16, name: "Ancient Dragon", description: "An ancient, powerful dragon" },
];

export function EnemySelectionModal({ onFightEnemy, onClose, opened }: EnemySelectionModalProps) {
  const [selectedEnemyId, setSelectedEnemyId] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [enemyStats, setEnemyStats] = useState<EnemyStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate enemy stats based on ID and level
  useEffect(() => {
    const calculateEnemyStats = () => {
      const enemy = ENEMY_TYPES.find((e) => e.id === selectedEnemyId) || ENEMY_TYPES[0];

      // Base stats vary by enemy type
      const baseHealth = 50 + selectedEnemyId * 10;
      const baseCombat = 8 + selectedEnemyId * 2;
      const baseDefense = 6 + selectedEnemyId * 1.5;
      const baseLuck = 4 + selectedEnemyId * 1;

      // Scale by level
      const levelMultiplier = 1 + (selectedLevel - 1) * 0.2;

      // Calculate difficulty multiplier
      const difficultyMultiplier = 1 + (selectedEnemyId - 1) * 0.1 + (selectedLevel - 1) * 0.05;

      const scaledStats = {
        health: Math.floor(baseHealth * levelMultiplier),
        combat: Math.floor(baseCombat * levelMultiplier),
        defense: Math.floor(baseDefense * levelMultiplier),
        luck: Math.floor(baseLuck * levelMultiplier),
      };

      setEnemyStats({
        name: enemy.name,
        description: enemy.description,
        baseStats: {
          health: baseHealth,
          combat: baseCombat,
          defense: baseDefense,
          luck: baseLuck,
        },
        scaledStats,
        difficultyMultiplier,
      });
    };

    calculateEnemyStats();
  }, [selectedEnemyId, selectedLevel]);

  const handleFight = async () => {
    setIsLoading(true);
    try {
      await onFightEnemy(selectedEnemyId, selectedLevel);
      onClose();
    } catch (error) {
      console.error("Failed to fight enemy:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (multiplier: number) => {
    if (multiplier <= 1.2) return "green";
    if (multiplier <= 1.8) return "yellow";
    return "red";
  };

  const getDifficultyText = (multiplier: number) => {
    if (multiplier <= 1.2) return "Easy";
    if (multiplier <= 1.8) return "Medium";
    if (multiplier <= 2.5) return "Hard";
    return "Extreme";
  };

  return (
    <GameModal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon color="game-combat" variant="light" size="sm">
            <IconSword size={16} />
          </ThemeIcon>
          <Text fw={700} c="white">
            Select Enemy
          </Text>
        </Group>
      }
      subtitle="Choose your opponent wisely - higher levels mean greater rewards but deadlier combat"
      variant="compact"
    >
      <Stack gap="md">
        {/* Enemy Selection - Mobile Optimized */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <Select
            label="Enemy Type"
            placeholder="Select an enemy"
            value={selectedEnemyId.toString()}
            onChange={(value) => setSelectedEnemyId(Number(value))}
            data={ENEMY_TYPES.map((enemy) => ({
              value: enemy.id.toString(),
              label: enemy.name,
            }))}
            leftSection={<IconSword size={16} />}
            radius="md"
            style={{
              "--input-bg": designTokens.colors.surface.glass,
            }}
          />

          <NumberInput
            label="Level"
            placeholder="1-100"
            min={1}
            max={100}
            value={selectedLevel}
            onChange={(value) => setSelectedLevel(Math.max(1, Math.min(100, Number(value) || 1)))}
            leftSection={<IconDice size={16} />}
            radius="md"
            style={{
              "--input-bg": designTokens.colors.surface.glass,
            }}
          />
        </SimpleGrid>

        {/* Enemy Stats Display - Compact */}
        {enemyStats && (
          <GameCard variant="glass">
            <Stack gap="sm">
              <Group justify="space-between" align="flex-start">
                <Box flex={1}>
                  <Text size="lg" fw={700} c="white">
                    {enemyStats.name}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {enemyStats.description}
                  </Text>
                </Box>
                <Badge
                  color={getDifficultyColor(enemyStats.difficultyMultiplier)}
                  variant="light"
                  size="md"
                  radius="md"
                >
                  {getDifficultyText(enemyStats.difficultyMultiplier)}
                </Badge>
              </Group>

              <Divider color={designTokens.colors.border.secondary} />

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Box>
                  <Text size="md" fw={600} c="white" mb="sm">
                    Stats (Level {selectedLevel})
                  </Text>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Group gap="xs">
                        <ThemeIcon color="game-combat" variant="light" size="sm">
                          <IconHeart size={14} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed">
                          Health
                        </Text>
                      </Group>
                      <Text fw={600} c="game-combat">
                        {enemyStats.scaledStats.health}
                      </Text>
                    </Group>

                    <Group justify="space-between">
                      <Group gap="xs">
                        <ThemeIcon color="game-combat" variant="light" size="sm">
                          <IconSword size={14} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed">
                          Combat
                        </Text>
                      </Group>
                      <Text fw={600} c="game-combat">
                        {enemyStats.scaledStats.combat}
                      </Text>
                    </Group>

                    <Group justify="space-between">
                      <Group gap="xs">
                        <ThemeIcon color="game-defense" variant="light" size="sm">
                          <IconShield size={14} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed">
                          Defense
                        </Text>
                      </Group>
                      <Text fw={600} c="game-defense">
                        {enemyStats.scaledStats.defense}
                      </Text>
                    </Group>

                    <Group justify="space-between">
                      <Group gap="xs">
                        <ThemeIcon color="game-luck" variant="light" size="sm">
                          <IconDice size={14} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed">
                          Luck
                        </Text>
                      </Group>
                      <Text fw={600} c="game-luck">
                        {enemyStats.scaledStats.luck}
                      </Text>
                    </Group>
                  </Stack>
                </Box>

                <Box>
                  <Text size="md" fw={600} c="white" mb="sm">
                    Difficulty
                  </Text>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Multiplier
                      </Text>
                      <Text fw={600} c={getDifficultyColor(enemyStats.difficultyMultiplier)}>
                        {enemyStats.difficultyMultiplier.toFixed(2)}x
                      </Text>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Rating
                      </Text>
                      <Badge
                        color={getDifficultyColor(enemyStats.difficultyMultiplier)}
                        variant="light"
                        size="sm"
                      >
                        {getDifficultyText(enemyStats.difficultyMultiplier)}
                      </Badge>
                    </Group>
                  </Stack>
                </Box>
              </SimpleGrid>
            </Stack>
          </GameCard>
        )}

        {/* Action Buttons - Mobile Optimized */}
        <Flex gap="sm" wrap="wrap">
          <GameButton
            onClick={handleFight}
            isLoading={isLoading}
            loadingText="Fighting..."
            leftSection={<IconSword size={16} />}
            variant="combat"
            size="md"
            disabled={isLoading}
            flex={1}
          >
            {`Fight ${enemyStats?.name || "Enemy"}`}
          </GameButton>

          <GameButton
            onClick={onClose}
            variant="outline"
            size="md"
            flex="0 0 auto"
            style={{ minWidth: "100px" }}
          >
            Cancel
          </GameButton>
        </Flex>
      </Stack>
    </GameModal>
  );
}
