# Repository Guidelines

## Project Structure & Module Organization
DeepFamily centers on a Hardhat workspace. Core protocol contracts live in `contracts/`, with deployment flows orchestrated through `deploy/` and maintenance utilities in `scripts/` and `tasks/`. Circom sources sit under `circuits/`, with generated keys and wasm artifacts emitted into `artifacts/circuits/`. The React/Vite dashboard resides in `frontend/`, and shared narrative or research material lands in `docs/`. Contract tests are organized in `test/`, while proof fixtures and circuit-specific checks live in `test_proof/`. Keep bulky artifacts or cache output (e.g., `tmp/`, `cache/`) out of version control unless explicitly required for review.

## Build, Test, and Development Commands
- `npm run setup` — install root dependencies plus the frontend workspace.
- `npm run dev:all` — launch a localhost Hardhat node, deploy contracts, seed demo data, and start the UI.
- `npm run build` — compile Solidity contracts via Hardhat.
- `npm test` — execute the Hardhat Mocha/Chai suite; honors gas reporting when `REPORT_GAS` is set.
- `npm run test:coverage` — run Solidity coverage and write the summary to `coverage.json`.
- `npm run zk:build` — compile circom circuits after fetching binaries with `npm run circuits:fetch`.

## Coding Style & Naming Conventions
Solidity code is formatted by Prettier + `prettier-plugin-solidity` with two-space indentation; lint and autofix using `npm run format` and `npm run lint`. Custom errors, events, and structs follow PascalCase (`DuplicateVersion`, `PersonVersionCreated`), while functions and variables stay camelCase. Constants use `ALL_CAPS`. JavaScript/TypeScript helpers should rely on async/await, avoid unbounded console output, and keep filenames descriptive (`contract-person-version.test.js`, `seed-demo.js`). Frontend components follow PascalCase filenames, co-locate styles next to components, and export a single default component per file.

## Testing Guidelines
Targeted tests use Hardhat’s Mocha runner—name suites `describe('Contract:DeepFamily', ...)` and group scenarios by feature. Prefer fixtures from `deploy/` when spinning contracts, and assert emitted events with Chai matchers. New functionality ships with coverage >80% and should update or extend the `test_proof/` circuits when ZK interfaces change. Validate coverage and gas impact via `npm run test:coverage` and `npm run test:gas` before opening a PR.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat`, `fix`, `refactor(scope)`, `chore(frontend)`), mirroring the existing history. Keep messages in the imperative mood and reference issue IDs in footers when applicable. Pull requests must summarize behavior changes, list validation commands run, highlight migrations or circuit assets that need re-generation, and attach UI screenshots or log snippets when the frontend shifts. Request at least one review from a domain owner (contracts, frontend, or ZK) before merge.

## Security & Configuration Tips
Never commit `.env` files, private keys, or generated `.zkey` material; reference `.env.example` for required shapes. When testing with funded wallets, recycle accounts provided by the Hardhat node and avoid reusing production keys. Regenerate verifier contracts with `npm run zk:verifier` only after updating trusted ceremony artifacts, and document the ceremony transcript location in the PR description.
