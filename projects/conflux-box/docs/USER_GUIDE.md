# User Guide

This guide provides step-by-step instructions to run and use Conflux Box for judges and reviewers.

## Quick Start (Local)

Prerequisites

- Node.js 18+
- pnpm (recommended)
- A Conflux wallet for eSpace (optional for full interaction)

1. Install dependencies

```bash
pnpm install
```

2. Start the frontend dev server and backend togheter

```bash
pnpm run dev
```

4. Open the app in the browser

- Frontend: http://localhost:3000 (or the port printed by Vite)
- Backend API: http://localhost:3001
- Websocket: http://localhost:3002

## Quick Start (GitHub Codespaces)

1. Open the repository in GitHub Codespaces (badge in README)
2. Start the backend and frontend in two terminals:

```bash
# Terminal 1
node backend-service.js

# Terminal 2
pnpm run dev
```

3. Use the forwarded ports in the Codespace preview to access the UI

## Demo Flow (what to show)

Follow these steps during the demo or while testing the app:

1. Dashboard: verify network status and dynamic chain IDs (testnet/mainnet/local)
2. Network switching: switch between networks and observe chain ID updates
3. Accounts: create a development account and view balances
4. Contracts: open the deployment wizard and deploy a template contract
5. Protocols: explore integrated protocols (GinsenSwap, Meson Bridge) and available flows
6. Monitoring: observe real-time transaction and block updates via WebSocket

## Test Data

- Use the DevKit-provided templates in `src/data/contractTemplates.ts` for demo deployments
- Create 1-2 test accounts via the UI to showcase account flows

## Troubleshooting

- If the backend fails to start, check `backend.log` for errors and ensure ports are free
- For Codespaces: make sure ports are forwarded and services are running in separate terminals

## Notes for Reviewers

- The app uses preview versions of DevKit packages; some features are marked as preview and may behave slightly differently from stable releases
- The Demo Video is available at: https://youtu.be/8l3teGlz9RE
- The Demo Video is available at: https://youtu.be/8l3teGlz9RE
- Presentation slides PDF is available at `submission/media/presentation/Conflux-Box.pdf`
- Presentation slides (editable Google Slides): https://docs.google.com/presentation/d/1Ek4gvAlHWE4aK_5ODvdpslF1DaGFcYmDYn6IsKOol58/edit?usp=sharing
