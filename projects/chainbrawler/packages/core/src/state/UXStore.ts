// Core UX Store - centralized state management
// Based on UX_STATE_MANAGEMENT_SPEC.md

import type {
  CharacterData,
  ClaimsData,
  EquipmentDropData,
  FightSummaryData,
  HealingData,
  LeaderboardData,
  MenuState,
  OperationState,
  PoolsData,
  ResurrectionData,
  UXState,
} from "../types";

export class UXStore {
  private state: UXState;
  private listeners: Set<(state: UXState) => void> = new Set();

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): UXState {
    return {
      playerAddress: null,
      character: null,
      menu: null,
      operation: null,
      pools: null,
      leaderboard: null,
      claims: null,
      statusMessage: "Initializing...",
      isLoading: true,
      error: null,
    };
  }

  // State getters
  getState(): UXState {
    return { ...this.state };
  }

  getCharacter(): CharacterData | null {
    return this.state.character;
  }

  getMenu(): MenuState | null {
    return this.state.menu;
  }

  getOperation(): OperationState | null {
    return this.state.operation;
  }

  getPools(): PoolsData | null {
    return this.state.pools;
  }

  getLeaderboard(): LeaderboardData | null {
    return this.state.leaderboard;
  }

  getClaims(): ClaimsData | null {
    return this.state.claims;
  }

  getStatusMessage(): string {
    return this.state.statusMessage;
  }

  isLoading(): boolean {
    return this.state.isLoading;
  }

  getError(): string | null {
    return this.state.error;
  }

  getPlayerAddress(): string | null {
    return this.state.playerAddress;
  }

  // State setters
  updateCharacter(character: CharacterData | null): void {
    this.state.character = character;
    this.notifyListeners();
  }

  updateMenu(menu: MenuState | null): void {
    this.state.menu = menu;
    this.notifyListeners();
  }

  updateOperation(operation: OperationState | null): void {
    this.state.operation = operation;
    this.notifyListeners();
  }

  updatePools(pools: PoolsData | null): void {
    this.state.pools = pools;
    this.notifyListeners();
  }

  updateLeaderboard(leaderboard: LeaderboardData | null): void {
    this.state.leaderboard = leaderboard;
    this.notifyListeners();
  }

  updateClaims(claims: ClaimsData | null): void {
    this.state.claims = claims;
    this.notifyListeners();
  }

  setStatusMessage(message: string): void {
    this.state.statusMessage = message;
    this.notifyListeners();
  }

  setLoading(loading: boolean): void {
    this.state.isLoading = loading;
    this.notifyListeners();
  }

  setError(error: string | null): void {
    this.state.error = error;
    this.notifyListeners();
  }

  setPlayerAddress(address: string | null): void {
    this.state.playerAddress = address;
    this.notifyListeners();
  }

  setOperation(operation: OperationState | null): void {
    this.state.operation = operation;
    this.notifyListeners();
  }

  // Event data setters
  setLastFightSummary(data: FightSummaryData): void {
    this.state.lastFightSummary = data;
    this.notifyListeners();
  }

  setLastEquipmentDropped(data: EquipmentDropData): void {
    this.state.lastEquipmentDropped = data;
    this.notifyListeners();
  }

  setLastHealing(data: HealingData): void {
    this.state.lastHealing = data;
    this.notifyListeners();
  }

  setLastResurrection(data: ResurrectionData): void {
    this.state.lastResurrection = data;
    this.notifyListeners();
  }

  // Subscription management
  subscribe(listener: (state: UXState) => void): () => void {
    this.listeners.add(listener);
    return () => this.unsubscribe(listener);
  }

  unsubscribe(listener: (state: UXState) => void): void {
    this.listeners.delete(listener);
  }

  notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error("Error in state listener:", error);
      }
    });
  }

  // Utility methods
  clearError(): void {
    this.setError(null);
  }

  reset(): void {
    this.state = this.getInitialState();
    this.notifyListeners();
  }

  // Batch updates for performance
  batchUpdate(updates: Partial<UXState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }
}
