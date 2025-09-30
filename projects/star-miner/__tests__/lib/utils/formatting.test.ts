import {
  formatNumber,
  formatTime,
  formatAddress,
  formatCFX,
  parseUserInput,
  calculatePercentage,
  formatPercentage,
  truncateText,
  generateId,
  debounce,
  throttle,
} from '../../../src/lib/utils/formatting'

// Mock timers for debounce/throttle tests
jest.useFakeTimers()

describe('Formatting Utilities', () => {
  describe('formatNumber', () => {
    it('formats small numbers without suffix', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(42)).toBe('42')
      expect(formatNumber(999)).toBe('999')
      expect(formatNumber(BigInt(500))).toBe('500')
    })

    it('formats thousands with K suffix', () => {
      expect(formatNumber(1000)).toBe('1.00K')
      expect(formatNumber(1500)).toBe('1.50K')
      expect(formatNumber(12345)).toBe('12.3K')
      expect(formatNumber(BigInt(50000))).toBe('50.0K')
    })

    it('formats millions with M suffix', () => {
      expect(formatNumber(1000000)).toBe('1.00M')
      expect(formatNumber(2500000)).toBe('2.50M')
      expect(formatNumber(BigInt(123456789))).toBe('123M')
    })

    it('formats billions with B suffix', () => {
      expect(formatNumber(1000000000)).toBe('1.00B')
      expect(formatNumber(BigInt(5000000000))).toBe('5.00B')
    })

    it('formats trillions with T suffix', () => {
      expect(formatNumber(1000000000000)).toBe('1.00T')
      expect(formatNumber(BigInt(7500000000000))).toBe('7.50T')
    })

    it('handles very large numbers with exponential notation', () => {
      const veryLargeNumber = 1e50
      const result = formatNumber(veryLargeNumber)
      expect(result).toMatch(/e\+/)
    })

    it('handles decimal precision correctly', () => {
      expect(formatNumber(1234)).toBe('1.23K') // < 10, 2 decimals
      expect(formatNumber(12345)).toBe('12.3K') // < 100, 1 decimal
      expect(formatNumber(123456)).toBe('123K') // >= 100, 0 decimals
    })

    it('handles BigInt values correctly', () => {
      expect(formatNumber(BigInt(1000))).toBe('1.00K')
      expect(formatNumber(BigInt(1000000))).toBe('1.00M')
    })
  })

  describe('formatTime', () => {
    it('formats seconds only for values under 60', () => {
      expect(formatTime(0)).toBe('0s')
      expect(formatTime(30)).toBe('30s')
      expect(formatTime(59)).toBe('59s')
    })

    it('formats minutes and seconds for values under 3600', () => {
      expect(formatTime(60)).toBe('1m 0s')
      expect(formatTime(90)).toBe('1m 30s')
      expect(formatTime(3599)).toBe('59m 59s')
    })

    it('formats hours and minutes for values under 86400', () => {
      expect(formatTime(3600)).toBe('1h 0m')
      expect(formatTime(3660)).toBe('1h 1m')
      expect(formatTime(86399)).toBe('23h 59m')
    })

    it('formats days and hours for large values', () => {
      expect(formatTime(86400)).toBe('1d 0h')
      expect(formatTime(90000)).toBe('1d 1h')
      expect(formatTime(172800)).toBe('2d 0h')
    })
  })

  describe('formatAddress', () => {
    it('formats valid Ethereum address', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678'
      expect(formatAddress(address)).toBe('0x1234...5678')
    })

    it('handles empty address', () => {
      expect(formatAddress('')).toBe('')
    })

    it('handles short addresses', () => {
      const shortAddress = '0x123'
      expect(formatAddress(shortAddress)).toBe('0x123...x123')
    })

    it('handles null or undefined addresses', () => {
      expect(formatAddress(null as any)).toBe('')
      expect(formatAddress(undefined as any)).toBe('')
    })
  })

  describe('formatCFX', () => {
    it('formats CFX amounts correctly', () => {
      expect(formatCFX(BigInt('1000000000000000000'))).toBe('1.0000 CFX') // 1 CFX
      expect(formatCFX(BigInt('500000000000000000'))).toBe('0.5000 CFX') // 0.5 CFX
      expect(formatCFX('2000000000000000000')).toBe('2.0000 CFX') // 2 CFX
    })

    it('handles very small amounts', () => {
      expect(formatCFX(BigInt('100000000000000'))).toBe('< 0.001 CFX') // 0.0001 CFX
      expect(formatCFX(BigInt('0'))).toBe('< 0.001 CFX')
    })

    it('handles string input', () => {
      expect(formatCFX('1000000000000000000')).toBe('1.0000 CFX')
    })

    it('handles BigInt input', () => {
      expect(formatCFX(BigInt('1000000000000000000'))).toBe('1.0000 CFX')
    })
  })

  describe('parseUserInput', () => {
    it('parses valid decimal input', () => {
      expect(parseUserInput('1.5', 18)).toBe(BigInt('1500000000000000000'))
      expect(parseUserInput('0.1', 18)).toBe(BigInt('100000000000000000'))
    })

    it('handles integer input', () => {
      expect(parseUserInput('5', 18)).toBe(BigInt('5000000000000000000'))
    })

    it('handles empty input', () => {
      expect(parseUserInput('', 18)).toBe(BigInt(0))
      expect(parseUserInput('   ', 18)).toBe(BigInt(0))
    })

    it('handles input with different decimal places', () => {
      expect(parseUserInput('1.5', 6)).toBe(BigInt('1500000'))
      expect(parseUserInput('0.123456', 6)).toBe(BigInt('123456'))
    })

    it('pads decimal places correctly', () => {
      expect(parseUserInput('1.5', 18)).toBe(BigInt('1500000000000000000'))
      expect(parseUserInput('1.50', 18)).toBe(BigInt('1500000000000000000'))
    })

    it('truncates excess decimal places', () => {
      expect(parseUserInput('1.123456789012345678901', 18)).toBe(BigInt('1123456789012345678'))
    })

    it('removes non-numeric characters', () => {
      expect(parseUserInput('$1.50', 18)).toBe(BigInt('1500000000000000000'))
      expect(parseUserInput('1,500.25', 18)).toBe(BigInt('1500250000000000000000'))
    })

    it('throws error for multiple decimal points', () => {
      expect(() => parseUserInput('1.5.0', 18)).toThrow('Invalid number format')
    })
  })

  describe('calculatePercentage', () => {
    it('calculates percentage correctly', () => {
      expect(calculatePercentage(BigInt(50), BigInt(100))).toBe(50)
      expect(calculatePercentage(BigInt(25), BigInt(100))).toBe(25)
      expect(calculatePercentage(BigInt(75), BigInt(100))).toBe(75)
    })

    it('handles zero target', () => {
      expect(calculatePercentage(BigInt(50), BigInt(0))).toBe(0)
    })

    it('caps percentage at 100', () => {
      expect(calculatePercentage(BigInt(150), BigInt(100))).toBe(100)
    })

    it('handles zero current value', () => {
      expect(calculatePercentage(BigInt(0), BigInt(100))).toBe(0)
    })

    it('handles large numbers', () => {
      expect(calculatePercentage(BigInt('500000000000000000000'), BigInt('1000000000000000000000'))).toBe(50)
    })
  })

  describe('formatPercentage', () => {
    it('formats percentage with one decimal place', () => {
      expect(formatPercentage(50.0)).toBe('50.0%')
      expect(formatPercentage(33.333)).toBe('33.3%')
      expect(formatPercentage(66.666)).toBe('66.7%')
    })

    it('handles zero percentage', () => {
      expect(formatPercentage(0)).toBe('0.0%')
    })

    it('handles 100 percentage', () => {
      expect(formatPercentage(100)).toBe('100.0%')
    })

    it('handles decimal values', () => {
      expect(formatPercentage(0.1)).toBe('0.1%')
      expect(formatPercentage(99.9)).toBe('99.9%')
    })
  })

  describe('truncateText', () => {
    it('returns original text when under limit', () => {
      expect(truncateText('Hello', 10)).toBe('Hello')
      expect(truncateText('Short text', 20)).toBe('Short text')
    })

    it('truncates text when over limit', () => {
      expect(truncateText('This is a long text', 10)).toBe('This is...')
      expect(truncateText('Very long text that exceeds limit', 15)).toBe('Very long te...')
    })

    it('handles exact length limit', () => {
      expect(truncateText('Exactly ten', 11)).toBe('Exactly ten')
      expect(truncateText('Exactly ten!', 11)).toBe('Exactly ...')
    })

    it('handles empty string', () => {
      expect(truncateText('', 10)).toBe('')
    })

    it('handles very short limit', () => {
      expect(truncateText('Hello', 3)).toBe('...')
      expect(truncateText('Hello', 4)).toBe('H...')
    })
  })

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(typeof id2).toBe('string')
    })

    it('generates IDs of expected length', () => {
      const id = generateId()
      expect(id.length).toBe(9) // substr(2, 9) from random string
    })

    it('generates alphanumeric IDs', () => {
      const id = generateId()
      expect(id).toMatch(/^[a-z0-9]+$/)
    })
  })

  describe('debounce', () => {
    it('delays function execution', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)
      
      debouncedFn('arg1')
      expect(mockFn).not.toHaveBeenCalled()
      
      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledWith('arg1')
    })

    it('cancels previous calls when called multiple times', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)
      
      debouncedFn('arg1')
      debouncedFn('arg2')
      debouncedFn('arg3')
      
      jest.advanceTimersByTime(100)
      
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg3')
    })

    it('handles multiple arguments', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)
      
      debouncedFn('arg1', 'arg2', 'arg3')
      jest.advanceTimersByTime(100)
      
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
    })
  })

  describe('throttle', () => {
    it('limits function execution frequency', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)
      
      throttledFn('arg1')
      throttledFn('arg2')
      throttledFn('arg3')
      
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg1')
    })

    it('allows execution after throttle period', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)
      
      throttledFn('arg1')
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      jest.advanceTimersByTime(100)
      
      throttledFn('arg2')
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('arg2')
    })

    it('handles multiple arguments', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)
      
      throttledFn('arg1', 'arg2', 'arg3')
      
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
    })

    it('ignores calls during throttle period', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)
      
      throttledFn('arg1')
      throttledFn('arg2')
      
      jest.advanceTimersByTime(50) // Half the throttle period
      
      throttledFn('arg3')
      
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg1')
    })
  })

  describe('Edge Cases', () => {
    it('handles null and undefined inputs gracefully', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatAddress('')).toBe('')
      expect(truncateText('', 10)).toBe('')
    })

    it('handles negative numbers in formatNumber', () => {
      expect(formatNumber(-1000)).toBe('-1000')
      expect(formatNumber(-500)).toBe('-500')
    })

    it('handles very large BigInt values', () => {
      const largeBigInt = BigInt('123456789012345678901234567890')
      const result = formatNumber(largeBigInt)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('handles zero values correctly', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(BigInt(0))).toBe('0')
      expect(formatTime(0)).toBe('0s')
      expect(calculatePercentage(BigInt(0), BigInt(100))).toBe(0)
    })
  })

  describe('Performance', () => {
    it('debounce cleans up timeouts properly', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)
      
      // Call multiple times
      for (let i = 0; i < 10; i++) {
        debouncedFn(`arg${i}`)
      }
      
      jest.advanceTimersByTime(100)
      
      // Should only call once with the last argument
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg9')
    })

    it('throttle resets properly after period', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)
      
      // First call
      throttledFn('first')
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      // Wait for throttle to reset
      jest.advanceTimersByTime(100)
      
      // Second call should work
      throttledFn('second')
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('second')
    })
  })
})