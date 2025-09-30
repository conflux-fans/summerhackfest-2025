# API Reference — DevKit Backend

This document describes the backend API surface used by the Conflux DevKit frontend. The API client is implemented in `src/services/api.ts` (DevKitApiService) and wraps a local backend service that exposes endpoints for devkit features: node control, mining, account management, contract deployment/interactions, and developer utilities.

Base URL

- In development the frontend proxies API requests to `/api` (see Vite proxy). The axios instance in `DevKitApiService` uses the configured base URL (process.env or runtime).

Authentication

- The client stores a `session` token in localStorage under `devkit_session`. The axios request interceptor attaches `Authorization: Bearer <session>` when present.
- A 401 response will cause the client to clear session state via `clearSession()`.

Top-level endpoints (conceptual mapping)

- GET /health — health check
- GET /status/public — public network status
- GET /status/devkit — devkit internal status
- Accounts

  - GET /accounts — list accounts
  - GET /accounts/:address — account details
  - GET /accounts/:address/balance — account balance
  - POST /accounts/sign — sign payload with devkit account

- Contracts

  - POST /contracts/deploy — deploy a contract (bytecode/abi/constructor args)
  - POST /contracts/read — read-only contract call
  - POST /contracts/write — write (state-changing) contract call
  - GET /contracts/:address — contract metadata/info

- Transactions

  - POST /transactions/send — send a transaction
  - POST /transactions/send/advanced — send a transaction with extended options
  - GET /transactions/history — list transaction history

- Node control & mining

  - POST /node/start — start the local node
  - POST /node/stop — stop the local node
  - POST /mining/start — start mining
  - POST /mining/stop — stop mining
  - POST /mining/set-interval — set mining interval
  - POST /mining/mine-blocks — mine one or more blocks immediately

- Network

  - POST /network/switch — switch the selected network
  - GET /network/current — get current network
  - GET /network/stats — network statistics

- Dev settings & maintenance
  - POST /dev/update — update developer settings
  - POST /dev/reset — reset dev environment
  - GET /ws/info — get websocket / ws proxy information

Error handling

- The axios instance maps common HTTP status codes into thrown errors with messages. Client code generally expects JSON error payloads with `message` and `code` when available.

Representative request/response examples

1. Deploy a contract

Request (POST /contracts/deploy)

- Body: { abi, bytecode, constructorArgs?, from?, gasLimit? }

Response

- 200: { txHash, contractAddress, receipt }

2. Read a contract (call)

Request (POST /contracts/read)

- Body: { to: contractAddress, abi, method: string, args?: any[] }

Response

- 200: { result } — the decoded result of the call

3. Send a transaction

Request (POST /transactions/send)

- Body: { from, to, value?, data?, gas?, gasPrice? }

Response

- 200: { txHash }

Notes and implementation details

- The DevKitApiService centralizes axios interceptors: it attaches Authorization if `devkit_session` exists in localStorage and on 401 will clear session state (so the UI can redirect to login or show disconnected state).
- Many endpoints accept flexible payloads; consult `src/services/api.ts` for exact parameter names and optional fields. The API wrapper functions in the file are the source of truth and include helpful parameter typings.

Where to look in the code

- Client wrapper: `src/services/api.ts` — all public methods and their request shapes are implemented there.
- Frontend usage examples: search the repo for `DevKitApiService` usages (e.g., account pages, contract pages, node control components).

TODO / Extensions

- Add example curl and JS/TS fetch snippets for each endpoint (can be auto-generated from the TypeScript types in `src/services/api.ts`).
- Document error payloads and common failure cases per endpoint.

End of API reference (high-level). For precise parameter names and types, see `src/services/api.ts`.

## Common curl examples

Notes about auth/session

- The frontend stores a session token in localStorage under `devkit_session` and sends it as a Bearer token in `Authorization` header. To call the API with curl, set the `Authorization` header to `Bearer <session>`.

1. Health check

curl -s -X GET http://localhost:12537/health

2. Get public status

curl -s -X GET http://localhost:12537/status/public

3. List accounts

curl -s -X GET http://localhost:12537/accounts \
 -H "Authorization: Bearer <SESSION_TOKEN>"

4. Get account balance

curl -s -X GET http://localhost:12537/accounts/0xYOURADDRESS/balance \
 -H "Authorization: Bearer <SESSION_TOKEN>"

5. Deploy a contract

curl -s -X POST http://localhost:12537/contracts/deploy \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <SESSION_TOKEN>" \
 -d '{"abi": [...], "bytecode":"0x...", "from":"0xSENDER", "constructorArgs": []}'

6. Read a contract (call)

curl -s -X POST http://localhost:12537/contracts/read \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <SESSION_TOKEN>" \
 -d '{"to":"0xCONTRACT", "abi": [...], "method":"balanceOf", "args":["0xADDRESS"]}'

7. Send a transaction

curl -s -X POST http://localhost:12537/transactions/send \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <SESSION_TOKEN>" \
 -d '{"from":"0xSENDER","to":"0xRECIPIENT","value":"0xDE0B6B3A7640000"}'

8. Start the local node

curl -s -X POST http://localhost:12537/node/start \
 -H "Authorization: Bearer <SESSION_TOKEN>"

9. Start mining

curl -s -X POST http://localhost:12537/mining/start \
 -H "Authorization: Bearer <SESSION_TOKEN>"

10. Mine N blocks immediately

curl -s -X POST http://localhost:12537/mining/mine-blocks \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <SESSION_TOKEN>" \
 -d '{"count":5}'

11. Switch network

curl -s -X POST http://localhost:12537/network/switch \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <SESSION_TOKEN>" \
 -d '{"network":"local"}'

12. Sign a payload with devkit account

curl -s -X POST http://localhost:12537/accounts/sign \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <SESSION_TOKEN>" \
 -d '{"address":"0xACCOUNT","payload":"0x..."}'

Quick tips

- Replace `http://localhost:12537` with the actual backend base URL when running in Codespaces or deployed environments.
- Use a real session token from the frontend (inspect browser localStorage for `devkit_session`) or use any login flow provided by the backend to obtain one.
- When posting large JSON (ABIs, bytecode), use `--data-binary @file.json` to avoid shell quoting issues.
