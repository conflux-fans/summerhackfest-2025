import { Alert, Box, Loader, Stack, Text } from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconClock, IconX } from "@tabler/icons-react";
import { GameButton, GameModal, LoadingState } from "../../components/game";
import { designTokens } from "../../theme";

interface TransactionModalProps {
  opened: boolean;
  onClose: () => void;
  operationType?: string;
  status?: "pending" | "confirming" | "success" | "error";
  progress?: number;
  message?: string;
  error?: string;
  transactionHash?: string;
  canClose?: boolean;
}

export function TransactionModal({
  opened,
  onClose,
  operationType = "Transaction",
  status = "pending",
  progress = 0,
  message,
  error,
  transactionHash,
  canClose = false,
}: TransactionModalProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return <Loader size="sm" color="blue" />;
      case "confirming":
        return <Loader size="sm" color="orange" />;
      case "success":
        return <IconCheck size={20} color="green" />;
      case "error":
        return <IconX size={20} color="red" />;
      default:
        return <IconClock size={20} color="gray" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "blue";
      case "confirming":
        return "orange";
      case "success":
        return "green";
      case "error":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "pending":
        return "Preparing transaction...";
      case "confirming":
        return "Confirming transaction...";
      case "success":
        return "Transaction successful!";
      case "error":
        return "Transaction failed";
      default:
        return "Processing...";
    }
  };

  const getProgressValue = () => {
    if (status === "success") return 100;
    if (status === "error") return 0;
    return progress;
  };

  return (
    <GameModal
      opened={opened}
      onClose={canClose ? onClose : () => {}}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getStatusIcon()}
          <Text fw={700} c={getStatusColor()}>
            {operationType}
          </Text>
        </div>
      }
      variant="compact"
      showCloseButton={canClose}
    >
      <Stack gap="md">
        {/* Status with Loading State */}
        <LoadingState
          variant="progress"
          message={message || getStatusText()}
          progress={getProgressValue()}
          status={status === "success" ? "success" : status === "error" ? "error" : "loading"}
          size="md"
        />

        {/* Transaction Hash */}
        {transactionHash && (
          <Alert
            color="chainbrawler-primary"
            variant="light"
            title="Transaction Hash"
            radius="md"
            style={{
              background: designTokens.colors.surface.glass,
              backdropFilter: "blur(10px)",
              border: `1px solid ${designTokens.colors.border.primary}`,
            }}
          >
            <Text
              size="sm"
              c="chainbrawler-primary"
              ff="monospace"
              style={{
                wordBreak: "break-all",
                fontSize: "12px",
              }}
            >
              {transactionHash}
            </Text>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert
            color="red"
            variant="light"
            title="Error"
            icon={<IconAlertTriangle size={16} />}
            radius="md"
            style={{
              background: designTokens.colors.surface.glass,
              backdropFilter: "blur(10px)",
              border: `1px solid ${designTokens.colors.border.error}`,
            }}
          >
            <Text size="sm" c="red">
              {error}
            </Text>
          </Alert>
        )}

        {/* Action Buttons */}
        {canClose && (
          <Box mt="md">
            <GameButton
              onClick={onClose}
              variant={status === "error" ? "combat" : "primary"}
              size="md"
              fullWidth
            >
              {status === "error" ? "Close" : "Continue"}
            </GameButton>
          </Box>
        )}

        {/* Lock Screen Notice */}
        {!canClose && (
          <Text size="sm" c="dimmed" ta="center" mt="sm">
            Please wait while the transaction is being processed...
          </Text>
        )}
      </Stack>
    </GameModal>
  );
}
