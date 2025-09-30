# Contributing to FluxSub

Thank you for your interest in contributing to FluxSub! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

1. **Check existing issues** - Make sure the issue hasn't been reported already
2. **Use the issue template** - Provide clear description, steps to reproduce, and expected behavior
3. **Include environment details** - OS, browser, Node.js version, etc.
4. **Add screenshots** - If applicable, include screenshots or error messages

### Suggesting Features

1. **Check existing feature requests** - Avoid duplicates
2. **Describe the use case** - Explain why this feature would be valuable
3. **Provide mockups** - If applicable, include design mockups or wireframes
4. **Consider implementation** - Think about how the feature might be implemented

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch** - `git checkout -b feature/amazing-feature`
3. **Make your changes** - Follow the coding standards below
4. **Test your changes** - Ensure everything works as expected
5. **Commit your changes** - Use clear, descriptive commit messages
6. **Push to your fork** - `git push origin feature/amazing-feature`
7. **Create a Pull Request** - Provide clear description of changes

## 📋 Development Guidelines

### Code Style

#### Frontend (TypeScript/React)
- Use **TypeScript** for all new code
- Follow **React best practices** and hooks patterns
- Use **functional components** with hooks
- Prefer **inline styles** over CSS files (current pattern)
- Use **descriptive variable names**
- Add **JSDoc comments** for complex functions

#### Smart Contracts (Solidity)
- Follow **Solidity style guide**
- Use **OpenZeppelin** libraries when possible
- Add **NatSpec documentation** for all public functions
- Include **events** for important state changes
- Use **modifiers** for access control
- Add **input validation** for all external functions

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add subscription ID sharing functionality
fix: resolve wallet connection persistence issue
docs: update README with deployment instructions
style: improve button hover animations
refactor: simplify wallet context implementation
test: add unit tests for subscription creation
```

### Pull Request Guidelines

1. **Clear title** - Describe what the PR does
2. **Detailed description** - Explain the changes and why they're needed
3. **Link issues** - Reference any related issues
4. **Screenshots** - For UI changes, include before/after screenshots
5. **Testing notes** - Describe how you tested the changes

## 🧪 Testing

### Frontend Testing
- Test wallet connection with different wallets
- Verify subscription creation and management
- Check responsive design on different screen sizes
- Test error handling and edge cases

### Smart Contract Testing
- Test all contract functions
- Verify access controls and permissions
- Test edge cases and error conditions
- Ensure gas optimization

## 🏗️ Project Structure

### Frontend (`f-e/`)
```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable React components
├── contexts/           # React contexts for state management
├── config/             # Configuration files
└── types/              # TypeScript type definitions
```

### Smart Contracts (`smart-contracts/`)
```
├── FluxSub.sol         # Main subscription contract
├── FluxSubFactory.sol  # Factory contract
├── INFO.md            # Contract documentation
└── CONTRACT_ADDRESSES.md # Deployed addresses
```

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Conflux wallet (for testing)

### Local Development
1. Fork and clone the repository
2. Install dependencies: `cd f-e && npm install`
3. Start development server: `npm run dev`
4. Open http://localhost:3000

### Smart Contract Development
1. Use Remix IDE or Hardhat for contract development
2. Test on Conflux testnet before mainnet deployment
3. Verify contracts on ConfluxScan after deployment

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Solidity Documentation](https://docs.soliditylang.org)
- [Conflux Documentation](https://docs.confluxnetwork.org)

### Tools
- [Remix IDE](https://remix.ethereum.org) - Smart contract development
- [ConfluxScan](https://confluxscan.io) - Block explorer
- [MetaMask](https://metamask.io) - Wallet for testing

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment details**
   - OS and version
   - Browser and version
   - Node.js version
   - Wallet type and version

2. **Steps to reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior
   - Screenshots or error messages

3. **Additional context**
   - Console errors
   - Network requests
   - Any workarounds found

## 💡 Feature Requests

When suggesting features:

1. **Describe the problem** - What issue does this solve?
2. **Propose a solution** - How should it work?
3. **Consider alternatives** - Are there other ways to solve this?
4. **Provide context** - Who would use this feature?

## 📞 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **Discussions** - For questions and general discussion
- **Documentation** - Check existing docs first

## 🎯 Areas for Contribution

### High Priority
- [ ] Smart contract integration with frontend
- [ ] Mobile responsiveness improvements
- [ ] Error handling and user feedback
- [ ] Performance optimizations

### Medium Priority
- [ ] Additional wallet support
- [ ] Advanced analytics
- [ ] API documentation
- [ ] Unit tests

### Low Priority
- [ ] UI/UX improvements
- [ ] Additional languages
- [ ] Advanced features
- [ ] Documentation improvements

## 📄 License

By contributing to FluxSub, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to FluxSub! 🚀
