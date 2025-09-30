// Test setup for core package
import { vi } from "vitest";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};

// Mock environment
Object.defineProperty(global, "Date", {
  value: class extends Date {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(1640995200000); // Fixed date for testing
      } else {
        super(
          args[0] || 0,
          args[1] || 0,
          args[2] || 1,
          args[3] || 0,
          args[4] || 0,
          args[5] || 0,
          args[6] || 0
        );
      }
    }
  },
});
