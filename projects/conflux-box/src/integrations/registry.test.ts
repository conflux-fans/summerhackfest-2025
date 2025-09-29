import { describe, expect, it } from 'vitest';
import { registerIntegrations } from '../integrations/registry';

describe('Integration Registry', () => {
  it('should register integrations without errors', () => {
    // This should not throw
    expect(() => registerIntegrations()).not.toThrow();
  });

  it('should export registerIntegrations function', () => {
    expect(typeof registerIntegrations).toBe('function');
  });
});
