#!/usr/bin/env node

// This script demonstrates how to use the published @conflux-devkit/backend package
// It can be run standalone to provide backend services for the frontend

import { BackendServer } from '@conflux-devkit/backend';

async function startBackend() {
  console.log('🚀 Starting Conflux Box Backend using @conflux-devkit/backend...');

  try {
    const server = new BackendServer({
      port: parseInt(process.env.PORT || '3001', 10),
      wsPort: parseInt(process.env.WS_PORT || '3002', 10),
      devkitConfig: {
        chainId: 2029, // Local development Core Space chain ID
        evmChainId: 2030, // Local development eSpace chain ID
        jsonrpcHttpPort: 12537,
        jsonrpcWsPort: 12535,
        jsonrpcHttpEthPort: 8545,
        jsonrpcWsEthPort: 8546,
        log: true,
        mnemonic:
          process.env.HARDHAT_VAR_DEPLOYER_MNEMONIC ||
          process.env.VITE_HARDHAT_VAR_DEPLOYER_MNEMONIC ||
          'test test test test test test test test test test test junk',
      },
    });

    await server.start();

    console.log('✅ Backend services started successfully!');
    console.log('🌐 REST API: http://localhost:3001');
    console.log('🔌 WebSocket: ws://localhost:3002');
    console.log('📚 Using published packages:');
    console.log('   - @conflux-devkit/node@^0.1.0');
    console.log('   - @conflux-devkit/backend@^0.1.0');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\\n🛑 Shutting down backend services...');
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\\n🛑 Shutting down backend services...');
      await server.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start backend:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startBackend();
}

export { startBackend };