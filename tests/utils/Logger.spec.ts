import { test, expect } from '@playwright/test';
import { Logger } from '../../src/utils/Logger';

test.describe('Logger', () => {
  test.afterEach(() => {
    Logger.clearLogs();
  });

  test('logs at different levels', () => {
    Logger.debug('Debug message');
    Logger.info('Info message');
    Logger.warn('Warn message');
    Logger.error('Error message');

    const logs = Logger.getLogs();
    expect(logs).toHaveLength(3); // debug not logged at info level
    expect(logs[0].level).toBe('info');
    expect(logs[0].message).toBe('Info message');
    expect(logs[1].level).toBe('warn');
    expect(logs[2].level).toBe('error');
  });

  test('includes context in logs', () => {
    Logger.info('Message with context', { userId: 123, action: 'login' });

    const logs = Logger.getLogs();
    expect(logs[0].context).toEqual({ userId: 123, action: 'login' });
  });

  test('respects log level', () => {
    // Set log level to warn
    process.env.LOG_LEVEL = 'warn';
    // Re-import to get new instance
    delete require.cache[require.resolve('../../src/utils/Logger')];
    const { Logger: LoggerWarn } = require('../../src/utils/Logger');

    LoggerWarn.debug('Debug - should not log');
    LoggerWarn.info('Info - should not log');
    LoggerWarn.warn('Warn - should log');
    LoggerWarn.error('Error - should log');

    const logs = LoggerWarn.getLogs();
    expect(logs).toHaveLength(2);
    expect(logs[0].level).toBe('warn');
    expect(logs[1].level).toBe('error');

    // Clean up
    delete process.env.LOG_LEVEL;
  });

  test('log entry structure', () => {
    Logger.info('Test message');

    const logs = Logger.getLogs();
    const log = logs[0];

    expect(log).toHaveProperty('timestamp');
    expect(log).toHaveProperty('level', 'info');
    expect(log).toHaveProperty('message', 'Test message');
    expect(new Date(log.timestamp)).toBeInstanceOf(Date);
  });
});