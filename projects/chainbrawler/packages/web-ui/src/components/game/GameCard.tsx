import { Box, Card, type CardProps } from "@mantine/core";
import type { ReactNode } from "react";
import { designTokens } from "../../theme";

export interface GameCardProps extends CardProps {
  variant?: "default" | "elevated" | "glass" | "combat";
  animate?: boolean;
  children: ReactNode;
}

export function GameCard({
  variant = "default",
  animate = true,
  children,
  className,
  ...props
}: GameCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "elevated":
        return {
          background: designTokens.colors.surface.elevated,
          backdropFilter: "blur(10px)",
          boxShadow: designTokens.shadows.lg,
          border: `1px solid ${designTokens.colors.border.primary}`,
          "&:hover": animate
            ? {
                transform: "translateY(-2px)",
                boxShadow: designTokens.shadows.glow,
                borderColor: designTokens.colors.border.accent,
              }
            : {},
        };
      case "glass":
        return {
          background: designTokens.colors.surface.glass,
          backdropFilter: "blur(20px)",
          border: `1px solid ${designTokens.colors.border.secondary}`,
          "&:hover": animate
            ? {
                background: designTokens.colors.surface.elevated,
                borderColor: designTokens.colors.border.primary,
              }
            : {},
        };
      case "combat":
        return {
          background: designTokens.colors.surface.elevated,
          backdropFilter: "blur(10px)",
          border: `2px solid ${designTokens.colors.game.combat}`,
          boxShadow: designTokens.shadows.combat,
          "&:hover": animate
            ? {
                transform: "scale(1.02)",
                boxShadow: `${designTokens.shadows.combat}, ${designTokens.shadows.glow}`,
              }
            : {},
        };
      default:
        return {
          background: designTokens.colors.surface.elevated,
          backdropFilter: "blur(10px)",
          border: `1px solid ${designTokens.colors.border.primary}`,
          transition: animate
            ? `all ${designTokens.animation.durations.normal} ${designTokens.animation.easings.easeOut}`
            : "none",
          "&:hover": animate
            ? {
                borderColor: designTokens.colors.border.accent,
                boxShadow: designTokens.shadows.game,
              }
            : {},
        };
    }
  };

  return (
    <Card
      padding="md"
      radius="lg"
      withBorder={false}
      className={`game-card ${className || ""}`}
      style={getVariantStyles()}
      {...props}
    >
      <Box className="game-card-content">{children}</Box>
    </Card>
  );
}
