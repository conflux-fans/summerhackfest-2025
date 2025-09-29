# DeepFamily Frontend

React-based blockchain family tree.

> 📖 **Complete Documentation**: See [docs/frontend.md](../docs/frontend.md) for detailed architecture and integration guide.

## Quick Start

```bash
# From project root
npm run frontend:dev        # Start development server
npm run frontend:build      # Production build

# From frontend/ directory  
cd frontend/
npm install
npm run dev
```

**ABI Auto-sync**: Contract ABI automatically synced from `../artifacts/` or `../out/` on dev/build

## Configuration

**Local Development (Recommended)**:
```bash
# Auto-configure with latest local deployment
npm run config:local

# Or run frontend with auto-config
npm run dev:local
```

**Manual Configuration**:
```bash
cp .env.example .env
# Edit .env with your values
```

> 💡 **Auto-Config**: The `config:local` script automatically reads deployment info from `../deployments/localhost/` and updates `.env.local` with the correct contract addresses and settings.

## Common Issues

**Contract Issues**:
- "Network Error" → Verify RPC endpoint and contract address
- Check ABI exists: `src/abi/DeepFamily.json`
- Manually sync ABI: `node scripts/sync-abi.mjs`

**Data Not Found**:
- Verify root hash and version index are correct
- Clear localStorage and reset configuration
