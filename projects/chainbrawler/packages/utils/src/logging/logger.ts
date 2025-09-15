/*
 * Copyright 2025 ChainBrawler Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { promises as fs } from "fs";
import { join } from "path";
import pino from "pino";

// Logger configuration via environment variables with safe defaults
const getEnvVar = (key: string, defaultValue: string): string => {
  try {
    return (typeof process !== "undefined" && process.env && process.env[key]) || defaultValue;
  } catch {
    return defaultValue;
  }
};

const level = getEnvVar("LOG_LEVEL", "silent");
const logMode = getEnvVar("LOG_MODE", "console"); // 'console' | 'file' | 'pretty'
const logFile = getEnvVar("LOG_FILE", "");

// Create logs directory if file logging is enabled
if (logMode === "file" || logFile) {
  try {
    const logsDir = join(process.cwd(), "logs");
    fs.mkdir(logsDir, { recursive: true }).catch(() => {}); // Ignore errors
  } catch {
    // Ignore errors in environments where process.cwd() might not be available
  }
}

// Centralized logger configuration
const getLoggerConfig = () => {
  const baseConfig = {
    level,
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
      pid: process.pid,
      service: "chainbrawler",
    },
  };

  // Silent mode - completely disable logging
  if (level === "silent") {
    return {
      level: "silent",
      enabled: false,
    };
  }

  // File mode - log to file only
  if (logMode === "file") {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const destination = logFile || join(process.cwd(), "logs", `chainbrawler-${timestamp}.log`);

    return {
      ...baseConfig,
      transport: {
        target: "pino/file",
        options: {
          destination,
          mkdir: true,
        },
      },
    };
  }

  // Pretty mode - colored console output for development
  if (logMode === "pretty") {
    return {
      ...baseConfig,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    };
  }

  // Default console mode - structured JSON to stdout
  return baseConfig;
};

export const logger = pino(getLoggerConfig());

// Enhanced logger interface
export interface ChainBrawlerLogger {
  info(message: string, data?: Record<string, any>): void;
  warn(message: string, data?: Record<string, any>): void;
  error(message: string, data?: Record<string, any>): void;
  debug(message: string, data?: Record<string, any>): void;

  // Enhanced methods for tracking operations and events
  logOperation<T = any>(operation: string, data?: Record<string, any>): OperationLogger<T>;
  logEvent(event: string, data?: Record<string, any>): void;
  logTransaction(txHash: string, data?: Record<string, any>): void;

  // Throttled logging methods to reduce verbosity
  infoThrottled(
    key: string,
    message: string,
    data?: Record<string, any>,
    intervalMs?: number
  ): void;
  debugThrottled(
    key: string,
    message: string,
    data?: Record<string, any>,
    intervalMs?: number
  ): void;
}

export interface OperationLogger<T = any> {
  success(result?: T, data?: Record<string, any>): void;
  error(error: Error | string, data?: Record<string, any>): void;
  progress(message: string, data?: Record<string, any>): void;
}

// Throttling cache for logger instances
const throttleCache = new Map<string, Map<string, number>>();

export function createLogger(component?: string): ChainBrawlerLogger {
  const baseLogger = component ? logger.child({ component }) : logger;

  // Initialize throttle cache for this component
  const componentKey = component || "default";
  if (!throttleCache.has(componentKey)) {
    throttleCache.set(componentKey, new Map());
  }
  const componentThrottleCache = throttleCache.get(componentKey)!;

  return {
    info(message: string, data?: Record<string, any>) {
      baseLogger.info(data || {}, message);
    },

    warn(message: string, data?: Record<string, any>) {
      baseLogger.warn(data || {}, message);
    },

    error(message: string, data?: Record<string, any>) {
      baseLogger.error(data || {}, message);
    },

    debug(message: string, data?: Record<string, any>) {
      baseLogger.debug(data || {}, message);
    },

    logOperation<T = any>(operation: string, data?: Record<string, any>): OperationLogger<T> {
      const startTime = Date.now();
      const operationId = `${operation}-${startTime}-${Math.random().toString(36).substr(2, 9)}`;

      baseLogger.info({ operation, operationId, ...data }, `Starting operation: ${operation}`);

      return {
        success(result?: T, additionalData?: Record<string, any>) {
          const duration = Date.now() - startTime;
          baseLogger.info(
            {
              operation,
              operationId,
              duration,
              result,
              ...additionalData,
            },
            `Operation completed: ${operation} (${duration}ms)`
          );
        },

        error(error: Error | string, additionalData?: Record<string, any>) {
          const duration = Date.now() - startTime;
          const errorData =
            error instanceof Error
              ? { message: error.message, stack: error.stack }
              : { message: error };

          baseLogger.error(
            {
              operation,
              operationId,
              duration,
              error: errorData,
              ...additionalData,
            },
            `Operation failed: ${operation} (${duration}ms)`
          );
        },

        progress(message: string, additionalData?: Record<string, any>) {
          const duration = Date.now() - startTime;
          baseLogger.info(
            {
              operation,
              operationId,
              duration,
              progress: message,
              ...additionalData,
            },
            `Operation progress: ${operation} - ${message}`
          );
        },
      };
    },

    logEvent(event: string, data?: Record<string, any>) {
      baseLogger.info({ event, ...data }, `Event: ${event}`);
    },

    logTransaction(txHash: string, data?: Record<string, any>) {
      baseLogger.info({ transaction: txHash, ...data }, `Transaction: ${txHash}`);
    },

    // Throttled logging methods
    infoThrottled(
      key: string,
      message: string,
      data?: Record<string, any>,
      intervalMs: number = 5000
    ) {
      const now = Date.now();
      const lastLog = componentThrottleCache.get(`info:${key}`) || 0;

      if (now - lastLog >= intervalMs) {
        componentThrottleCache.set(`info:${key}`, now);
        baseLogger.info(
          {
            throttled: true,
            throttleKey: key,
            intervalMs,
            ...data,
          },
          message
        );
      }
    },

    debugThrottled(
      key: string,
      message: string,
      data?: Record<string, any>,
      intervalMs: number = 10000
    ) {
      const now = Date.now();
      const lastLog = componentThrottleCache.get(`debug:${key}`) || 0;

      if (now - lastLog >= intervalMs) {
        componentThrottleCache.set(`debug:${key}`, now);
        baseLogger.debug(
          {
            throttled: true,
            throttleKey: key,
            intervalMs,
            ...data,
          },
          message
        );
      }
    },
  };
}

export default logger;
