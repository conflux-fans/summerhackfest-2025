# Known Issues and Limitations

This document lists current limitations, known issues, and planned mitigations for Conflux Box.

## Known Issues

1. Codespaces manual startup

   - Description: The Codespaces devcontainer provides necessary tooling but requires manual startup of backend and frontend services in separate terminals.
   - Mitigation: Documented start commands in README and `submission/docs/USER_GUIDE.md`. Future improvement: add a single orchestration task to start both services automatically.

2. Preview DevKit behavior

   - Description: The project uses preview versions of `@conflux-devkit/node` and `@conflux-devkit/backend`. Some APIs may change upstream.
   - Mitigation: Pin versions in `package.json` and document breaking changes. Add compatibility tests for future releases.

3. No automated contract verification
   - Description: Contract verification (on-chain verification of source) is not automated in this submission.
   - Mitigation: Provide deployment transaction hashes and addresses if available; plan to add verification scripts post-submission.

## Planned Fixes / Roadmap

- Add a Codespaces task to orchestrate backend/frontend startup
- Add an automated contract verification script for deployed contracts

If you encounter issues not listed here, open a GitHub issue or message on Discord for rapid assistance.
