# Picker - AI Powered Smart System for Reliability and Usability in Next Generation Decentralized Internet

![Picker Logo](./desktop/public/test_image.jpg)

Picker is an innovative open-source project dedicated to building next-generation decentralized internet smart systems by combining AI technology, blockchain, and local computing to provide highly reliable and user-friendly services.

## Project Overview

Picker is a multi-component system that integrates AI intelligent agents, decentralized application marketplace, and secure payment systems to provide users with powerful and user-friendly tools. 

This project aims to provide work, entertainment, and life management functions on local PCs for all Web3 users. It leverages AI technology to enhance system intelligence and user experience while addressing the single-point failure issue in traditional centralized systems.

## For Conflux hackathon

Wallet Rust Backend Server Integration:

[Code location](./server)

Second level authorization payment contract:

[Code location](./contract)

Meson cross chain swap:

[Code location](./apps/cross-chain-pay-one-usdt)

Url Links:

https://evm.confluxscan.org/tx/0xeeeb524a7b1d59d82b86b2970f146fa7db5cce71857bcff25e1ac5023f3e2259

https://evm.confluxscan.org/tx/0x766314e8ba549a1bebdba49b2bc169a5ec3cb23391ff5812ee94e1dc95022761

Customize AI Agent for web3:

[Code location](./rust-agent-crate)

## System Architecture

The Picker project adopts a modular design, consisting of the following core components:

```
c:\Users\aiqubit\project\rust\picker/
├── server/              # Rust Axum backend service
├── rust-agent-crate/    # Rust AI Agent framework
├── desktop/             # Tauri2.0 + React + TypeScript + Vite desktop application
├── contract/            # Solidity smart contracts
└── apps/                # Application examples
```

## Core Components

### 1. Server - Backend Service

A Picker application marketplace backend system based on Rust Axum, supporting user registration, login, Picker upload, order payment, and file download.

**Key Features:**
- User Module: Registration, email verification, login, user information management
- Picker Module: Upload, marketplace display, detail viewing
- Order Module: Create orders, point payment, wallet payment, order query
- File Download: Secure temporary download link system

**Technology Stack:**
- Web Framework: Axum 0.8.4
- Database: SQLite3 + SQLx
- Authentication: JWT
- File Processing: Multipart upload
- ...

### 2. Rust-Agent-Crate - AI Agent Framework

A Rust-written AI Agent framework providing integration with large language models, tool calling, MCP service connections, and other features to help developers build powerful intelligent applications.

**Core Features:**
- Unified Execution Interface: Unified execution model based on `Runnable<I, O>` interface, supporting synchronous, asynchronous, and streaming processing
- Large Language Model Integration: Support for calling mainstream large language models like OpenAI
- Intelligent Agent System: Provides implementations like `McpAgent`, supporting context management and tool calling
- Tool Calling Mechanism: Flexible tool registration and calling system
- MCP Service Integration: Connection adapter for MCP services
- Asynchronous Programming Support: Full asynchronous design based on Tokio
- ...

### 3. Desktop - Desktop Application

A desktop application based on Tauri2.0 + React + TypeScript + Vite, providing users with a friendly graphical interface for task management, marketplace browsing, and user profile display.

**Key Features:**
- Home Page: Displays user's current task list, execution count, task status, etc.
- Chat Bot: Provides interactive Q&A services based on large language models framework by customizing the rust-agent.
- Marketplace: Shows uploaded Runner task list, developer information, version numbers, etc.
- User Profile: Displays user points, user information, etc.
- Left Sidebar: Provides access to manuals, blogs, customer service, and other auxiliary functions

### 4. Contract - Smart Contracts

Solidity-based smart contracts implementing on-chain payment and data verification functions, supporting EVM on-chain payment and point payment.

**Core Features:**
- Payment processing for users purchasing Picker installation packages
- On-chain data verification
- Point management

### 5. Apps - Application Examples

Contains multiple example applications demonstrating how to develop various applications using the Picker framework:

- **cross-chain-pay**: A JavaScript application implementing cross-chain token transfers using Meson API

- **picker-python-project-template**: Picker Python project template to help developers quickly start Python application development

## Quick Start

### 1. Backend Service

```bash
# Enter the server directory
cd server

# Install dependencies and run the server
cargo run

# The server will start at http://localhost:3000
```

### 2. Desktop Application

```bash
# Enter the desktop directory
cd desktop

# Install dependencies
npm install

# Run in development mode
npx tauri dev

# Build production version
npx tauri build
```

### 3. AI Agent Framework

```bash
# Enter the rust-agent-crate directory
cd rust-agent-crate

# Build the framework
cargo build

# Run examples
cargo run --example mcp_agent_chatbot
```

### 4. Smart Contracts

```bash
# Enter the contract directory
cd contract

# Install dependencies
npm install --save-dev @nomicfoundation/hardhat-ignition-viem --legacy-peer-deps
npm install --save-dev @nomicfoundation/hardhat-viem --legacy-peer-deps

# Run tests
npx hardhat test

# Deploy contracts
npx hardhat ignition deploy ignition/modules/PickerPayment.ts
```

## Technology Stack

| Component | Technology | Purpose |
|----------|------------|--------|
| Backend | Rust, Axum, SQLite3 | User profile data storage, user authentication, etc. |
| Frontend | React, TypeScript, Vite | Provides user interface, interaction logic, etc. |
| AI Framework | Rust, Tokio, OpenAI API | Provides intelligent agent services, MCP, large language model integration, etc. |
| Blockchain | Solidity, Hardhat | Implements on-chain payment, data verification, etc. |
| Example Apps | Nodejs, Python, Powershell, Bashshell | Demonstrates framework usage, provides development templates |

## User Guide

### User Types

The Picker system supports three user types:

- **General Users**: Can install the platform, download tasks, and execute tasks. Receive 30 free points monthly (not cumulative, reset monthly)

- **Developer Users**: Based on general user permissions, can register and upload tasks to the Runner marketplace

### Point System

- General Users: 30 points monthly.

- Developer Users: Monthly basic points + reward points for others downloading tasks (reduced by 5% as transaction fee)

### Task Marketplace

Developers can upload tasks to the marketplace, and users can browse, download, and run these tasks. Tasks support multiple types, including:

- Scripts: Locally running Python, Nodejs, Powershell, Bashshell scripts

- Mini-apps: Webassembly applications running in the cloud

## Development Guide

### Backend Development

- [README.md](./server/README.md)

### AI Agent Development

- [README.md](./rust-agent-crate/README.md)

### Desktop && GUI Development

- [README.md](./desktop/README.md)

### Desktop backend Development

- [README.md](./desktop/src-tauri/README.md)

### Smart Contract Development

- [README.md](./contract/README.md)

### Application Development

Refer to the example applications in the apps directory to quickly start developing your own Picker applications:

- [README.md](./apps/cross-chain-pay/README.md)
- [README.md](./apps/picker-python-project-template/README.md)

## Project Status

The project is currently in development phase, with the following completion status for each component:

- **Server**: Basic functionality has been implemented, including user module, Picker module, and order module
- **Rust-Agent-Crate**: Core framework has been completed, supporting integration with large language models and tool calling
- **Desktop**: Basic UI framework has been built, including home page, marketplace, and user information functions
- **Contract**: Basic contract functionality has been implemented, supporting on-chain payment and data verification
- **Apps**: Two example applications are provided, demonstrating framework usage methods

## Future Plans

1. Improve user experience and interface design
2. Enhance AI agent capabilities and performance
3. Expand support for more blockchain networks
4. Add more practical tools and APIs
5. Establish a complete community and developer support system

## Contribution Guide

We welcome contributions to the Picker project! You can participate in the following ways:

1. Submit bug reports and feature requests
2. Improve code and documentation
3. Develop example applications
4. Share usage experience and best practices

## License

This project is licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).

## Contact

If you have any questions or suggestions, please contact us through the following methods:

- Email: <openpicklabs@hotmail.com>
- GitHub: <https://github.com/aiqubits/picker>
