import { ActionIcon, Box, Group, Indicator, Stack, Text } from "@mantine/core";
import { IconCoins, IconGift, IconSwords, IconTrophy } from "@tabler/icons-react";
import { designTokens } from "../../theme";

interface MobileNavigationProps {
  activeTab: string | null;
  onTabChange: (tab: string) => void;
  hasNotifications?: {
    claims?: boolean;
    pools?: boolean;
    leaderboard?: boolean;
  };
}

interface NavItemProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  hasNotification?: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, isActive, hasNotification, onClick }: NavItemProps) {
  return (
    <Box
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
        borderRadius: designTokens.borderRadius.md,
        background: isActive ? designTokens.colors.surface.glass : "transparent",
        border: isActive
          ? `1px solid ${designTokens.colors.border.accent}`
          : "1px solid transparent",
        transition: `all ${designTokens.animation.durations.normal} ${designTokens.animation.easings.easeOut}`,
        minWidth: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Indicator disabled={!hasNotification} color="red" size={8} offset={4} position="top-end">
        <Stack align="center" gap={4}>
          <ActionIcon
            variant={isActive ? "filled" : "transparent"}
            color={isActive ? "chainbrawler-primary" : "gray"}
            size="md"
            style={{
              background: isActive ? designTokens.colors.gradients.primary : "transparent",
              color: isActive
                ? designTokens.colors.text.primary
                : designTokens.colors.text.secondary,
            }}
          >
            {icon}
          </ActionIcon>
          <Text
            size="xs"
            fw={isActive ? 600 : 500}
            c={isActive ? "chainbrawler-primary" : "dimmed"}
            ta="center"
          >
            {label}
          </Text>
        </Stack>
      </Indicator>
    </Box>
  );
}

export function MobileNavigation({
  activeTab,
  onTabChange,
  hasNotifications = {},
}: MobileNavigationProps) {
  const navItems = [
    {
      id: "game",
      icon: <IconSwords size={16} />,
      label: "Combat",
    },
    {
      id: "pools",
      icon: <IconCoins size={16} />,
      label: "Treasury",
      hasNotification: hasNotifications.pools,
    },
    {
      id: "leaderboard",
      icon: <IconTrophy size={16} />,
      label: "Leaderboard",
      hasNotification: hasNotifications.leaderboard,
    },
    {
      id: "claims",
      icon: <IconGift size={16} />,
      label: "Claims",
      hasNotification: hasNotifications.claims,
    },
  ];

  return (
    <Box
      display={{ base: "block", md: "none" }}
      pos="fixed"
      bottom={0}
      left={0}
      right={0}
      p="sm"
      style={{
        background: designTokens.colors.surface.overlay,
        backdropFilter: "blur(20px)",
        borderTop: `1px solid ${designTokens.colors.border.primary}`,
        zIndex: 1000,
      }}
    >
      <Group justify="space-around" align="center" gap="xs">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            id={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.id}
            hasNotification={item.hasNotification}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </Group>
    </Box>
  );
}

export function MobileNavSpacer() {
  return <Box display={{ base: "block", md: "none" }} h={80} />;
}
