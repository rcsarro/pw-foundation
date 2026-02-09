import { FrameworkConfig } from '../types/config.types';

/**
 * Gets environment-specific configuration based on TEST_ENV variable.
 * This is for framework-level env detection, but consumers can override via config.environments.
 * @returns Partial configuration for the current environment
 */
export function getEnvironment(): Partial<FrameworkConfig> {
  // For now, return empty; consumers provide environments in config
  return {};
}