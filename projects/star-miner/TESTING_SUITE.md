# StarMiner Testing Suite

## Overview
Comprehensive testing suite for the StarMiner play-to-earn idle clicker game, covering core game mechanics, React components, and blockchain integration.

## Test Structure

### 📁 Test Organization
```
__tests__/
├── lib/
│   └── game/
│       └── mechanics.test.ts          # Core game logic tests
├── components/
│   ├── StatsPanel.test.tsx           # Statistics display component
│   ├── ClickArea.test.tsx            # Click interaction component
│   └── P2ERewards.test.tsx           # Play-to-earn rewards component
└── hooks/
    └── (future hook tests)
```

### 🧪 Test Categories

#### 1. Game Mechanics Tests (`mechanics.test.ts`)
**Coverage**: Core game logic and calculations
- ✅ Upgrade cost calculations with exponential scaling
- ✅ Stardust per click/second calculations
- ✅ Idle reward calculations with time caps
- ✅ Click processing and state updates
- ✅ Upgrade affordability and purchase logic
- ✅ Prestige system activation and reset
- ✅ Currency conversion (Stardust ↔ CFX ↔ Credits)
- ✅ Game state initialization and management

**Key Test Cases**:
- Exponential cost scaling for upgrades
- Prestige bonus calculations
- Idle time capping (24-hour maximum)
- State immutability during operations
- Edge cases for zero/negative values

#### 2. Component Tests

##### StatsPanel Component (`StatsPanel.test.tsx`)
**Coverage**: Statistics display and UI rendering
- ✅ Renders all game statistics correctly
- ✅ Displays formatted numeric values
- ✅ Shows progress bar for prestige
- ✅ Conditional prestige button display
- ✅ Proper icon rendering
- ✅ Responsive to state changes

##### ClickArea Component (`ClickArea.test.tsx`)
**Coverage**: Click interaction and animations
- ✅ Renders clickable star interface
- ✅ Handles click events properly
- ✅ Displays current stardust and per-click values
- ✅ Shows click animations
- ✅ Supports rapid clicking
- ✅ Accessibility attributes
- ✅ Updates display on state changes

##### P2ERewards Component (`P2ERewards.test.tsx`)
**Coverage**: Play-to-earn functionality
- ✅ Wallet connection state handling
- ✅ P2E interface display when connected
- ✅ Exchange functionality
- ✅ Minimum exchange validation
- ✅ Loading states during transactions
- ✅ Error handling for failed exchanges

## 🛠️ Testing Configuration

### Jest Configuration (`jest.config.js`)
- Next.js integration with `next/jest`
- TypeScript support
- Module path mapping (`@/` alias)
- JSDOM environment for React testing
- Coverage collection from `src/` directory

### Test Setup (`jest.setup.js`)
- React Testing Library DOM matchers
- Next.js router mocking
- Ethereum wallet mocking (`window.ethereum`)
- LocalStorage mocking
- Console method mocking for cleaner output

### Dependencies
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.3",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@types/jest": "^29.5.5"
  }
}
```

## 🚀 Running Tests

### Available Scripts
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Commands
```bash
# Run specific test file
npm test mechanics.test.ts

# Run tests matching pattern
npm test --testNamePattern="upgrade"

# Run tests with verbose output
npm test --verbose
```

## 📊 Coverage Goals

### Target Coverage Metrics
- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

### Critical Areas for Coverage
1. **Game Mechanics**: 95%+ (core business logic)
2. **Component Rendering**: 85%+ (UI functionality)
3. **Hook Logic**: 90%+ (state management)
4. **Utility Functions**: 95%+ (helper functions)

## 🧩 Mock Strategy

### Component Mocking
- **useGameState**: Mock game state values and functions
- **useWallet**: Mock wallet connection states
- **useContracts**: Mock blockchain interactions
- **Formatting utilities**: Mock number formatting

### External Dependencies
- **Next.js Router**: Mocked for navigation testing
- **Ethereum Provider**: Mocked for wallet testing
- **LocalStorage**: Mocked for persistence testing

## 🔍 Test Patterns

### Component Testing Pattern
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup mocks
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly', () => {
    // Render and assert
  })

  it('should handle user interactions', () => {
    // Simulate events and verify
  })
})
```

### Game Logic Testing Pattern
```typescript
describe('Game Mechanics', () => {
  let mockGameState: GameState

  beforeEach(() => {
    mockGameState = createInitialGameState()
  })

  it('should calculate values correctly', () => {
    // Test pure functions
  })

  it('should maintain state immutability', () => {
    // Verify no mutations
  })
})
```

## 🚨 Known Issues & Limitations

### Current Limitations
1. **P2E Component Tests**: TypeScript interface mismatches need resolution
2. **Integration Tests**: Missing end-to-end blockchain interaction tests
3. **Performance Tests**: No load testing for rapid clicking scenarios

### Future Improvements
1. **E2E Testing**: Add Cypress or Playwright for full user journeys
2. **Contract Testing**: Add Hardhat tests for smart contract logic
3. **Performance Testing**: Add benchmarks for game calculations
4. **Visual Regression**: Add screenshot testing for UI components

## 📈 Test Results Summary

### Current Status
- ✅ **Game Mechanics**: Comprehensive coverage of core logic
- ✅ **StatsPanel**: Full component functionality testing
- ✅ **ClickArea**: Complete interaction testing
- ⚠️ **P2ERewards**: Partial coverage (TypeScript issues)

### Quality Metrics
- **Test Files**: 4 created
- **Test Cases**: 50+ individual tests
- **Mock Coverage**: Comprehensive mocking strategy
- **Edge Cases**: Covered for critical paths

## 🎯 Testing Best Practices Applied

1. **Isolation**: Each test is independent and isolated
2. **Clarity**: Descriptive test names and clear assertions
3. **Coverage**: Focus on critical business logic
4. **Maintainability**: Reusable mock setups and helpers
5. **Performance**: Fast-running tests with minimal setup
6. **Reliability**: Consistent results across environments

## 🔧 Maintenance

### Regular Tasks
- Update tests when adding new features
- Maintain mock accuracy with real implementations
- Review and update coverage thresholds
- Refactor tests for better maintainability

### Monitoring
- Track test execution time
- Monitor coverage trends
- Identify flaky tests
- Update dependencies regularly

---

**Note**: This testing suite provides a solid foundation for ensuring StarMiner's reliability and quality. The comprehensive coverage of game mechanics and component behavior helps maintain confidence in the application's functionality as it evolves.