import { createTheme, type MantineColorsTuple } from "@mantine/core";
import { designTokens } from "./tokens";

// Define custom colors for Mantine theme
const primaryColor: MantineColorsTuple = [
  designTokens.colors.primary[50],
  designTokens.colors.primary[100],
  designTokens.colors.primary[200],
  designTokens.colors.primary[300],
  designTokens.colors.primary[400],
  designTokens.colors.primary[500],
  designTokens.colors.primary[600],
  designTokens.colors.primary[700],
  designTokens.colors.primary[800],
  designTokens.colors.primary[900],
];

const secondaryColor: MantineColorsTuple = [
  designTokens.colors.secondary[50],
  designTokens.colors.secondary[100],
  designTokens.colors.secondary[200],
  designTokens.colors.secondary[300],
  designTokens.colors.secondary[400],
  designTokens.colors.secondary[500],
  designTokens.colors.secondary[600],
  designTokens.colors.secondary[700],
  designTokens.colors.secondary[800],
  designTokens.colors.secondary[900],
];

const combatColor: MantineColorsTuple = [
  "#fef2f2",
  "#fee2e2",
  "#fecaca",
  "#fca5a5",
  "#f87171",
  designTokens.colors.game.combat,
  "#dc2626",
  "#b91c1c",
  "#991b1b",
  "#7f1d1d",
];

const defenseColor: MantineColorsTuple = [
  designTokens.colors.game.defenseLight,
  "#dbeafe",
  "#bfdbfe",
  "#93c5fd",
  "#60a5fa",
  designTokens.colors.game.defense,
  "#2563eb",
  "#1d4ed8",
  "#1e40af",
  designTokens.colors.game.defenseDark,
];

const luckColor: MantineColorsTuple = [
  designTokens.colors.game.luckLight,
  "#dcfce7",
  "#bbf7d0",
  "#86efac",
  "#4ade80",
  designTokens.colors.game.luck,
  "#059669",
  "#047857",
  "#065f46",
  designTokens.colors.game.luckDark,
];

const experienceColor: MantineColorsTuple = [
  designTokens.colors.game.experienceLight,
  "#f3e8ff",
  "#e9d5ff",
  "#d8b4fe",
  "#c084fc",
  designTokens.colors.game.experience,
  "#7c3aed",
  "#6b21a8",
  "#581c87",
  designTokens.colors.game.experienceDark,
];

export const theme = createTheme({
  primaryColor: "chainbrawler-primary",
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSizes: {
    xs: designTokens.typography.sizes.xs,
    sm: designTokens.typography.sizes.sm,
    md: designTokens.typography.sizes.md,
    lg: designTokens.typography.sizes.lg,
    xl: designTokens.typography.sizes.xl,
  },
  spacing: {
    xs: designTokens.spacing.xs,
    sm: designTokens.spacing.sm,
    md: designTokens.spacing.md,
    lg: designTokens.spacing.lg,
    xl: designTokens.spacing.xl,
  },
  radius: {
    xs: designTokens.borderRadius.sm,
    sm: designTokens.borderRadius.sm,
    md: designTokens.borderRadius.md,
    lg: designTokens.borderRadius.lg,
    xl: designTokens.borderRadius.xl,
  },
  colors: {
    "chainbrawler-primary": primaryColor,
    "chainbrawler-secondary": secondaryColor,
    "game-combat": combatColor,
    "game-defense": defenseColor,
    "game-luck": luckColor,
    "game-experience": experienceColor,
  },
  shadows: {
    xs: designTokens.shadows.sm,
    sm: designTokens.shadows.md,
    md: designTokens.shadows.lg,
    lg: designTokens.shadows.xl,
    xl: designTokens.shadows.game,
  },
  components: {
    Card: {
      defaultProps: {
        padding: "md",
        radius: "lg",
        withBorder: true,
      },
      styles: {
        root: {
          backgroundColor: designTokens.colors.surface.elevated,
          backdropFilter: "blur(10px)",
          borderColor: designTokens.colors.border.primary,
          transition: `all ${designTokens.animation.durations.normal} ${designTokens.animation.easings.easeOut}`,
        },
      },
    },
    Button: {
      defaultProps: {
        radius: "md",
        size: "md",
      },
      styles: {
        root: {
          fontWeight: designTokens.typography.weights.semibold,
          transition: `all ${designTokens.animation.durations.normal} ${designTokens.animation.easings.easeOut}`,
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: designTokens.shadows.game,
          },
        },
      },
    },
    Modal: {
      defaultProps: {
        centered: true,
        radius: "lg",
        overlayProps: {
          backgroundOpacity: 0.7,
          blur: 4,
        },
      },
      styles: {
        content: {
          background: designTokens.colors.surface.overlay,
          backdropFilter: "blur(20px)",
          border: `1px solid ${designTokens.colors.border.primary}`,
        },
        header: {
          background: "transparent",
          borderBottom: `1px solid ${designTokens.colors.border.secondary}`,
        },
        title: {
          color: designTokens.colors.text.primary,
          fontWeight: designTokens.typography.weights.bold,
        },
        body: {
          padding: designTokens.spacing.lg,
        },
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: "md",
        size: "lg",
      },
      styles: {
        root: {
          transition: `all ${designTokens.animation.durations.normal} ${designTokens.animation.easings.easeOut}`,
          "&:hover": {
            transform: "scale(1.05)",
          },
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: "sm",
      },
      styles: {
        root: {
          fontWeight: designTokens.typography.weights.semibold,
        },
      },
    },
    Progress: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          backgroundColor: designTokens.colors.surface.tertiary,
        },
      },
    },
  },
});

export { designTokens };
