import { Box, Button, Group, Modal, type ModalProps, Stack, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { designTokens } from "../../theme";

export interface GameModalProps extends Omit<ModalProps, "title"> {
  title: ReactNode;
  subtitle?: string;
  variant?: "default" | "compact" | "mobile";
  showCloseButton?: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function GameModal({
  title,
  subtitle,
  variant = "default",
  showCloseButton = true,
  onClose,
  children,
  size = "md",
  ...props
}: GameModalProps) {
  const getModalSize = () => {
    if (variant === "compact") return "sm";
    if (variant === "mobile") return "full";
    return size;
  };

  const getModalStyles = () => {
    const baseStyles = {
      content: {
        background: designTokens.colors.surface.overlay,
        backdropFilter: "blur(20px)",
        border: `1px solid ${designTokens.colors.border.primary}`,
        animation: `modalSlideIn ${designTokens.animation.durations.normal} ${designTokens.animation.easings.easeOut}`,
      },
      header: {
        background: "transparent",
        borderBottom: `1px solid ${designTokens.colors.border.secondary}`,
        padding: variant === "compact" ? designTokens.spacing.md : designTokens.spacing.lg,
      },
      body: {
        padding: variant === "compact" ? designTokens.spacing.md : designTokens.spacing.lg,
        maxHeight: variant === "mobile" ? "80vh" : "auto",
        overflowY: "auto" as const,
      },
    };

    if (variant === "mobile") {
      return {
        ...baseStyles,
        content: {
          ...baseStyles.content,
          height: "100vh",
          maxHeight: "100vh",
          borderRadius: 0,
          margin: 0,
        },
      };
    }

    return baseStyles;
  };

  return (
    <Modal
      {...props}
      onClose={onClose}
      size={getModalSize()}
      centered={variant !== "mobile"}
      radius={variant === "mobile" ? 0 : "lg"}
      overlayProps={{
        backgroundOpacity: 0.7,
        blur: 4,
      }}
      closeOnClickOutside={variant !== "mobile"}
      closeOnEscape={true}
      withCloseButton={false}
      styles={getModalStyles()}
      transitionProps={{
        transition: "slide-up",
        duration: parseInt(designTokens.animation.durations.normal),
      }}
    >
      <Stack gap={variant === "compact" ? "sm" : "md"}>
        {/* Custom Header */}
        <Group justify="space-between" align="flex-start">
          <Box flex={1}>
            <Text
              size={variant === "compact" ? "lg" : "xl"}
              fw={designTokens.typography.weights.bold}
              c={designTokens.colors.text.primary}
            >
              {title}
            </Text>
            {subtitle && (
              <Text size="sm" c={designTokens.colors.text.secondary} mt={designTokens.spacing.xs}>
                {subtitle}
              </Text>
            )}
          </Box>

          {showCloseButton && (
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              p={designTokens.spacing.xs}
              onClick={onClose}
              style={{
                minWidth: "auto",
                background: "transparent",
                "&:hover": {
                  background: designTokens.colors.surface.glass,
                },
              }}
            >
              <IconX size={18} />
            </Button>
          )}
        </Group>

        {/* Content */}
        <Box
          style={{
            maxHeight: variant === "mobile" ? "calc(80vh - 100px)" : "auto",
            overflowY: "auto",
          }}
        >
          {children}
        </Box>
      </Stack>

      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </Modal>
  );
}
