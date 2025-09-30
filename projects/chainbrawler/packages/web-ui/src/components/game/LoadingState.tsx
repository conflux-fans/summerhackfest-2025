import { Box, Group, Progress, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCheck, IconClock, IconX } from "@tabler/icons-react";
import { designTokens } from "../../theme";

export interface LoadingStateProps {
  variant?: "default" | "compact" | "inline" | "progress";
  message?: string;
  progress?: number;
  status?: "loading" | "success" | "error" | "idle";
  size?: "xs" | "sm" | "md" | "lg";
}

export function LoadingState({
  variant = "default",
  message = "Loading...",
  progress = 0,
  status = "loading",
  size = "md",
}: LoadingStateProps) {
  const getIcon = () => {
    switch (status) {
      case "loading":
        return null; // No icon for loading state - spinner is handled in title
      case "success":
        return (
          <ThemeIcon color="green" size={size === "xs" ? "sm" : size} variant="light">
            <IconCheck size={size === "xs" ? 12 : 16} />
          </ThemeIcon>
        );
      case "error":
        return (
          <ThemeIcon color="red" size={size === "xs" ? "sm" : size} variant="light">
            <IconX size={size === "xs" ? 12 : 16} />
          </ThemeIcon>
        );
      case "idle":
        return (
          <ThemeIcon color="gray" size={size === "xs" ? "sm" : size} variant="light">
            <IconClock size={size === "xs" ? 12 : 16} />
          </ThemeIcon>
        );
      default:
        return null; // No icon for loading state - spinner is handled in title
    }
  };

  const getMessageColor = () => {
    switch (status) {
      case "success":
        return "green";
      case "error":
        return "red";
      case "idle":
        return "dimmed";
      default:
        return "white";
    }
  };

  const getMessage = () => {
    switch (status) {
      case "success":
        return message || "Success!";
      case "error":
        return message || "Error occurred";
      case "idle":
        return message || "Waiting...";
      default:
        return message || "Loading...";
    }
  };

  if (variant === "inline") {
    return (
      <Group gap="xs" align="center">
        {getIcon() && getIcon()}
        <Text size={size} c={getMessageColor()} fw={500}>
          {getMessage()}
        </Text>
      </Group>
    );
  }

  if (variant === "compact") {
    return (
      <Stack align="center" gap="xs">
        {getIcon() && getIcon()}
        <Text size={size} c={getMessageColor()} fw={500} ta="center">
          {getMessage()}
        </Text>
      </Stack>
    );
  }

  if (variant === "progress") {
    return (
      <Stack gap="md" align="center">
        <Group gap="sm">
          {getIcon() && getIcon()}
          <Text size={size} c={getMessageColor()} fw={500}>
            {getMessage()}
          </Text>
        </Group>

        {status === "loading" && (
          <Box w="100%" maw={300}>
            <Progress
              value={progress}
              size="lg"
              radius="md"
              color="chainbrawler-primary"
              animated={progress < 100}
              style={{
                backgroundColor: designTokens.colors.surface.tertiary,
              }}
            />
            <Text size="xs" c="dimmed" ta="center" mt="xs">
              {Math.round(progress)}% complete
            </Text>
          </Box>
        )}
      </Stack>
    );
  }

  // Default variant
  return (
    <Stack align="center" gap="lg">
      {getIcon() && getIcon()}
      <Stack align="center" gap="xs">
        <Text size={size} c={getMessageColor()} fw={500} ta="center">
          {getMessage()}
        </Text>
        {status === "loading" && (
          <Text size="sm" c="dimmed" ta="center">
            Please wait while we process your request
          </Text>
        )}
      </Stack>
    </Stack>
  );
}
