import { Box, Button, Card, Container, Group, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <Container size="sm">
            <Card
              shadow="xl"
              radius="lg"
              padding="xl"
              style={{
                background: "rgba(30, 41, 59, 0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              <Stack align="center" gap="xl">
                <Group gap="md">
                  <IconAlertTriangle size={48} color="#ef4444" />
                  <Title order={2} c="red">
                    Something went wrong
                  </Title>
                </Group>

                <Stack align="center" gap="md">
                  <Text ta="center" c="dimmed">
                    We encountered an unexpected error. This might be a temporary issue.
                  </Text>

                  {this.state.error && (
                    <Card
                      p="md"
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                      }}
                    >
                      <Text size="sm" c="red" ff="monospace">
                        {this.state.error.message}
                      </Text>
                    </Card>
                  )}
                </Stack>

                <Group gap="md">
                  <Button
                    variant="filled"
                    color="red"
                    leftSection={<IconRefresh size={16} />}
                    onClick={this.handleReload}
                  >
                    Reload Page
                  </Button>
                  <Button variant="outline" color="blue" onClick={this.handleReset}>
                    Try Again
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}
