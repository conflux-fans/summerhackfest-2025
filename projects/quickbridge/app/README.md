# QuickBridge Frontend

A React-based dApp for cross-chain token swaps using Meson protocol on Conflux eSpace. Features wallet integration (wagmi), real-time status polling (@tanstack/react-query), and Tailwind-styled UI.

## Tech Stack
- **Framework**: React 19 + Vite 7
- **Web3**: wagmi 2 + viem 2 + @mesonfi/to 2
- **Styling**: Tailwind CSS 4
- **Routing**: React Router 7
- **Icons**: Lucide React
- **State**: React Query 5

## Setup
1. **Clone & Install**  
   ```bash
   git clone https://github.com/0xfdbu/summerhackfest-2025.git
   cd projects/quickbridge/app
   npm install
   ```

2. **Dev Server**  
   ```bash
   npm run dev
   ```  
   Open `http://localhost:5173`.

3. **Build**  
   ```bash
   npm run build
   ```

## Usage
- Connect wallet via AppKit.
- Navigate to `/bridge` for swaps.
- Track at `/swap/{txid}` with auto-polling.

## Scripts
- `dev`: Vite dev server.
- `build`: TypeScript + Vite build.
- `lint`: ESLint check.
- `preview`: Vite preview.

For issues: [GitHub](https://github.com/0xfdbu/summerhackfest-2025/issues). MIT License.