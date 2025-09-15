import { Button, type ButtonProps, Loader, Text } from "@mantine/core";
import type { ReactNode } from "react";
import { designTokens } from "../../theme";

export interface GameButtonProps extends Omit<ButtonProps, "onClick"> {
  variant?:
    | "primary"
    | "secondary"
    | "combat"
    | "defense"
    | "luck"
    | "health"
    | "experience"
    | "ghost"
    | "outline";
  isLoading?: boolean;
  loadingText?: string;
  animate?: boolean;
  icon?: ReactNode;
  onClick?: () => void | Promise<void>;
  children: ReactNode;
}

export function GameButton({
  variant = "primary",
  isLoading = false,
  loadingText,
  animate = true,
  icon,
  children,
  disabled,
  ...props
}: GameButtonProps) {
  const getVariantStyles = () => {
    const baseStyles = {
      fontWeight: designTokens.typography.weights.semibold,
      transition: animate
        ? `all ${designTokens.animation.durations.normal} ${designTokens.animation.easings.easeOut}`
        : "none",
      "&:hover:not(:disabled)": animate
        ? {
            transform: "translateY(-1px)",
          }
        : {},
      "&:active:not(:disabled)": {
        transform: "translateY(0px)",
      },
    };

    switch (variant) {
      case "primary":
        return {
          ...baseStyles,
          background: designTokens.colors.gradients.primary,
          border: "none",
          color: designTokens.colors.text.primary,
          "&:hover:not(:disabled)": {
            ...baseStyles["&:hover:not(:disabled)"],
            background: designTokens.colors.gradients.primary,
            filter: "brightness(1.1)",
            boxShadow: designTokens.shadows.game,
          },
        };
      case "secondary":
        return {
          ...baseStyles,
          background: designTokens.colors.gradients.secondary,
          border: "none",
          color: designTokens.colors.text.primary,
          "&:hover:not(:disabled)": {
            ...baseStyles["&:hover:not(:disabled)"],
            background: designTokens.colors.gradients.secondary,
            filter: "brightness(1.1)",
            boxShadow: designTokens.shadows.game,
          },
        };
      case "combat":
        return {
          ...baseStyles,
          background: designTokens.colors.gradients.combat,
          border: "none",
          color: designTokens.colors.text.primary,
          "&:hover:not(:disabled)": {
            ...baseStyles["&:hover:not(:disabled)"],
            background: designTokens.colors.gradients.combat,
            filter: "brightness(1.1)",
            boxShadow: `0 0 20px ${designTokens.colors.game.combat}40`,
          },
        };
      case "defense":
        return {
          ...baseStyles,
          background: designTokens.colors.gradients.defense,
          border: "none",
          color: designTokens.colors.text.primary,
          "&:hover:not(:disabled)": {
            ...baseStyles["&:hover:not(:disabled)"],
            background: designTokens.colors.gradients.defense,
            filter: "brightness(1.1)",
            boxShadow: `0 0 20px ${designTokens.colors.game.defense}40`,
          },
        };
      case "luck":
        return {
          ...baseStyles,
          background: designTokens.colors.gradients.luck,
          border: "none",
          color: designTokens.colors.text.primary,
          "&:hover:not(:disabled)": {
            ...baseStyles["&:hover:not(:disabled)"],
            background: designTokens.colors.gradients.luck,
            filter: "brightness(1.1)",
            boxShadow: `0 0 20px ${designTokens.colors.game.luck}40`,
          },
        };
      case "health":
        return {
          ...baseStyles,
          background: designTokens.colors.gradients.health,
          border: "none",
          color: designTokens.colors.text.primary,
          "&:hover:not(:disabled)": {
            ...baseStyles["&:hover:not(:disabled)"],
            background: designTokens.colors.gradients.health,
            filter: "brightness(1.1)",
            boxShadow: `0 0 20px ${designTokens.colors.game.health}40`,
          },
        };
      case "experience":
        return {
          ...baseStyles,
          background: designTokens.colors.gradients.experience,
          border: "none",
          color: designTokens.colors.text.primary,
          "&:hover:not(:disabled)": {
            ...baseStyles["&:hover:not(:disabled)"],
            background: designTokens.colors.gradients.experience,
            filter: "brightness(1.1)",
            boxShadow: `0 0 20px ${designTokens.colors.game.experience}40`,
          },
        };
      case "ghost":
        return {
          ...baseStyles,
          background: "transparent",
          border: "none",
          color: designTokens.colors.text.secondary,
          "&:hover:not(:disabled)": {
            ...baseStyles["&:hover:not(:disabled)"],
            background: designTokens.colors.surface.glass,
            color: designTokens.colors.text.primary,
          },
        };
      case "outline":
        return {
          ...baseStyles,
          background: "transparent",
          border: `1px solid ${designTokens.colors.border.primary}`,
          color: designTokens.colors.text.primary,
          "&:hover:not(:disabled)": {
            ...baseStyles["&:hover:not(:disabled)"],
            background: designTokens.colors.surface.glass,
            borderColor: designTokens.colors.border.accent,
          },
        };
      default:
        return baseStyles;
    }
  };

  return (
    <Button
      radius="md"
      size="md"
      disabled={disabled || isLoading}
      leftSection={isLoading ? <Loader size="xs" color="white" /> : icon}
      style={getVariantStyles()}
      {...props}
    >
      {isLoading ? (
        <Text size="sm" fw={designTokens.typography.weights.semibold}>
          {loadingText || "Loading..."}
        </Text>
      ) : (
        children
      )}
    </Button>
  );
}
