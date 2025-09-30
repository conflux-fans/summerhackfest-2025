// Tests for error handling system
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorType } from "../types";
import {
  ERROR_CODES,
  extractErrorCode,
  getErrorMessage,
  isRetryableError,
  UNKNOWN_ERROR_CODE,
} from "../utils/errorCodes";
import { UXErrorHandler } from "../utils/errorHandler";

describe("Error Codes", () => {
  describe("getErrorMessage", () => {
    it("should return correct message for known error codes", () => {
      expect(getErrorMessage(1201)).toBe("Character does not exist");
      expect(getErrorMessage(1503)).toBe("Transfer failed");
      expect(getErrorMessage(1704)).toBe("Insufficient contract balance");
    });

    it("should return unknown error message for unknown codes", () => {
      expect(getErrorMessage(UNKNOWN_ERROR_CODE)).toBe("Unknown error: 5000");
      expect(getErrorMessage(0)).toBe("Unknown error: 0");
    });
  });

  describe("extractErrorCode", () => {
    it("should extract error code from number", () => {
      expect(extractErrorCode(1201)).toBe(1201);
    });

    it("should extract error code from error object with code property", () => {
      expect(extractErrorCode({ code: 1201 })).toBe(1201);
    });

    it("should extract error code from nested error object", () => {
      expect(extractErrorCode({ error: { code: 1201 } })).toBe(1201);
    });

    it("should extract error code from message string", () => {
      expect(extractErrorCode({ message: "Error code: 1201" })).toBe(1201);
      expect(extractErrorCode({ message: "error code: 1503" })).toBe(1503);
    });

    it("should return null for invalid inputs", () => {
      expect(extractErrorCode(null)).toBeNull();
      expect(extractErrorCode(undefined)).toBeNull();
      expect(extractErrorCode({})).toBeNull();
      expect(extractErrorCode("invalid")).toBeNull();
    });
  });

  describe("isRetryableError", () => {
    it("should return true for retryable error codes", () => {
      expect(isRetryableError(1704)).toBe(true);
      expect(isRetryableError(1503)).toBe(true);
      expect(isRetryableError(1718)).toBe(true);
    });

    it("should return false for non-retryable error codes", () => {
      expect(isRetryableError(1201)).toBe(false);
      expect(isRetryableError(1202)).toBe(false);
      expect(isRetryableError(5000)).toBe(false);
    });
  });
});

describe("UXErrorHandler", () => {
  let mockStore: any;
  let mockLogger: any;
  let errorHandler: UXErrorHandler;

  beforeEach(() => {
    mockStore = {
      setError: vi.fn(),
      setStatusMessage: vi.fn(),
    };
    mockLogger = {
      error: vi.fn(),
    };
    errorHandler = new UXErrorHandler(mockStore, mockLogger);
  });

  describe("handleContractError", () => {
    it("should handle known error codes correctly", () => {
      const error = { code: 1201 };
      const context = { operation: "createCharacter" };

      const result = errorHandler.handleContractError(error, context);

      expect(result.type).toBe(ErrorType.CHARACTER_ERROR);
      expect(result.code).toBe(1201);
      expect(result.message).toBe("Character does not exist");
      expect(result.retryable).toBe(false);
      expect(result.context).toEqual(context);
      expect(mockStore.setError).toHaveBeenCalledWith("Character does not exist");
      expect(mockStore.setStatusMessage).toHaveBeenCalledWith("Error: Character does not exist");
    });

    it("should handle unknown error codes", () => {
      const error = { code: UNKNOWN_ERROR_CODE };

      const result = errorHandler.handleContractError(error);

      expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(result.code).toBe(UNKNOWN_ERROR_CODE);
      expect(result.message).toBe("Unknown error: 5000");
      expect(result.retryable).toBe(false);
    });

    it("should handle errors without codes", () => {
      const error = { message: "Network error" };

      const result = errorHandler.handleContractError(error);

      expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(result.code).toBe(UNKNOWN_ERROR_CODE);
      expect(result.message).toBe("Unknown error: 5000");
    });

    it("should categorize errors correctly", () => {
      const testCases = [
        { code: 1001, expectedType: ErrorType.VALIDATION_ERROR },
        { code: 1101, expectedType: ErrorType.CONTRACT_ERROR },
        { code: 1201, expectedType: ErrorType.CHARACTER_ERROR },
        { code: 1301, expectedType: ErrorType.CONTRACT_ERROR },
        { code: 1401, expectedType: ErrorType.VALIDATION_ERROR },
        { code: 1501, expectedType: ErrorType.POOL_ERROR },
        { code: 1601, expectedType: ErrorType.CONTRACT_ERROR },
        { code: 1701, expectedType: ErrorType.LEADERBOARD_ERROR },
        { code: 2001, expectedType: ErrorType.CONTRACT_ERROR },
      ];

      testCases.forEach(({ code, expectedType }) => {
        const result = errorHandler.handleContractError({ code });
        expect(result.type).toBe(expectedType);
      });
    });

    it("should log errors when logger is provided", () => {
      const error = { code: 1201 };
      const context = { operation: "test" };

      errorHandler.handleContractError(error, context);

      expect(mockLogger.error).toHaveBeenCalledWith("Contract error occurred", {
        code: 1201,
        message: "Character does not exist",
        type: ErrorType.CHARACTER_ERROR,
        retryable: false,
        context,
      });
    });
  });

  describe("clearError", () => {
    it("should clear error state", () => {
      errorHandler.clearError();

      expect(mockStore.setError).toHaveBeenCalledWith(null);
      expect(mockStore.setStatusMessage).toHaveBeenCalledWith("Ready for action");
    });
  });

  describe("retryOperation", () => {
    it("should retry operation on retryable errors", async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce({ code: 1704 }) // Retryable error
        .mockResolvedValueOnce("success");

      const result = await errorHandler.retryOperation(operation, 3, 100);

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("should fail after max retries", async () => {
      const operation = vi.fn().mockRejectedValue({ code: 1704 });

      await expect(errorHandler.retryOperation(operation, 2, 10)).rejects.toThrow();
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("should not retry non-retryable errors", async () => {
      const operation = vi.fn().mockRejectedValue({ code: 1201 }); // Non-retryable

      await expect(errorHandler.retryOperation(operation, 3, 10)).rejects.toThrow();
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should use exponential backoff", async () => {
      const operation = vi.fn().mockRejectedValue({ code: 1704 });
      const startTime = Date.now();

      await expect(errorHandler.retryOperation(operation, 3, 100)).rejects.toThrow();

      // Should have waited at least 100ms + 200ms = 300ms
      expect(Date.now() - startTime).toBeGreaterThanOrEqual(300);
    });
  });
});
