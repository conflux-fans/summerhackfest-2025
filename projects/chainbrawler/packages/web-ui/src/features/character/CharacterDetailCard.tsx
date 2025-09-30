import type { CharacterData, MenuState, LeaderboardData } from "@chainbrawler/core";
import {
  Avatar,
  Badge,
  Box,
  Center,
  Collapse,
  Flex,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBolt,
  IconChevronDown,
  IconChevronUp,
  IconFlame,
  IconHeart,
  IconSkull,
  IconSparkles,
  IconSwords,
  IconTrophy,
  IconUser,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { GameButton, GameCard, LoadingState, StatDisplay, StatGrid } from "../../components/game";
import { designTokens } from "../../theme";

interface CharacterDetailCardProps {
  character: CharacterData | null;
  menu: MenuState | null;
  leaderboard?: LeaderboardData | null;
  onHealCharacter?: () => Promise<void>;
  onResurrectCharacter?: () => Promise<void>;
  onFightEnemy?: () => void;
  onContinueFight?: () => Promise<void>;
  onFleeRound?: () => Promise<void>;
  isLoading?: boolean;
  isWriteOperationInProgress?: boolean;
  actions?: any;
}

export function CharacterDetailCard({
  character,
  menu,
  leaderboard,
  onHealCharacter,
  onResurrectCharacter,
  onFightEnemy,
  onContinueFight,
  onFleeRound,
  isLoading = false,
  isWriteOperationInProgress = false,
  actions,
}: CharacterDetailCardProps) {
  console.log("🎮 CharacterDetailCard RENDER START - Character data:", character);
  
  // Validate SDK data structure
  console.log("🔍 SDK Data Validation:", {
    characterExists: !!character?.exists,
    baseStats: character?.stats,
    equipment: character?.equipment,
    equipmentCount: character?.equipment?.length || 0,
    hasEquipmentBonuses: character?.equipment?.some(item => (item.combat || 0) + (item.defense || 0) + (item.luck || 0) > 0)
  });

  const [showDetails, setShowDetails] = useState(true);
  const [xpForNextLevel, setXpForNextLevel] = useState(0);

  // Calculate XP requirements using triangular progression (matches contract formula)
  const getXPRequiredForLevel = (level: number): number => {
    if (level < 2) return 0;
    return (100 * (level - 1) * level) / 2;
  };

  const currentLevel = character?.level || 1;
  const nextLevelXP = getXPRequiredForLevel(currentLevel + 1);

  // Try to enhance with contract values if available (optional)
  useEffect(() => {
    if (character?.level && actions?.getXPRequiredForLevel) {
      const loadXPRequirements = async () => {
        try {
          const contractNext = await actions.getXPRequiredForLevel(currentLevel + 1);
          setXpForNextLevel(contractNext);
        } catch (error) {
          // Contract XP lookup failed, using calculated values
        }
      };
      loadXPRequirements();
    }
  }, [character?.level, actions, currentLevel]);

  if (!character?.exists) {
    return (
      <GameCard variant="glass" style={{ minHeight: "200px" }}>
        <Center h="100%">
          <Stack align="center" gap="md">
            <Avatar size={60} color="dark" variant="filled">
              <IconUser size={30} />
            </Avatar>
            <Stack align="center" gap="xs">
              <Text size="lg" fw={600} c="dimmed">
                No Character
              </Text>
              <Text size="sm" c="dimmed" ta="center" maw={280}>
                Create a character to begin your ChainBrawler journey!
              </Text>
            </Stack>
          </Stack>
        </Center>
      </GameCard>
    );
  }

  const healthPercentage = character.endurance
    ? (character.endurance.current / character.endurance.max) * 100
    : 0;

  const getHealthColor = (percentage: number) => {
    if (percentage > 75) return "green";
    if (percentage > 50) return "yellow";
    if (percentage > 25) return "orange";
    return "red";
  };

  // Calculate equipment bonuses
  const equipmentBonuses = character.equipment?.reduce(
    (bonuses, item) => {
      return {
        combat: bonuses.combat + (item.combat || 0),
        defense: bonuses.defense + (item.defense || 0),
        luck: bonuses.luck + (item.luck || 0),
      };
    },
    { combat: 0, defense: 0, luck: 0 }
  ) || { combat: 0, defense: 0, luck: 0 };

  // TEMPORARY: Add test equipment bonuses for demonstration
  // TODO: Remove this when real equipment bonuses are available
  const testEquipmentBonuses = {
    combat: 5,
    defense: 3,
    luck: 2
  };
  
  // Use test bonuses if no real equipment bonuses
  const finalEquipmentBonuses = equipmentBonuses.combat > 0 || equipmentBonuses.defense > 0 || equipmentBonuses.luck > 0 
    ? equipmentBonuses 
    : testEquipmentBonuses;

  const currentXP = character.experience || 0;
  // Use contract values if available, otherwise use calculated values
  const effectiveNextLevelXP = xpForNextLevel > 0 ? xpForNextLevel : nextLevelXP;

  // XP bar should show: current total XP / XP needed for next level
  // This matches the tooltip format and shows clear progress
  const xpProgress = currentXP;
  const xpNeeded = effectiveNextLevelXP;


  // Calculate base stats and totals for display
  const baseCombat = character.stats?.combat || 0;
  const baseDefense = character.stats?.defense || 0;
  const baseLuck = character.stats?.luck || 0;
  
  const totalCombat = baseCombat + finalEquipmentBonuses.combat;
  const totalDefense = baseDefense + finalEquipmentBonuses.defense;
  const totalLuck = baseLuck + finalEquipmentBonuses.luck;

  // Log equipment bonus calculations for validation
  console.log("⚔️ Equipment Bonus Calculation:", {
    baseStats: { combat: baseCombat, defense: baseDefense, luck: baseLuck },
    realEquipmentBonuses: equipmentBonuses,
    testEquipmentBonuses,
    finalEquipmentBonuses,
    totals: { combat: totalCombat, defense: totalDefense, luck: totalLuck }
  });

  const stats = [
    {
      label: "Combat",
      value: baseCombat,
      type: "combat" as const,
      tooltip: `Physical attack power and weapon mastery${finalEquipmentBonuses.combat > 0 ? ` (Base: ${baseCombat} + Equipment: +${finalEquipmentBonuses.combat} = ${totalCombat})` : ` (Base: ${baseCombat})`}`,
      trend: finalEquipmentBonuses.combat > 0 ? ("up" as const) : undefined,
      trendValue: finalEquipmentBonuses.combat > 0 ? finalEquipmentBonuses.combat : undefined,
    },
    {
      label: "Defense",
      value: baseDefense,
      type: "defense" as const,
      tooltip: `Armor rating and damage resistance${finalEquipmentBonuses.defense > 0 ? ` (Base: ${baseDefense} + Equipment: +${finalEquipmentBonuses.defense} = ${totalDefense})` : ` (Base: ${baseDefense})`}`,
      trend: finalEquipmentBonuses.defense > 0 ? ("up" as const) : undefined,
      trendValue: finalEquipmentBonuses.defense > 0 ? finalEquipmentBonuses.defense : undefined,
    },
    {
      label: "Luck",
      value: baseLuck,
      type: "luck" as const,
      tooltip: `Critical hit chance and item discovery${finalEquipmentBonuses.luck > 0 ? ` (Base: ${baseLuck} + Equipment: +${finalEquipmentBonuses.luck} = ${totalLuck})` : ` (Base: ${baseLuck})`}`,
      trend: finalEquipmentBonuses.luck > 0 ? ("up" as const) : undefined,
      trendValue: finalEquipmentBonuses.luck > 0 ? finalEquipmentBonuses.luck : undefined,
    },
  ];

  return (
    <GameCard variant={character.inCombat ? "combat" : "elevated"}>
      <Stack gap="md">
        {/* Compact Header */}
        <Group justify="space-between" align="flex-start">
          <Group gap="sm" align="center">
            <Box pos="relative">
              <Avatar
                size={60}
                color={character.isAlive ? "chainbrawler-primary" : "red"}
                variant="gradient"
                gradient={
                  character.isAlive
                    ? { from: "chainbrawler-primary.5", to: "chainbrawler-secondary.5", deg: 45 }
                    : { from: "red.5", to: "orange.5", deg: 45 }
                }
              >
                <IconSwords size={30} />
              </Avatar>

              {/* Status indicators */}
              <ThemeIcon
                size={20}
                radius="xl"
                variant="filled"
                color={character.isAlive ? "green" : "red"}
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  border: `2px solid ${designTokens.colors.surface.primary}`,
                  zIndex: 10,
                }}
              >
                {character.isAlive ? <IconHeart size={10} /> : <IconSkull size={10} />}
              </ThemeIcon>

              {character.inCombat && (
                <ThemeIcon
                  size={18}
                  radius="xl"
                  variant="filled"
                  color="red"
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    border: `2px solid ${designTokens.colors.surface.primary}`,
                    animation: "pulse 2s infinite",
                    zIndex: 11,
                  }}
                >
                  <IconFlame size={8} />
                </ThemeIcon>
              )}
            </Box>

            <Box flex={1}>
              <Text size="lg" fw={700} c="white">
                {character.className || "Unknown"}
              </Text>
              <Group gap="xs" mt={2}>
                <Badge
                  variant="gradient"
                  gradient={{
                    from: "chainbrawler-primary.5",
                    to: "chainbrawler-secondary.5",
                    deg: 45,
                  }}
                  size="sm"
                  leftSection={<IconTrophy size={12} />}
                >
                  Lvl {character.level || 0}
                </Badge>
                <Badge variant="light" color={character.isAlive ? "green" : "red"} size="sm">
                  {character.isAlive ? "Alive" : "Dead"}
                </Badge>
                {character.inCombat && (
                  <Badge
                    variant="filled"
                    color="red"
                    size="sm"
                    style={{ animation: "pulse 2s infinite" }}
                  >
                    Combat
                  </Badge>
                )}
                
                {/* Points Badge */}
                {leaderboard?.playerScore && Number(leaderboard.playerScore) > 0 ? (
                  <Badge
                    variant="gradient"
                    gradient={{
                      from: "yellow.5",
                      to: "orange.5",
                      deg: 45,
                    }}
                    size="sm"
                    leftSection={<IconBolt size={12} />}
                  >
                    {Number(leaderboard.playerScore).toLocaleString()} pts
                  </Badge>
                ) : null}
                
                {/* Leaderboard Position Badge */}
                {leaderboard?.playerRank && Number(leaderboard.playerRank) > 0 ? (
                  <Badge
                    variant="gradient"
                    gradient={{
                      from: "blue.5",
                      to: "purple.5",
                      deg: 45,
                    }}
                    size="sm"
                    leftSection={<IconTrophy size={12} />}
                  >
                    #{Number(leaderboard.playerRank)}
                  </Badge>
                ) : null}
                
                {/* Total Kills Badge */}
                {character.totalKills > 0 && (
                  <Badge
                    variant="gradient"
                    gradient={{
                      from: "red.5",
                      to: "pink.5",
                      deg: 45,
                    }}
                    size="sm"
                    leftSection={<IconSwords size={12} />}
                  >
                    {character.totalKills} kills
                  </Badge>
                )}
              </Group>
            </Box>
          </Group>
        </Group>

        {/* Health Bar - Compact */}
        <StatDisplay
          label="Health"
          value={character.endurance?.current || 0}
          maxValue={character.endurance?.max || 0}
          type="health"
          variant="progress"
          showProgress={true}
          color={getHealthColor(healthPercentage)}
        />

        {/* Experience Bar - Compact */}
        <StatDisplay
          label="Experience"
          value={xpProgress}
          maxValue={xpNeeded}
          type="experience"
          variant="progress"
          showProgress={true}
          tooltip={`Experience: ${xpProgress}/${xpNeeded} XP toward level ${currentLevel + 1}`}
        />

        {/* Combat Actions - Mobile Optimized */}
        {character.isAlive && (
          <Flex gap="sm" wrap="wrap">
            {/* Fight Button */}
            {menu?.canFight && (
              <GameButton
                variant="combat"
                size="sm"
                leftSection={<IconSwords size={16} />}
                onClick={onFightEnemy}
                isLoading={isLoading}
                disabled={!menu?.canFight || isWriteOperationInProgress}
                flex={1}
              >
                Fight
              </GameButton>
            )}

            {/* Heal Button - Show when character is alive, not in combat, and not at full health */}
            {character.isAlive && !character.inCombat && healthPercentage < 100 && (
              <GameButton
                variant="luck"
                size="sm"
                leftSection={<IconHeart size={16} />}
                onClick={onHealCharacter}
                isLoading={isLoading}
                disabled={!menu?.canHeal || isWriteOperationInProgress}
                flex={1}
              >
                {menu?.healingCooldownRemaining && menu.healingCooldownRemaining > 0
                  ? `Heal (${menu.healingCooldownRemaining}s)`
                  : "Heal"}
              </GameButton>
            )}

            {/* Continue Fight Button */}
            {menu?.canContinueFight && (
              <GameButton
                variant="combat"
                size="sm"
                leftSection={<IconBolt size={16} />}
                onClick={onContinueFight}
                isLoading={isLoading}
                disabled={!menu?.canContinueFight || isWriteOperationInProgress}
                flex={1}
              >
                Continue
              </GameButton>
            )}

            {/* Flee Button */}
            {menu?.canFlee && (
              <GameButton
                variant="outline"
                size="sm"
                leftSection={<IconSkull size={16} />}
                onClick={onFleeRound}
                isLoading={isLoading}
                disabled={!menu?.canFlee || isWriteOperationInProgress}
                flex={1}
              >
                Flee
              </GameButton>
            )}
          </Flex>
        )}

        {/* Resurrect Button - Separate section for dead characters */}
        {!character.isAlive && menu?.canResurrect && (
          <Flex gap="sm" wrap="wrap">
            <GameButton
              variant="secondary"
              size="sm"
              leftSection={<IconSparkles size={16} />}
              onClick={onResurrectCharacter}
              isLoading={isLoading}
              disabled={!menu?.canResurrect || isWriteOperationInProgress}
              fullWidth
            >
              Resurrect
            </GameButton>
          </Flex>
        )}

        {/* Expandable Stats Section */}
        <Box>
          <GameButton
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            rightSection={showDetails ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            justify="space-between"
            fullWidth
          >
            <Group gap="xs">
              <IconBolt size={16} color={designTokens.colors.game.experience} />
              <Text size="sm" fw={600}>
                Combat Stats
              </Text>
            </Group>
          </GameButton>

          <Collapse in={showDetails}>
            <Box mt="sm">
              <StatGrid stats={stats} columns={3} compact={false} />
            </Box>
          </Collapse>
        </Box>

        {/* Loading State */}
        {(isLoading || isWriteOperationInProgress) && (
          <Box
            p="sm"
            style={{
              background: designTokens.colors.surface.glass,
              borderRadius: designTokens.borderRadius.md,
              border: `1px solid ${designTokens.colors.border.primary}`,
            }}
          >
            <LoadingState variant="compact" message="Processing action..." size="sm" />
          </Box>
        )}
      </Stack>
    </GameCard>
  );
}
