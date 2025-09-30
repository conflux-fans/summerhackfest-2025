import { useWebChainBrawlerContext } from "@chainbrawler/react";
import { AppShell, Container, Group, Stack, Tabs, Text, ThemeIcon } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconAlertTriangle,
  IconCoins,
  IconGift,
  IconHistory,
  IconSwords,
  IconTrophy,
  IconUserPlus,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { GameCard } from "../../components/game";
import { MobileNavigation } from "../../components/navigation";
import { designTokens } from "../../theme";
import { rateLimitedRead } from "../../utils/rateLimiter";
import { CharacterCreationForm } from "../character/CharacterCreationForm";
import { CharacterDetailCard } from "../character/CharacterDetailCard";
import { ClaimsDisplay } from "../claims/ClaimsDisplay";
import { EnemySelectionModal } from "../combat/EnemySelectionModal";
import { FightSummaryModal } from "../combat/FightSummaryModal";
import { TransactionHistoryDisplay } from "../history/TransactionHistoryDisplay";
import { LeaderboardDisplay } from "../leaderboard/LeaderboardDisplay";
import { PoolsDisplay } from "../pools/PoolsDisplay";
import { TransactionModal } from "../transactions/TransactionModal";
import { GameHeader } from "./GameHeader";

export function GamePage() {
  const {
    character,
    menu,
    operation,
    statusMessage,
    isLoading,
    error,
    actions,
    pools,
    leaderboard,
    claims,
  } = useWebChainBrawlerContext();

  // State for modals and UI
  const [showEnemySelection, setShowEnemySelection] = useState(false);
  const [fightSummary, setFightSummary] = useState<any>(null);
  const [showFightSummary, setShowFightSummary] = useState(false);
  const [operationStatus, setOperationStatus] = useState<any>(null);
  const [isOperationInProgress, setIsOperationInProgress] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("game");

  // Determine if a write operation is in progress
  const isWriteOperationInProgress =
    isOperationInProgress || (operation?.isActive && operation?.isWriteOperation);

  // Toast notifications for status messages
  useEffect(() => {
    if (statusMessage) {
      notifications.show({
        title: "Game Status",
        message: statusMessage,
        color: "blue",
        autoClose: 3000,
        position: "top-right",
      });
    }
  }, [statusMessage]);

  // Toast notifications for errors
  useEffect(() => {
    if (error) {
      notifications.show({
        title: "Error",
        message: error,
        color: "red",
        autoClose: 5000,
        position: "top-right",
        icon: <IconAlertTriangle size={16} />,
      });
    }
  }, [error]);

  // Listen for transaction status events
  useEffect(() => {
    const handleTransactionStatus = (event: CustomEvent) => {
      setOperationStatus(event.detail);
      // Only consider write operations for UI blocking
      const isWriteOp =
        event.detail.type &&
        [
          "createCharacter",
          "healCharacter",
          "resurrectCharacter",
          "fightEnemy",
          "continueFight",
          "fleeRound",
          "claimPrize",
        ].includes(event.detail.type);

      setIsOperationInProgress(
        isWriteOp &&
          event.detail.status !== "completed" &&
          event.detail.status !== "error" &&
          event.detail.status !== "failed"
      );

      // Auto-hide operation status after completion
      if (event.detail.status === "completed") {
        setTimeout(() => {
          setOperationStatus(null);
          setIsOperationInProgress(false);
        }, 2000);
      }

      // Keep error states visible until dismissed
      if (event.detail.status === "error" || event.detail.status === "failed") {
        setIsOperationInProgress(true);
      }
    };

    const handleFightSummary = (event: CustomEvent) => {
      console.log("🎯 Fight summary event received:", event.detail);
      console.log("🎯 Current modal state - showFightSummary:", showFightSummary);
      console.log("🎯 Current fightSummary:", fightSummary);
      console.log("🎯 Event detail type:", typeof event.detail);
      console.log("🎯 Event detail keys:", event.detail ? Object.keys(event.detail) : "no detail");

      setFightSummary(event.detail);
      setShowFightSummary(true);
      console.log("🎯 Modal should now be open");
    };

    const handleCharacterDataRefresh = (event: CustomEvent) => {
      console.log("Character data refresh event received:", event.detail);
      // Force a re-render by updating a dummy state
      setOperationStatus((prev: any) => ({ ...prev, refreshTrigger: Date.now() }));
    };

    // Listen for real events
    console.log("🎯 Setting up event listeners");
    window.addEventListener("transactionStatus", handleTransactionStatus as EventListener);
    window.addEventListener("fightSummary", handleFightSummary as EventListener);
    window.addEventListener("characterDataRefresh", handleCharacterDataRefresh as EventListener);
    console.log("🎯 Event listeners set up");

    return () => {
      console.log("🎯 Cleaning up event listeners");
      window.removeEventListener("transactionStatus", handleTransactionStatus as EventListener);
      window.removeEventListener("fightSummary", handleFightSummary as EventListener);
      window.removeEventListener(
        "characterDataRefresh",
        handleCharacterDataRefresh as EventListener
      );
    };
  }, []);

  const refreshAll = async () => {
    try {
      await rateLimitedRead(
        "refreshAll",
        () => actions?.refreshAll() || Promise.resolve(),
        5000 // 5 seconds cache for refresh all
      );
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  // Handle actions
  const handleCreateCharacter = async (classId: number) => {
    if (isWriteOperationInProgress) return;
    try {
      const result = await actions?.createCharacter(classId);
      if (result && typeof result === "object" && "success" in result && !result.success) {
        throw new Error(result.error || "Failed to create character");
      }
    } catch (error) {
      console.error("Failed to create character:", error);
    }
  };

  const handleHealCharacter = async () => {
    if (isWriteOperationInProgress) return;
    try {
      const result = await actions?.healCharacter();
      if (result && typeof result === "object" && "success" in result && !result.success) {
        throw new Error(result.error || "Failed to heal character");
      }
    } catch (error) {
      console.error("Failed to heal character:", error);
    }
  };

  const handleResurrectCharacter = async () => {
    if (isWriteOperationInProgress) return;
    try {
      const result = await actions?.resurrectCharacter();
      if (result && typeof result === "object" && "success" in result && !result.success) {
        throw new Error(result.error || "Failed to resurrect character");
      }
    } catch (error) {
      console.error("Failed to resurrect character:", error);
    }
  };

  const handleFightEnemy = async (enemyId: number, enemyLevel: number) => {
    if (isWriteOperationInProgress) return;
    try {
      const result = await actions?.fightEnemy(enemyId, enemyLevel);
      if (result && typeof result === "object" && "success" in result && !result.success) {
        throw new Error(result.error || "Failed to fight enemy");
      }
      setShowEnemySelection(false);
    } catch (error) {
      console.error("Failed to fight enemy:", error);
    }
  };

  const handleContinueFight = async () => {
    console.log("🎯 handleContinueFight called");
    if (isWriteOperationInProgress) return;
    try {
      console.log("🎯 Calling actions.continueFight()");
      const result = await actions?.continueFight();
      console.log("🎯 Continue fight result:", result);
      if (result && typeof result === "object" && "success" in result && !result.success) {
        throw new Error(result.error || "Failed to continue fight");
      }

      // Refresh character data after successful operation to update menu state
      console.log("🎯 Refreshing character data after continue fight");
      await refreshAll();
    } catch (error) {
      console.error("Failed to continue fight:", error);
    }
  };

  const handleFleeRound = async () => {
    console.log("🎯 handleFleeRound called");
    if (isWriteOperationInProgress) return;
    try {
      console.log("🎯 Calling actions.fleeRound()");
      const result = await actions?.fleeRound();
      console.log("🎯 Flee round result:", result);
      if (result && typeof result === "object" && "success" in result && !result.success) {
        throw new Error(result.error || "Failed to flee");
      }

      // Refresh character data after successful operation to update menu state
      console.log("🎯 Refreshing character data after flee round");
      await refreshAll();
    } catch (error) {
      console.error("Failed to flee:", error);
    }
  };

  // Pools actions
  const handleLoadPools = async () => {
    try {
      const result = await rateLimitedRead(
        "loadPools",
        () => actions?.loadPools() || Promise.resolve(),
        10000 // 10 seconds cache for pools
      );
      if (result && typeof result === "object" && "success" in result && result.success === false) {
        throw new Error((result as any).error || "Failed to load pools");
      }
    } catch (error) {
      console.error("Failed to load pools:", error);
    }
  };

  const handleRefreshPools = async () => {
    try {
      const result = await rateLimitedRead(
        "refreshPools",
        () => actions?.refreshPools() || Promise.resolve(),
        5000 // 5 seconds cache for refresh
      );
      if (result && typeof result === "object" && "success" in result && result.success === false) {
        throw new Error((result as any).error || "Failed to refresh pools");
      }
    } catch (error) {
      console.error("Failed to refresh pools:", error);
    }
  };

  // Leaderboard actions
  const handleLoadLeaderboard = async () => {
    try {
      const result = await rateLimitedRead(
        "loadLeaderboard",
        () => actions?.loadLeaderboard("") || Promise.resolve(),
        15000 // 15 seconds cache for leaderboard
      );
      if (result && typeof result === "object" && "success" in result && !result.success) {
        throw new Error((result as any).error || "Failed to load leaderboard");
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  };

  const handleRefreshLeaderboard = async () => {
    try {
      const result = await rateLimitedRead(
        "refreshLeaderboard",
        () => actions?.refreshLeaderboard("") || Promise.resolve(),
        10000 // 10 seconds cache for refresh
      );
      if (result && typeof result === "object" && "success" in result && !result.success) {
        throw new Error((result as any).error || "Failed to refresh leaderboard");
      }
    } catch (error) {
      console.error("Failed to refresh leaderboard:", error);
    }
  };

  // Claims actions
  const handleLoadClaims = async () => {
    try {
      const result = await rateLimitedRead(
        "loadClaims",
        () => actions?.loadClaims("") || Promise.resolve(),
        20000 // 20 seconds cache for claims
      );
      if (result && typeof result === "object" && "success" in result && !result.success) {
        throw new Error((result as any).error || "Failed to load claims");
      }
    } catch (error) {
      console.error("Failed to load claims:", error);
    }
  };

  const handleRefreshClaims = async () => {
    try {
      const result = await rateLimitedRead(
        "refreshClaims",
        () => actions?.refreshClaims("") || Promise.resolve(),
        10000 // 10 seconds cache for refresh
      );
      if (result && typeof result === "object" && "success" in result && !result.success) {
        throw new Error((result as any).error || "Failed to refresh claims");
      }
    } catch (error) {
      console.error("Failed to refresh claims:", error);
    }
  };

  const handleClaimPrize = async (
    epoch: bigint,
    index: bigint,
    amount: bigint,
    proof: string[]
  ) => {
    try {
      const result = await actions?.claimPrize(epoch, index, amount, proof);
      if (result && typeof result === "object" && "success" in result && !result.success) {
        throw new Error(result.error || "Failed to claim prize");
      }
    } catch (error) {
      console.error("Failed to claim prize:", error);
    }
  };

  return (
    <>
      <AppShell
        header={{ height: 80 }}
        padding={{ base: "sm", md: "md" }}
        style={{
          background: designTokens.colors.gradients.surface,
          minHeight: "100vh",
        }}
      >
        {/* Header with wallet and game actions */}
        <GameHeader onRefresh={refreshAll} />

        <AppShell.Main>
          <Container size="xl" pb={{ base: "80px", md: "0" }}>
            <Stack gap="lg">
              {/* Loading State - Show while character data is being loaded */}
              {isLoading ? (
                <GameCard variant="elevated">
                  <Stack gap="xl" align="center">
                    <Stack align="center" gap="md">
                      <ThemeIcon
                        size={80}
                        variant="gradient"
                        gradient={{ from: "blue", to: "cyan", deg: 45 }}
                      >
                        <IconSwords size={40} />
                      </ThemeIcon>
                      <Text size="xl" fw={700} ta="center" c="white">
                        Loading ChainBrawler...
                      </Text>
                      <Text size="lg" c="dimmed" ta="center" maw={600}>
                        {statusMessage || "Initializing your character data and game state."}
                      </Text>
                    </Stack>
                  </Stack>
                </GameCard>
              ) : !character?.exists ? (
                /* Character Creation Screen - Only show when not loading and character doesn't exist */
                <GameCard variant="elevated">
                  <Stack gap="xl" align="center">
                    <Stack align="center" gap="md">
                      <ThemeIcon
                        size={80}
                        variant="gradient"
                        gradient={{ from: "violet", to: "blue", deg: 45 }}
                      >
                        <IconUserPlus size={40} />
                      </ThemeIcon>
                      <Text size="xl" fw={700} ta="center" c="white">
                        Welcome to ChainBrawler!
                      </Text>
                      <Text size="lg" c="dimmed" ta="center" maw={600}>
                        Create your warrior and begin your epic journey in the blockchain arena.
                        Choose your class wisely - it will determine your fighting style and
                        abilities!
                      </Text>
                    </Stack>

                    <CharacterCreationForm
                      onCreateCharacter={handleCreateCharacter}
                      isLoading={isLoading}
                      canCreate={menu?.canCreateCharacter || false}
                    />
                  </Stack>
                </GameCard>
              ) : (
                /* Main Game Interface with Tabs */
                <Tabs value={activeTab} onChange={setActiveTab} variant="outline">
                  <Tabs.List display={{ base: "none", md: "flex" }}>
                    <Tabs.Tab value="game" leftSection={<IconSwords size={16} />}>
                      Game
                    </Tabs.Tab>
                    <Tabs.Tab value="pools" leftSection={<IconCoins size={16} />}>
                      Treasury
                    </Tabs.Tab>
                    <Tabs.Tab value="leaderboard" leftSection={<IconTrophy size={16} />}>
                      Leaderboard
                    </Tabs.Tab>
                    <Tabs.Tab value="claims" leftSection={<IconGift size={16} />}>
                      Claims
                    </Tabs.Tab>
                    <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>
                      History
                    </Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="game" pt="md">
                    <CharacterDetailCard
                      character={character}
                      menu={menu}
                      leaderboard={leaderboard}
                      onHealCharacter={handleHealCharacter}
                      onResurrectCharacter={handleResurrectCharacter}
                      onFightEnemy={async () => setShowEnemySelection(true)}
                      onContinueFight={handleContinueFight}
                      onFleeRound={handleFleeRound}
                      isLoading={isLoading}
                      isWriteOperationInProgress={isWriteOperationInProgress}
                      actions={actions}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="pools" pt="md">
                    <PoolsDisplay
                      pools={pools}
                      isLoading={isLoading}
                      error={error}
                      onLoadPools={handleLoadPools}
                      onRefreshPools={handleRefreshPools}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="leaderboard" pt="md">
                    <LeaderboardDisplay
                      leaderboard={leaderboard}
                      isLoading={isLoading}
                      error={error}
                      onLoadLeaderboard={handleLoadLeaderboard}
                      onRefreshLeaderboard={handleRefreshLeaderboard}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="claims" pt="md">
                    <ClaimsDisplay
                      claims={claims}
                      isLoading={isLoading}
                      error={error}
                      onLoadClaims={handleLoadClaims}
                      onRefreshClaims={handleRefreshClaims}
                      onClaimPrize={handleClaimPrize}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="history" pt="md">
                    {(() => {
                      console.log("Rendering History tab panel");
                      return null;
                    })()}
                    <TransactionHistoryDisplay />
                  </Tabs.Panel>
                </Tabs>
              )}

              {/* Game Instructions for New Players */}
              {character?.exists && character.level === 0 && (
                <GameCard variant="glass">
                  <Stack gap="md">
                    <Group gap="xs">
                      <IconSwords size={20} color={designTokens.colors.game.experience} />
                      <Text size="lg" fw={700} c="white">
                        Getting Started
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                      🎯{" "}
                      <Text component="span" fw={600} c="white">
                        Choose your battles wisely:
                      </Text>{" "}
                      Start with low-level enemies to gain experience and equipment.
                      <br />
                      ❤️{" "}
                      <Text component="span" fw={600} c="white">
                        Manage your health:
                      </Text>{" "}
                      Use the heal action when your health is low, or resurrect if you die.
                      <br />
                      ⚔️{" "}
                      <Text component="span" fw={600} c="white">
                        Combat strategy:
                      </Text>{" "}
                      Higher level enemies give more XP but are much more dangerous.
                      <br />🏆{" "}
                      <Text component="span" fw={600} c="white">
                        Progress your character:
                      </Text>{" "}
                      Gain experience, level up, and find better equipment to face stronger foes.
                    </Text>
                  </Stack>
                </GameCard>
              )}
            </Stack>
          </Container>
        </AppShell.Main>
      </AppShell>

      {/* Mobile Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasNotifications={{
          claims: false,
          pools: false,
          leaderboard: false,
        }}
      />

      {/* Modals */}
      <EnemySelectionModal
        opened={showEnemySelection}
        onClose={() => setShowEnemySelection(false)}
        onFightEnemy={handleFightEnemy}
      />

      <FightSummaryModal
        opened={showFightSummary}
        onClose={() => setShowFightSummary(false)}
        fightSummary={fightSummary}
        onContinueFight={handleContinueFight}
        onFleeRound={handleFleeRound}
      />

      <TransactionModal
        opened={!!isWriteOperationInProgress}
        onClose={() => {
          setOperationStatus(null);
          setIsOperationInProgress(false);
        }}
        operationType={operationStatus?.type || "Transaction"}
        status={operationStatus?.status || "pending"}
        progress={operationStatus?.progress || 0}
        message={operationStatus?.message}
        error={operationStatus?.error?.message || operationStatus?.error}
        transactionHash={operationStatus?.transactionHash}
        canClose={
          operationStatus?.status === "completed" ||
          operationStatus?.status === "error" ||
          operationStatus?.status === "failed"
        }
      />
    </>
  );
}
