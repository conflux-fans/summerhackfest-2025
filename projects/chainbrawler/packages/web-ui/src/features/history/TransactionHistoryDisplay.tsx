import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Code,
  Collapse,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconClock,
  IconCopy,
  IconFunction,
  IconHistory,
  IconX,
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { GameCard } from "../../components/game";

interface TransactionRecord {
  id: string;
  timestamp: number;
  type: string;
  args: any;
  result: any;
  status: "pending" | "confirming" | "completed" | "error";
  hash?: string;
  statusHistory: Array<{
    status: "pending" | "confirming" | "completed" | "error";
    timestamp: number;
    result?: any;
  }>;
}

export function TransactionHistoryDisplay() {
  console.log("TransactionHistoryDisplay component loaded");
  const [history, setHistory] = useState<TransactionRecord[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load transaction history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("chainbrawler-tx-history");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // Migrate existing records to include statusHistory
        const migratedHistory = parsedHistory.map((record: any) => ({
          ...record,
          statusHistory: record.statusHistory || [
            {
              status: record.status || "pending",
              timestamp: record.timestamp || Date.now(),
              result: record.result || null,
            },
          ],
        }));
        setHistory(migratedHistory);
      } catch (error) {
        console.error("Failed to parse transaction history:", error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      try {
        localStorage.setItem("chainbrawler-tx-history", JSON.stringify(history));
      } catch (error) {
        console.error("Failed to save transaction history to localStorage:", error);
      }
    }
  }, [history]);

  // Listen for transaction events to add to history
  useEffect(() => {
    const handleTransactionEvent = (event: CustomEvent) => {
      const { type, args, result, status, hash } = event.detail;

      setHistory((prev) => {
        // Group by hash - find existing record with same hash
        const existingIndex = prev.findIndex((record) => record.hash === hash);

        const statusEntry = {
          status: status || "pending",
          timestamp: Date.now(),
          result: result || null,
        };

        if (existingIndex >= 0) {
          // Update existing record - add new status to history
          const newHistory = [...prev];
          const existingRecord = newHistory[existingIndex];

          // Add new status to history
          const updatedStatusHistory = [...existingRecord.statusHistory, statusEntry];

          newHistory[existingIndex] = {
            ...existingRecord,
            status: status || "pending",
            result: result || existingRecord.result,
            statusHistory: updatedStatusHistory,
          };

          return newHistory;
        } else {
          // Create new record
          const newRecord: TransactionRecord = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            type,
            args: args || {},
            result: result || null,
            status: status || "pending",
            hash,
            statusHistory: [statusEntry],
          };

          return [newRecord, ...prev].slice(0, 100); // Keep last 100 records
        }
      });
    };

    window.addEventListener("transactionStatus", handleTransactionEvent as EventListener);
    return () => {
      window.removeEventListener("transactionStatus", handleTransactionEvent as EventListener);
    };
  }, []);

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("chainbrawler-tx-history");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "success":
        return "green";
      case "error":
        return "red";
      case "confirming":
        return "blue";
      case "pending":
        return "yellow";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <IconCheck size={12} />;
      case "success":
        return <IconCheck size={12} />;
      case "error":
        return <IconX size={12} />;
      case "confirming":
        return <IconClock size={12} />;
      case "pending":
        return <IconClock size={12} />;
      default:
        return <IconClock size={12} />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatArgs = (args: any) => {
    if (!args || Object.keys(args).length === 0) return "No arguments";
    return JSON.stringify(args, null, 2);
  };

  const formatResult = (result: any) => {
    if (result === null || result === undefined) return "No result";
    return JSON.stringify(result, null, 2);
  };

  if (history.length === 0) {
    return (
      <GameCard variant="elevated">
        <Stack gap="md" align="center">
          <ThemeIcon size={60} variant="light" color="gray">
            <IconFunction size={30} />
          </ThemeIcon>
          <Text size="lg" fw={600} c="dimmed">
            No transaction history yet
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Transaction history will appear here as you interact with the game.
          </Text>
        </Stack>
      </GameCard>
    );
  }

  return (
    <GameCard variant="elevated">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon size="md" variant="light" color="blue">
              <IconHistory size={20} />
            </ThemeIcon>
            <Text size="lg" fw={700} c="white">
              Transaction History
            </Text>
            <Badge variant="light" color="blue">
              {history.length} transactions
            </Badge>
          </Group>
          <Button variant="outline" size="sm" onClick={clearHistory} color="red">
            Clear History
          </Button>
        </Group>

        <ScrollArea h={500}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Status</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Timestamp</Table.Th>
                <Table.Th>Hash</Table.Th>
                <Table.Th>Details</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {history.map((record) => (
                <React.Fragment key={record.id}>
                  <Table.Tr>
                    <Table.Td>
                      <Badge
                        color={getStatusColor(record.status)}
                        variant="light"
                        size="sm"
                        leftSection={getStatusIcon(record.status)}
                      >
                        {record.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {record.type}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {formatTimestamp(record.timestamp)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {record.hash ? (
                        <Group gap="xs">
                          <Text size="sm" ff="monospace" c="dimmed">
                            {record.hash.slice(0, 10)}...
                          </Text>
                          <Tooltip label="Copy hash">
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              onClick={() => copyToClipboard(record.hash!, record.id)}
                            >
                              {copiedId === record.id ? (
                                <IconCheck size={12} color="green" />
                              ) : (
                                <IconCopy size={12} />
                              )}
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      ) : (
                        <Text size="sm" c="dimmed">
                          -
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon variant="subtle" onClick={() => toggleRowExpansion(record.id)}>
                        {expandedRows.has(record.id) ? (
                          <IconChevronDown size={16} />
                        ) : (
                          <IconChevronRight size={16} />
                        )}
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td colSpan={5} p={0}>
                      <Collapse in={expandedRows.has(record.id)}>
                        <Paper p="md" bg="dark.8" radius="md" m="xs">
                          <Stack gap="md">
                            <Box>
                              <Text size="sm" fw={600} mb="xs" c="white">
                                Status History:
                              </Text>
                              <Stack gap="xs">
                                {(record.statusHistory || []).map((statusEntry, index) => (
                                  <Group key={index} gap="sm" align="center">
                                    <Badge
                                      color={getStatusColor(statusEntry.status)}
                                      variant="light"
                                      size="sm"
                                      leftSection={getStatusIcon(statusEntry.status)}
                                    >
                                      {statusEntry.status}
                                    </Badge>
                                    <Text size="xs" c="dimmed">
                                      {formatTimestamp(statusEntry.timestamp)}
                                    </Text>
                                  </Group>
                                ))}
                              </Stack>
                            </Box>
                            <Box>
                              <Text size="sm" fw={600} mb="xs" c="white">
                                Arguments:
                              </Text>
                              <Code block style={{ fontSize: "12px" }}>
                                {formatArgs(record.args)}
                              </Code>
                            </Box>
                            <Box>
                              <Text size="sm" fw={600} mb="xs" c="white">
                                Result:
                              </Text>
                              <Code block style={{ fontSize: "12px" }}>
                                {formatResult(record.result)}
                              </Code>
                            </Box>
                          </Stack>
                        </Paper>
                      </Collapse>
                    </Table.Td>
                  </Table.Tr>
                </React.Fragment>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Stack>
    </GameCard>
  );
}
