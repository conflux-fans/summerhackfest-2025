// Event system for ChainBrawler
// Based on UX_STATE_MANAGEMENT_SPEC.md

import { type EventPayload, EventType } from "../types";

export class EventEmitter {
  private listeners: Map<EventType, Set<Function>> = new Map();

  // Subscribe to an event
  on(event: EventType, listener: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  // Unsubscribe from an event
  off(event: EventType, listener: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }

  // Emit an event
  emit(event: EventType, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const payload: EventPayload = {
        type: event,
        data,
        timestamp: Date.now(),
      };

      eventListeners.forEach((listener) => {
        try {
          listener(payload);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Subscribe to all events
  onAny(listener: (payload: EventPayload) => void): () => void {
    const unsubscribeFunctions: (() => void)[] = [];

    // Subscribe to all event types
    Object.values(EventType).forEach((eventType) => {
      const unsubscribe = this.on(eventType, listener);
      unsubscribeFunctions.push(unsubscribe);
    });

    // Return function to unsubscribe from all
    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }

  // Remove all listeners for an event
  removeAllListeners(event?: EventType): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  // Get listener count for an event
  listenerCount(event: EventType): number {
    return this.listeners.get(event)?.size || 0;
  }

  // Get all events with listeners
  eventNames(): EventType[] {
    return Array.from(this.listeners.keys());
  }
}
