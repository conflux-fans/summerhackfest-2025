# AI Agents Guide (DeepFamily)

This guide standardizes how multiple agents (Coding, Review, Docs, etc.) collaborate in this repository to keep changes safe, consistent, and verifiable.

## Project Context at a Glance
- Structure: `contracts/` contracts, `deploy/` and `tasks/` deploy and tasks, `scripts/` utilities, `test/` tests, `frontend/` web app, `docs/` documentation.
- Key commands:
  - Install deps: `npm install`
  - Compile contracts: `npm run build`
  - Run tests: `npm test` (Gas: `npm run test:gas`, Coverage: `npm run test:coverage`)
  - Local chain: `npm run dev:node`
  - Deploy + seed (local): `npm run dev:deploy && npm run dev:seed`
  - Frontend dev: `npm run frontend:dev`
  - One‑shot dev: `npm run dev:all`
  - Code quality: `npm run lint`, `npm run format`

## Roles & Responsibilities

### Coding Agent
- Scope: Precise changes across contracts, scripts, tests, frontend, and small docs updates.
- Process:
  - Outline a brief plan, then execute in steps; track multi‑step work with the plan tool.
  - Read files with `rg` in chunks; modify files via patches (apply_patch).
  - Prefer locally verifiable changes: compile, test, and run minimal flows; provide commands for user verification when needed.
  - Avoid unrelated diffs; match existing style; update docs when relevant.
- Code style:
  - Formatting: Prettier (2 spaces, width 100, trailing commas). Solidity uses `prettier-plugin-solidity`.
  - Linting: Solhint (see `.solhint.json`); run `npm run lint:fix` if needed.
  - Solidity: explicit visibility, `^0.8.20`; avoid unnecessary storage ops/loops; reuse error types.
  - Frontend: TypeScript; components/pages `PascalCase.tsx`, hooks `useX.ts`, functions/vars `camelCase`.
- Testing:
  - Framework: Hardhat + Mocha + Chai; place tests in `test/*.test.js`, grouped by behavior.
  - Add/update tests for any public API change; cover edges and failure paths.
  - Use `npm run test:coverage` for coverage and include `npm run test:gas` in PR context when helpful.

### Commit Reviewer
- Reference: `.claude/agents/commit-reviewer.md`.
- Goal: Enforce Conventional Commits (`feat|fix|docs|refactor|test|chore|ci|perf|revert`) that match the diff.
- Notes: Reject vague wording, require specificity aligned to changes; never include AI identifiers in commit messages.

### Solidity Auditor
- Focus: access control, reentrancy, overflow, upgrade assumptions, event coverage, gas hotspots, storage layout, error consistency.
- Output: issue list with risk level, remediation suggestions, and minimal viable patch drafts, with key line references.

### Frontend Assistant
- Focus: ABI sync, hook/context usage, interactions and state, performance and a11y, strict typing.
- After changes, run `npm run frontend:dev` locally for manual smoke checks and provide quick test steps.

### Docs Assistant
- Focus: keep `docs/`, README, and this file in sync; add summaries and examples for architecture/API/contract changes.
- Style: concise, task‑oriented, include executable commands and file paths.

## Playbooks

### Contracts → Tests → Local Verify → Frontend Sync
1) Change `contracts/` code with explicit visibility and full event coverage.
2) Run: `npm run build`, `npm test`, optionally `npm run test:gas`.
3) Local verification: `npm run dev:node` → `npm run dev:deploy && npm run dev:seed`.
4) Frontend ABI sync: after compile, frontend syncs via `frontend/scripts/sync-abi.mjs` (run frontend scripts post‑compile).
5) Start frontend: `npm run frontend:dev`, manually walk key flows.

### Frontend Feature Changes
1) Identify contract methods/events; ensure ABI is synced.
2) Reuse hooks/context in `frontend/src/hooks/` and `frontend/src/context/` (e.g., `useContract.ts`, `WalletContext.tsx`).
3) Use `PascalCase.tsx` for components; include loading/error/empty states when applicable.
4) Sanity: types clean, build passes, key paths smoke‑tested.

### Demo & Seeding
- Start local chain: `npm run dev:node`
- Deploy and seed: `npm run dev:deploy && npm run dev:seed`
- Full stack single command: `npm run dev:all`

## Security & Configuration
- Secrets: never commit keys. Copy `.env.example` to `.env`, set `PRIVATE_KEY`, `INFURA_API_KEY`, scanner keys, etc.
- Accounts: use throwaway/testnet accounts; avoid mainnet keys in local testing.
- Local params: tune `UNLIMITED_SIZE=true`, `EVM_VERSION` in `.env` if needed.

## Commits & PRs
- Commits: Conventional Commits; keep each commit focused on a single intent.
- PRs: describe changes, link issues, include UI screenshots when applicable, list verification steps; ensure CI passes (lint/build/tests).
- Contract changes: ensure ABI/frontend sync; include gas deltas and migration notes when relevant.

## Quality Checklist (for Agents)
- Format & lint: `npm run format`, `npm run lint` (Solidity via Solhint).
- Build & test: `npm run build`, `npm test`, `npm run test:coverage`.
- Local verify: for on‑chain interactions, deploy locally and smoke‑test.
- ABI sync: confirm frontend picked up the latest ABI (frontend scripts after compile).
- Docs sync: update `docs/` and related guides for any public API/behavior change.

## Prompt Templates
- Coding Agent:
  - Goal/context: what module and behavior change; list file paths.
  - Constraints: performance/security/compat requirements; test or verification approach.
  - Output: patch, essential tests, verification commands, and a short note.
- Commit Reviewer:
  - Input: commit type + description + diff summary.
  - Output: compliance result, suggestions, and a recommended conventional commit.

## Reference Files (paths)
- Contracts: `contracts/DeepFamily.sol`, `contracts/DeepFamilyToken.sol`
- Deploy: `deploy/00_deploy_integrated_system.js`
- Tests: `test/*.test.js`
- Frontend: `frontend/src/components/`, `frontend/src/pages/`, `frontend/src/hooks/`, `frontend/src/context/`
- Docs: `docs/architecture.md`, `docs/api.md`, `docs/contracts.md`
- Commit reviewer agent: `.claude/agents/commit-reviewer.md`
