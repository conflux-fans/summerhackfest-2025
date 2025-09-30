import {
  calculateUpgradeCost,
  getUpgradeCost,
  calculateStardustPerClick,
  calculateStardustPerSecond,
  calculateIdleRewards,
  canAffordUpgrade,
  purchaseUpgrade,
  processClick,
  canActivatePrestige,
  activatePrestige,
  calculateStardustToCFX,
  calculateCFXToCredits,
  getAvailableUpgrades,
  getUpgradesByCostType,
  calculateTotalUpgradeValue,
  createInitialGameState,
} from '../../../src/lib/game/mechanics'
import { GameState } from '../../../src/types/game'
import { GAME_CONSTANTS } from '../../../src/lib/utils/constants'

describe('Game Mechanics', () => {
  let mockGameState: GameState

  beforeEach(() => {
    mockGameState = createInitialGameState()
  })

  describe('calculateUpgradeCost', () => {
    it('should return base cost for level 0', () => {
      const baseCost = BigInt(10)
      const multiplier = 1150
      const result = calculateUpgradeCost(baseCost, multiplier, 0)
      expect(result).toBe(baseCost)
    })

    it('should calculate exponential cost scaling', () => {
      const baseCost = BigInt(10)
      const multiplier = 1150
      const result = calculateUpgradeCost(baseCost, multiplier, 1)
      expect(result).toBe(BigInt(11)) // 10 * 1150 / 1000 = 11.5 -> 11
    })

    it('should handle multiple levels', () => {
      const baseCost = BigInt(10)
      const multiplier = 1150
      const result = calculateUpgradeCost(baseCost, multiplier, 2)
      expect(result).toBeGreaterThan(BigInt(11))
    })
  })

  describe('calculateStardustPerClick', () => {
    it('should return initial value for empty upgrades', () => {
      const result = calculateStardustPerClick(mockGameState)
      expect(result).toBe(GAME_CONSTANTS.INITIAL_STARDUST_PER_CLICK)
    })

    it('should add upgrade bonuses', () => {
      mockGameState.upgrades = {
        telescope: {
          level: 1,
          cost: BigInt(10),
          costType: 'stardust',
        },
      }
      const result = calculateStardustPerClick(mockGameState)
      expect(result).toBeGreaterThan(GAME_CONSTANTS.INITIAL_STARDUST_PER_CLICK)
    })
  })

  describe('calculateStardustPerSecond', () => {
    it('should return initial value for empty upgrades', () => {
      const result = calculateStardustPerSecond(mockGameState)
      expect(result).toBe(GAME_CONSTANTS.INITIAL_STARDUST_PER_SECOND)
    })

    it('should apply prestige bonus', () => {
      mockGameState.prestigeLevel = 2
      const result = calculateStardustPerSecond(mockGameState)
      expect(result).toBeGreaterThan(GAME_CONSTANTS.INITIAL_STARDUST_PER_SECOND)
    })
  })

  describe('calculateIdleRewards', () => {
    it('should return 0 for non-positive time', () => {
      const result = calculateIdleRewards(BigInt(5), 0)
      expect(result).toBe(BigInt(0))
    })

    it('should calculate rewards correctly', () => {
      const stardustPerSecond = BigInt(5)
      const timeElapsed = 60 // 1 minute
      const result = calculateIdleRewards(stardustPerSecond, timeElapsed)
      expect(result).toBe(BigInt(300)) // 5 * 60
    })

    it('should cap idle time to 24 hours', () => {
      const stardustPerSecond = BigInt(1)
      const timeElapsed = 25 * 60 * 60 // 25 hours
      const result = calculateIdleRewards(stardustPerSecond, timeElapsed)
      expect(result).toBe(BigInt(24 * 60 * 60)) // Capped to 24 hours
    })
  })

  describe('processClick', () => {
    it('should increase stardust and click count', () => {
      mockGameState.stardust = BigInt(10)
      mockGameState.stardustPerClick = BigInt(2)
      mockGameState.totalClicks = 5

      const result = processClick(mockGameState)

      expect(result.stardust).toBe(BigInt(12))
      expect(result.totalClicks).toBe(6)
    })

    it('should not mutate original state', () => {
      const originalStardust = mockGameState.stardust
      const originalClicks = mockGameState.totalClicks

      processClick(mockGameState)

      expect(mockGameState.stardust).toBe(originalStardust)
      expect(mockGameState.totalClicks).toBe(originalClicks)
    })
  })

  describe('canAffordUpgrade', () => {
    it('should return false for non-existent upgrade', () => {
      const result = canAffordUpgrade(mockGameState, 'nonexistent')
      expect(result).toBe(false)
    })

    it('should return true when player can afford upgrade', () => {
      mockGameState.stardust = BigInt(1000)
      // Assuming telescope costs 10 stardust at level 0
      const result = canAffordUpgrade(mockGameState, 'telescope')
      expect(result).toBe(true)
    })

    it('should return false when player cannot afford upgrade', () => {
      mockGameState.stardust = BigInt(1)
      const result = canAffordUpgrade(mockGameState, 'telescope')
      expect(result).toBe(false)
    })
  })

  describe('purchaseUpgrade', () => {
    it('should not change state if upgrade cannot be afforded', () => {
      mockGameState.stardust = BigInt(1)
      const result = purchaseUpgrade(mockGameState, 'telescope')
      expect(result).toBe(mockGameState)
    })

    it('should purchase upgrade when affordable', () => {
      mockGameState.stardust = BigInt(1000)
      const result = purchaseUpgrade(mockGameState, 'telescope')
      
      expect(result.stardust).toBeLessThan(BigInt(1000))
      expect(result.upgrades.telescope?.level).toBe(1)
    })

    it('should recalculate rates after purchase', () => {
      mockGameState.stardust = BigInt(1000)
      const initialPerClick = mockGameState.stardustPerClick
      
      const result = purchaseUpgrade(mockGameState, 'telescope')
      
      expect(result.stardustPerClick).toBeGreaterThan(initialPerClick)
    })
  })

  describe('canActivatePrestige', () => {
    it('should return false when requirement not met', () => {
      mockGameState.stardust = BigInt(100)
      const result = canActivatePrestige(mockGameState)
      expect(result).toBe(false)
    })

    it('should return true when requirement met', () => {
      mockGameState.stardust = GAME_CONSTANTS.PRESTIGE_REQUIREMENT
      const result = canActivatePrestige(mockGameState)
      expect(result).toBe(true)
    })
  })

  describe('activatePrestige', () => {
    it('should not change state if requirement not met', () => {
      mockGameState.stardust = BigInt(100)
      const result = activatePrestige(mockGameState)
      expect(result).toBe(mockGameState)
    })

    it('should reset progress and increase prestige level', () => {
      mockGameState.stardust = GAME_CONSTANTS.PRESTIGE_REQUIREMENT
      mockGameState.totalClicks = 100
      mockGameState.upgrades = { telescope: { level: 1, cost: BigInt(10), costType: 'stardust' } }
      
      const result = activatePrestige(mockGameState)
      
      expect(result.stardust).toBe(BigInt(0))
      expect(result.totalClicks).toBe(0)
      expect(result.upgrades).toEqual({})
      expect(result.prestigeLevel).toBe(1)
    })
  })

  describe('calculateStardustToCFX', () => {
    it('should convert stardust to CFX correctly', () => {
      const stardust = BigInt(1000)
      const result = calculateStardustToCFX(stardust)
      expect(result).toBeGreaterThan(BigInt(0))
    })
  })

  describe('calculateCFXToCredits', () => {
    it('should convert CFX to credits correctly', () => {
      const cfx = BigInt(1e18) // 1 CFX
      const result = calculateCFXToCredits(cfx)
      expect(result).toBe(GAME_CONSTANTS.CREDITS_PER_CFX)
    })
  })

  describe('getAvailableUpgrades', () => {
    it('should return only active upgrades', () => {
      const result = getAvailableUpgrades(mockGameState)
      expect(Array.isArray(result)).toBe(true)
      result.forEach(upgrade => {
        expect(upgrade.isActive).toBe(true)
      })
    })
  })

  describe('getUpgradesByCostType', () => {
    it('should filter upgrades by cost type', () => {
      const stardustUpgrades = getUpgradesByCostType('stardust')
      const creditUpgrades = getUpgradesByCostType('credits')
      
      stardustUpgrades.forEach(upgrade => {
        expect(upgrade.costType).toBe('stardust')
      })
      
      creditUpgrades.forEach(upgrade => {
        expect(upgrade.costType).toBe('credits')
      })
    })
  })

  describe('calculateTotalUpgradeValue', () => {
    it('should return zero for no upgrades', () => {
      const result = calculateTotalUpgradeValue(mockGameState)
      expect(result.stardustSpent).toBe(BigInt(0))
      expect(result.creditsSpent).toBe(BigInt(0))
    })

    it('should calculate total spent correctly', () => {
      mockGameState.upgrades = {
        telescope: { level: 2, cost: BigInt(10), costType: 'stardust' },
      }
      
      const result = calculateTotalUpgradeValue(mockGameState)
      expect(result.stardustSpent).toBeGreaterThan(BigInt(0))
    })
  })

  describe('createInitialGameState', () => {
    it('should create valid initial state', () => {
      const state = createInitialGameState()
      
      expect(state.stardust).toBe(BigInt(0))
      expect(state.stardustPerClick).toBe(GAME_CONSTANTS.INITIAL_STARDUST_PER_CLICK)
      expect(state.stardustPerSecond).toBe(GAME_CONSTANTS.INITIAL_STARDUST_PER_SECOND)
      expect(state.totalClicks).toBe(0)
      expect(state.upgrades).toEqual({})
      expect(state.credits).toBe(BigInt(0))
      expect(state.walletConnected).toBe(false)
      expect(state.userAddress).toBe('')
      expect(state.prestigeLevel).toBe(0)
      expect(Array.isArray(state.achievements)).toBe(true)
      expect(typeof state.lastSaveTime).toBe('number')
    })
  })
})