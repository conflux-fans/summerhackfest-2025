# Contributing

## Package manager

This repository uses pnpm as the canonical package manager. Please use pnpm when installing or updating dependencies.

If you need to regenerate the lockfile locally:

1. Remove any other lockfiles (e.g., `package-lock.json`).
2. Run:

```bash
pnpm install --no-frozen-lockfile
```

3. Commit the resulting `pnpm-lock.yaml`.

In CI or Codespaces, the prebuild checks will prefer the existing lockfile. If a lockfile is missing, the prebuild will install without the `--frozen-lockfile` flag to avoid failing the process.

## Development Environment

### Local Development

1. Ensure you have Node.js 18+ and pnpm installed
2. Clone the repository and run `pnpm install`
3. Start the backend: `node backend-service.js`
4. Start the frontend: `pnpm run dev`

### GitHub Codespaces (Recommended for Demo/Testing)

The repository includes a devcontainer configuration optimized for GitHub Codespaces:

**✅ What works:**

- Node 20 environment with pnpm pre-installed
- OpenSSL 3 available (from Debian Bookworm base)
- Automatic dependency installation on container creation
- Port forwarding (3000, 3001, 3002) configured
- VS Code extensions (Prettier, ESLint) pre-installed

**🚧 Current limitations:**

- Manual service startup required (not yet fully automated)
- No docker-in-docker support (removed to avoid build failures)

**Setup steps:**

1. Open the repository in GitHub Codespaces
2. Wait for the devcontainer to build and install dependencies
3. Manually start services in separate terminals:

   ```bash
   # Terminal 1: Backend
   node backend-service.js

   # Terminal 2: Frontend
   pnpm run dev
   ```

**Verification commands:**

- Check Node version: `node -v` (should be v20.x)
- Check pnpm: `pnpm -v`
- Check OpenSSL: `openssl version` (should show OpenSSL 3.x)

### Environment Requirements

The project requires:

- **Node.js**: 20.x (LTS)
- **Package Manager**: pnpm 8+
- **OpenSSL**: Version 3.x (for cryptographic operations)
- **TypeScript**: 5.x (dev dependency)
