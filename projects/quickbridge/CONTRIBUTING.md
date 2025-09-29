# Contributing to QuickBridge

Thank you for your interest in contributing to QuickBridge! We welcome contributions from the community to help improve this cross-chain bridging dApp. Whether it's fixing bugs, adding features, or enhancing documentation, your efforts make a difference in the Conflux ecosystem.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [syv_dev on Discord](https://discord.com/users/syv_dev).

## Getting Started

To contribute, follow these steps:

1. **Fork the Repository**  
   Fork the main repo ([github.com/0xfdbu/summerhackfest-2025](https://github.com/0xfdbu/summerhackfest-2025)) to your GitHub account.

2. **Clone Your Fork**  
   ```bash
   git clone https://github.com/0xfdbu/summerhackfest-2025.git
   cd projects/quickbridge/app
   ```

3. **Install Dependencies**  
   This project uses Vite and npm. Ensure you have Node.js ≥18 installed.  
   ```bash
   npm install
   ```

4. **Run the Development Server**  
   Start the dev server with hot reloading:  
   ```bash
   npm run dev
   ```  
   The app will be available at `http://localhost:5173`.

5. **Make Your Changes**  
   - Create a new branch for your feature or bugfix:  
     ```bash
     git checkout -b feature/your-feature-name
     ```  
   - Implement your changes in the `src/` directory. Focus on components like `SwapStatus.tsx` or routing in `App.tsx`.

6. **Test Your Changes**  
   While formal tests are minimal, manually test in the browser:  
   - Connect a wallet (MetaMask or Fluent) to Conflux eSpace testnet.  
   - Initiate a sample swap (e.g., Base USDC → Conflux).  
   - Verify status polling and UI updates.  
   Run linting to check code style:  
   ```bash
   npm run lint
   ```

7. **Commit and Push**  
   Commit with clear, descriptive messages:  
   ```bash
   git add .
   git commit -m "feat: add auto-retry for polling"
   git push origin feature/your-feature-name
   ```

8. **Submit a Pull Request**  
   - Open a PR against the `main` branch of the upstream repo.  
   - Reference any related issues (e.g., "Fixes #123").  
   - Include a summary of changes, why they matter, and any screenshots/GIFs for UI updates.  
   - Ensure the PR passes linting and manual testing.

## Development Workflow

- **Branching**: Use `feature/`, `bugfix/`, or `docs/` prefixes for branches.
- **Commit Messages**: Follow conventional commits (e.g., `feat:`, `fix:`, `docs:`) for better changelogs.
- **Rebase Before PR**: Keep your branch up-to-date with `git rebase main`.

## Code Style & Linting

- **ESLint & TypeScript**: Enforced via `npm run lint`. Fixes issues with `npm run lint -- --fix`.
- **Prettier**: Not explicitly configured, but ESLint handles formatting. Use 2-space indents.
- **React Best Practices**: Hooks-first, functional components, TypeScript for props/state.
- **Dependencies**: See [package.json](package.json) for the stack (React 19, wagmi 2.x, @mesonfi/to, Tailwind CSS 4.x).

Key files to know:
- `src/App.tsx`: Main router and layout.
- `src/components/SwapStatus.tsx`: Core status polling logic.
- `src/hooks/useSwapStatus.ts`: Custom hook for API polling.
- `tailwind.config.js`: Styling config for gradients and themes.

## Reporting Bugs & Feature Requests

- Use the [GitHub Issues](https://github.com/0xfdbu/summerhackfest-2025/issues) page.
- For bugs: Include reproduction steps, expected vs. actual behavior, and browser/wallet details.
- For features: Describe the use case, potential impact, and any Meson/Conflux integration notes.

## Pull Request Guidelines

- **Small & Focused**: One PR per feature/bug.
- **Description**: Explain "what" and "why", not just "how".
- **Screenshots**: For UI changes, add before/after images.
- **Review**: Expect feedback; address comments iteratively.
- **Merge**: Squash commits on merge for a clean history.

## Security Issues

Report vulnerabilities privately to [syv_dev on Discord](https://discord.com/users/syv_dev). Do not open public issues for security concerns.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

Thanks for contributing! Let's build a better bridge to Conflux together. 🚀