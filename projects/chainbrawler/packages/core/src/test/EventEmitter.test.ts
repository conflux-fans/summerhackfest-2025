// Tests for EventEmitter
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventEmitter } from "../events/EventEmitter";
import { EventType } from "../types";

describe("EventEmitter", () => {
  let eventEmitter: EventEmitter;

  beforeEach(() => {
    eventEmitter = new EventEmitter();
  });

  describe("Event Subscription", () => {
    it("should subscribe to events", () => {
      const listener = vi.fn();
      const unsubscribe = eventEmitter.on(EventType.CHARACTER_CREATED, listener);

      expect(typeof unsubscribe).toBe("function");
      expect(eventEmitter.listenerCount(EventType.CHARACTER_CREATED)).toBe(1);
    });

    it("should unsubscribe from events", () => {
      const listener = vi.fn();
      const unsubscribe = eventEmitter.on(EventType.CHARACTER_CREATED, listener);

      unsubscribe();

      expect(eventEmitter.listenerCount(EventType.CHARACTER_CREATED)).toBe(0);
    });

    it("should handle multiple listeners for same event", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventEmitter.on(EventType.CHARACTER_CREATED, listener1);
      eventEmitter.on(EventType.CHARACTER_CREATED, listener2);

      expect(eventEmitter.listenerCount(EventType.CHARACTER_CREATED)).toBe(2);
    });

    it("should handle multiple events", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventEmitter.on(EventType.CHARACTER_CREATED, listener1);
      eventEmitter.on(EventType.FIGHT_STARTED, listener2);

      expect(eventEmitter.listenerCount(EventType.CHARACTER_CREATED)).toBe(1);
      expect(eventEmitter.listenerCount(EventType.FIGHT_STARTED)).toBe(1);
    });
  });

  describe("Event Emission", () => {
    it("should emit events to listeners", () => {
      const listener = vi.fn();
      eventEmitter.on(EventType.CHARACTER_CREATED, listener);

      const data = { characterClass: 0 };
      eventEmitter.emit(EventType.CHARACTER_CREATED, data);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        type: EventType.CHARACTER_CREATED,
        data,
        timestamp: expect.any(Number),
      });
    });

    it("should emit to multiple listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventEmitter.on(EventType.CHARACTER_CREATED, listener1);
      eventEmitter.on(EventType.CHARACTER_CREATED, listener2);

      eventEmitter.emit(EventType.CHARACTER_CREATED, {});

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it("should not emit to unsubscribed listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = eventEmitter.on(EventType.CHARACTER_CREATED, listener1);
      eventEmitter.on(EventType.CHARACTER_CREATED, listener2);

      unsubscribe1();
      eventEmitter.emit(EventType.CHARACTER_CREATED, {});

      expect(listener1).toHaveBeenCalledTimes(0);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it("should handle events with no listeners", () => {
      expect(() => {
        eventEmitter.emit(EventType.CHARACTER_CREATED, {});
      }).not.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle listener errors gracefully", () => {
      const errorListener = vi.fn(() => {
        throw new Error("Listener error");
      });
      const normalListener = vi.fn();

      eventEmitter.on(EventType.CHARACTER_CREATED, errorListener);
      eventEmitter.on(EventType.CHARACTER_CREATED, normalListener);

      // Should not throw
      expect(() => {
        eventEmitter.emit(EventType.CHARACTER_CREATED, {});
      }).not.toThrow();

      expect(normalListener).toHaveBeenCalledTimes(1);
    });
  });

  describe("onAny", () => {
    it("should subscribe to all events", () => {
      const listener = vi.fn();
      const unsubscribe = eventEmitter.onAny(listener);

      eventEmitter.emit(EventType.CHARACTER_CREATED, {});
      eventEmitter.emit(EventType.FIGHT_STARTED, {});

      expect(listener).toHaveBeenCalledTimes(2);
      expect(typeof unsubscribe).toBe("function");
    });

    it("should unsubscribe from all events", () => {
      const listener = vi.fn();
      const unsubscribe = eventEmitter.onAny(listener);

      unsubscribe();

      eventEmitter.emit(EventType.CHARACTER_CREATED, {});
      eventEmitter.emit(EventType.FIGHT_STARTED, {});

      expect(listener).toHaveBeenCalledTimes(0);
    });
  });

  describe("removeAllListeners", () => {
    it("should remove all listeners for specific event", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventEmitter.on(EventType.CHARACTER_CREATED, listener1);
      eventEmitter.on(EventType.CHARACTER_CREATED, listener2);
      eventEmitter.on(EventType.FIGHT_STARTED, listener1);

      eventEmitter.removeAllListeners(EventType.CHARACTER_CREATED);

      expect(eventEmitter.listenerCount(EventType.CHARACTER_CREATED)).toBe(0);
      expect(eventEmitter.listenerCount(EventType.FIGHT_STARTED)).toBe(1);
    });

    it("should remove all listeners for all events", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventEmitter.on(EventType.CHARACTER_CREATED, listener1);
      eventEmitter.on(EventType.FIGHT_STARTED, listener2);

      eventEmitter.removeAllListeners();

      expect(eventEmitter.listenerCount(EventType.CHARACTER_CREATED)).toBe(0);
      expect(eventEmitter.listenerCount(EventType.FIGHT_STARTED)).toBe(0);
    });
  });

  describe("eventNames", () => {
    it("should return event names with listeners", () => {
      eventEmitter.on(EventType.CHARACTER_CREATED, vi.fn());
      eventEmitter.on(EventType.FIGHT_STARTED, vi.fn());

      const eventNames = eventEmitter.eventNames();

      expect(eventNames).toContain(EventType.CHARACTER_CREATED);
      expect(eventNames).toContain(EventType.FIGHT_STARTED);
    });

    it("should return empty array when no listeners", () => {
      const eventNames = eventEmitter.eventNames();

      expect(eventNames).toEqual([]);
    });
  });

  describe("listenerCount", () => {
    it("should return correct listener count", () => {
      expect(eventEmitter.listenerCount(EventType.CHARACTER_CREATED)).toBe(0);

      eventEmitter.on(EventType.CHARACTER_CREATED, vi.fn());
      expect(eventEmitter.listenerCount(EventType.CHARACTER_CREATED)).toBe(1);

      eventEmitter.on(EventType.CHARACTER_CREATED, vi.fn());
      expect(eventEmitter.listenerCount(EventType.CHARACTER_CREATED)).toBe(2);
    });
  });
});
