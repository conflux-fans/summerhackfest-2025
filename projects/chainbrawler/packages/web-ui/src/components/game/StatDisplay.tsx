import { Badge, Box, Group, Progress, Stack, Text, ThemeIcon, Tooltip } from "@mantine/core";
import {
  IconBolt,
  IconClover,
  IconHeart,
  IconShield,
  IconSwords,
  IconTrendingUp,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { designTokens } from "../../theme";

export interface StatDisplayProps {
  label: string;
  value: number | string;
  maxValue?: number;
  type?: "combat" | "defense" | "luck" | "health" | "experience" | "custom";
  icon?: ReactNode;
  variant?: "default" | "compact" | "detailed" | "progress";
  showProgress?: boolean;
  tooltip?: string;
  color?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: number;
}

export function StatDisplay({
  label,
  value,
  maxValue,
  type = "custom",
  icon,
  variant = "default",
  showProgress = false,
  tooltip,
  color,
  trend,
  trendValue,
}: StatDisplayProps) {
  const getStatIcon = () => {
    if (icon) return icon;

    switch (type) {
      case "combat":
        return <IconSwords size={16} />;
      case "defense":
        return <IconShield size={16} />;
      case "luck":
        return <IconClover size={16} />;
      case "health":
        return <IconHeart size={16} />;
      case "experience":
        return <IconBolt size={16} />;
      default:
        return <IconTrendingUp size={16} />;
    }
  };

  const getStatColor = () => {
    if (color) return color;

    switch (type) {
      case "combat":
        return "game-combat";
      case "defense":
        return "game-defense";
      case "luck":
        return "game-luck";
      case "health":
        return "orange";
      case "experience":
        return "game-experience";
      default:
        return "chainbrawler-primary";
    }
  };

  const getProgressValue = () => {
    if (!maxValue || typeof value !== "number") return 0;
    return (value / maxValue) * 100;
  };

  const renderTrend = () => {
    if (!trend || !trendValue) return null;

    return (
      <Badge
        size="xs"
        color={trend === "up" ? "green" : trend === "down" ? "red" : "gray"}
        variant="light"
        ml="xs"
        style={{ zIndex: 5 }}
      >
        {trend === "up" ? "+" : trend === "down" ? "-" : ""}
        {Math.abs(trendValue)}
      </Badge>
    );
  };

  const statContent = (
    <Group gap="sm" align="center">
      <ThemeIcon size="md" color={getStatColor()} variant="light" radius="md">
        {getStatIcon()}
      </ThemeIcon>

      <Box flex={1}>
        {variant === "compact" ? (
          <Group justify="space-between" align="center" gap="xs">
            <Text size="sm" c="dimmed" fw={500}>
              {label}
            </Text>
            <Group gap="xs" align="center">
              <Text size="sm" fw={700} c={designTokens.colors.text.primary}>
                {maxValue ? `${value}/${maxValue}` : value}
              </Text>
              {renderTrend()}
            </Group>
          </Group>
        ) : (
          <Stack gap={2}>
            <Group justify="space-between" align="center">
              <Text size="md" c="dimmed" fw={500}>
                {label}
              </Text>
              {renderTrend()}
            </Group>
            <Text size="xl" fw={700} c={getStatColor()}>
              {maxValue ? `${value}/${maxValue}` : value}
            </Text>
          </Stack>
        )}

        {(showProgress || variant === "progress") && maxValue && typeof value === "number" && (
          <Progress
            value={getProgressValue()}
            color={getStatColor()}
            size="xs"
            radius="md"
            mt="xs"
            style={{
              backgroundColor: designTokens.colors.surface.tertiary,
            }}
          />
        )}
      </Box>
    </Group>
  );

  if (tooltip) {
    return (
      <Tooltip label={tooltip} position="top" withArrow>
        <Box>{statContent}</Box>
      </Tooltip>
    );
  }

  return statContent;
}

export interface StatGridProps {
  stats: StatDisplayProps[];
  columns?: number;
  compact?: boolean;
}

export function StatGrid({ stats, columns = 2, compact = false }: StatGridProps) {
  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: compact ? designTokens.spacing.sm : designTokens.spacing.md,
      }}
    >
      {stats.map((stat, index) => (
        <Box
          key={index}
          p={compact ? "xs" : "sm"}
          style={{
            background: designTokens.colors.surface.glass,
            borderRadius: designTokens.borderRadius.md,
            border: `1px solid ${designTokens.colors.border.secondary}`,
          }}
        >
          <StatDisplay {...stat} variant={compact ? "compact" : stat.variant} />
        </Box>
      ))}
    </Box>
  );
}
