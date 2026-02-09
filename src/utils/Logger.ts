import { TestInfo } from '@playwright/test';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

/**
 * Logger provides structured JSON logging with automatic attachment to Playwright test results.
 */
export class Logger {
  private static testInfo?: TestInfo;
  private static logs: LogEntry[] = [];
  private static logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

  /**
   * Sets the Playwright TestInfo for manual flushing of logs.
   * Call flush() at the end of the test to attach logs.
   * @param testInfo The test info instance
   */
  static setTestInfo(testInfo: TestInfo): void {
    Logger.testInfo = testInfo;
  }

  /**
   * Logs a debug message.
   * @param message Log message
   * @param context Additional context
   */
  static debug(message: string, context?: Record<string, unknown>): void {
    Logger.log('debug', message, context);
  }

  /**
   * Logs an info message.
   * @param message Log message
   * @param context Additional context
   */
  static info(message: string, context?: Record<string, unknown>): void {
    Logger.log('info', message, context);
  }

  /**
   * Logs a warning message.
   * @param message Log message
   * @param context Additional context
   */
  static warn(message: string, context?: Record<string, unknown>): void {
    Logger.log('warn', message, context);
  }

  /**
   * Logs an error message.
   * @param message Log message
   * @param context Additional context
   */
  static error(message: string, context?: Record<string, unknown>): void {
    Logger.log('error', message, context);
  }

  private static log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (Logger.shouldLog(level)) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        context
      };

      Logger.logs.push(entry);
    }
  }

  private static shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(Logger.logLevel);
  }

  /**
   * Gets all buffered logs (for testing).
   * @returns Array of log entries
   */
  static getLogs(): LogEntry[] {
    return [...Logger.logs];
  }

  /**
   * Clears all logs (for testing).
   */
  static clearLogs(): void {
    Logger.logs = [];
  }
}