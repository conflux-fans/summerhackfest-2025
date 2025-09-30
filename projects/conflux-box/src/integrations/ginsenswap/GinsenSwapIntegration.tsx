/**
 * GinsenSwap Integration
 *
 * Based on the original GinsengSwapWidget from the old frontend
 * Provides decentralized token swapping on Conflux eSpace
 */

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  NumberInput,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconArrowsExchange,
  IconExternalLink,
  IconInfoCircle,
  IconSettings,
} from '@tabler/icons-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useAuthStore } from '../../stores/authStore';
import type { IntegrationComponentProps } from '../types';

// Token Configuration - from original
const TOKENS = {
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
} as const;

interface SwapQuote {
  fromToken: (typeof TOKENS)[keyof typeof TOKENS];
  toToken: (typeof TOKENS)[keyof typeof TOKENS];
  amountIn: string;
  amountOut: string;
  fee: number;
  path: string;
  poolExists: boolean;
}

interface SwapBalances {
  address: string;
  balances: {
    USDT: string;
    USDC: string;
    CFX: string;
  };
}

export const GinsenSwapIntegration: React.FC<IntegrationComponentProps> = ({
  currentNetwork,
  isVisible,
}) => {
  const { isConnected } = useAccount();
  const { sessionId } = useAuthStore();

  const [fromToken, setFromToken] = useState<'USDT' | 'USDC'>('USDT');
  const [toToken, setToToken] = useState<'USDT' | 'USDC'>('USDC');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [balances, setBalances] = useState<SwapBalances | null>(null);
  const [selectedFee, setSelectedFee] = useState<500 | 3000 | 10000>(3000);
  const [slippage, setSlippage] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load balances when network or session changes
  useEffect(() => {
    const loadBalances = async () => {
      if (!sessionId || !isConnected) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/swap/balances?network=${currentNetwork}`, {
          headers: { Authorization: `Bearer ${sessionId}` },
        });

        if (response.ok) {
          const data = await response.json();
          setBalances(data);
        }
      } catch (error) {
        console.error('Failed to load balances:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBalances();
  }, [currentNetwork, sessionId, isConnected]);

  // Get quote when amount or tokens change
  useEffect(() => {
    const getQuote = async () => {
      if (!amount || parseFloat(amount) <= 0 || fromToken === toToken || !sessionId) {
        setQuote(null);
        return;
      }

      try {
        const response = await fetch('/api/swap/quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionId}`,
          },
          body: JSON.stringify({
            fromToken,
            toToken,
            amount,
            fee: selectedFee,
            network: currentNetwork,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setQuote(data);
          setError(null);
        } else {
          setQuote(null);
          setError('Failed to get quote');
        }
      } catch (error) {
        console.error('Quote error:', error);
        setQuote(null);
        setError('Failed to get quote');
      }
    };

    const debounceTimer = setTimeout(getQuote, 500);
    return () => clearTimeout(debounceTimer);
  }, [amount, fromToken, toToken, selectedFee, sessionId, currentNetwork]);

  // Only show on testnet and mainnet
  if (!isVisible || (currentNetwork !== 'testnet' && currentNetwork !== 'mainnet')) {
    return (
      <Alert icon={<IconInfoCircle size={16} />} color="yellow">
        GinsenSwap is available on testnet and mainnet networks only.
      </Alert>
    );
  }

  const handleSwap = async () => {
    if (!amount || !quote || !sessionId) return;

    setIsSwapping(true);
    setError(null);

    try {
      const response = await fetch('/api/swap/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          fromToken,
          toToken,
          amount,
          fee: selectedFee,
          slippage,
          network: currentNetwork,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Swap successful:', data);

        // Refresh balances
        const balanceResponse = await fetch(`/api/swap/balances?network=${currentNetwork}`, {
          headers: { Authorization: `Bearer ${sessionId}` },
        });
        if (balanceResponse.ok) {
          const newBalances = await balanceResponse.json();
          setBalances(newBalances);
        }

        // Reset form
        setAmount('');
        setQuote(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Swap failed');
      }
    } catch (error) {
      console.error('Swap failed:', error);
      setError('Swap failed');
    } finally {
      setIsSwapping(false);
    }
  };

  const handleTokenSwitch = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount('');
    setQuote(null);
  };

  const getTokenBalance = (token: 'USDT' | 'USDC') => {
    return balances?.balances[token] || '0.0000';
  };

  if (!isConnected) {
    return (
      <Card withBorder radius="md" p="lg">
        <Stack gap="md" align="center">
          <Text size="lg" fw={600}>
            GinsenSwap DEX
          </Text>
          <Text c="dimmed" ta="center">
            Connect your wallet to start swapping stablecoins on Conflux eSpace
          </Text>
          <Alert icon={<IconInfoCircle size={16} />} color="blue">
            <Text size="sm">
              Uniswap V3 compatible DEX for stablecoin swaps with minimal slippage
            </Text>
          </Alert>
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Group gap="xs">
              <Text fw={600} size="lg">
                GinsenSwap
              </Text>
              <Badge size="sm" color="green">
                {currentNetwork === 'mainnet' ? 'Mainnet' : 'Testnet'}
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              Uniswap V3 stablecoin DEX on Conflux eSpace
            </Text>
          </div>
          <Group gap="xs">
            <ActionIcon variant="subtle" size="sm">
              <IconSettings size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => window.open('https://ginsenswap.io', '_blank')}
            >
              <IconExternalLink size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {error && (
          <Alert icon={<IconInfoCircle size={16} />} color="red">
            {error}
          </Alert>
        )}

        {/* From Token */}
        <div>
          <Group justify="space-between" mb={5}>
            <Text size="sm" c="dimmed">
              From
            </Text>
            <Text size="xs" c="dimmed">
              Balance: {getTokenBalance(fromToken)}
            </Text>
          </Group>
          <Group>
            <Select
              data={Object.keys(TOKENS)}
              value={fromToken}
              onChange={(value) => value && setFromToken(value as 'USDT' | 'USDC')}
              w={100}
            />
            <NumberInput
              placeholder="0.0"
              value={amount}
              onChange={(val) => setAmount(val?.toString() || '')}
              flex={1}
              min={0}
              max={parseFloat(getTokenBalance(fromToken))}
              rightSection={
                <Button
                  size="xs"
                  variant="subtle"
                  onClick={() => setAmount(getTokenBalance(fromToken))}
                >
                  MAX
                </Button>
              }
            />
          </Group>
        </div>

        {/* Swap Direction Button */}
        <Group justify="center">
          <ActionIcon variant="light" size="lg" onClick={handleTokenSwitch} color="blue">
            <IconArrowsExchange size={20} />
          </ActionIcon>
        </Group>

        {/* To Token */}
        <div>
          <Group justify="space-between" mb={5}>
            <Text size="sm" c="dimmed">
              To
            </Text>
            <Text size="xs" c="dimmed">
              Balance: {getTokenBalance(toToken)}
            </Text>
          </Group>
          <Group>
            <Select
              data={Object.keys(TOKENS)}
              value={toToken}
              onChange={(value) => value && setToToken(value as 'USDT' | 'USDC')}
              w={100}
            />
            <NumberInput
              placeholder="0.0"
              value={quote ? parseFloat(quote.amountOut).toFixed(6) : ''}
              readOnly
              flex={1}
              rightSection={isLoading ? <Loader size="sm" /> : null}
            />
          </Group>
        </div>

        {/* Settings */}
        <Card withBorder p="sm">
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>
              Pool Fee
            </Text>
            <Text size="sm" fw={500}>
              Slippage
            </Text>
          </Group>
          <Group justify="space-between">
            <Select
              data={[
                { value: '500', label: '0.05%' },
                { value: '3000', label: '0.3%' },
                { value: '10000', label: '1%' },
              ]}
              value={selectedFee.toString()}
              onChange={(value) => value && setSelectedFee(Number(value) as 500 | 3000 | 10000)}
              size="xs"
              w={80}
            />
            <Group gap="xs">
              {[0.1, 0.5, 1.0].map((s) => (
                <Button
                  key={s}
                  size="xs"
                  variant={slippage === s ? 'filled' : 'outline'}
                  onClick={() => setSlippage(s)}
                >
                  {s}%
                </Button>
              ))}
            </Group>
          </Group>
        </Card>

        <Divider />

        {/* Quote Info */}
        {quote && (
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Exchange Rate
              </Text>
              <Text size="sm">
                1 {fromToken} ≈ {(parseFloat(quote.amountOut) / parseFloat(amount)).toFixed(6)}{' '}
                {toToken}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Pool Fee
              </Text>
              <Text size="sm">{selectedFee / 10000}%</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Slippage Tolerance
              </Text>
              <Text size="sm">{slippage}%</Text>
            </Group>
          </Stack>
        )}

        {/* Action Button */}
        <Button
          fullWidth
          onClick={handleSwap}
          disabled={
            !amount ||
            !quote ||
            fromToken === toToken ||
            parseFloat(amount) <= 0 ||
            parseFloat(amount) > parseFloat(getTokenBalance(fromToken))
          }
          loading={isSwapping}
          size="md"
        >
          {fromToken === toToken
            ? 'Select different tokens'
            : !amount || parseFloat(amount) === 0
              ? 'Enter amount'
              : !quote
                ? 'Getting quote...'
                : parseFloat(amount) > parseFloat(getTokenBalance(fromToken))
                  ? 'Insufficient balance'
                  : 'Swap Tokens'}
        </Button>

        <Text size="xs" c="dimmed" ta="center">
          Powered by GinsenSwap • Network: Conflux eSpace{' '}
          {currentNetwork === 'mainnet' ? 'Mainnet' : 'Testnet'}
        </Text>
      </Stack>
    </Card>
  );
};
