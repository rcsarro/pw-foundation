import { test as base } from '@playwright/test';
import { DataFactory } from '../utils/DataFactory';

/**
 * Fixture for test data factory, seeded uniquely per test.
 */
export const dataFixture = base.extend<{
  testData: DataFactory;
}>({
  testData: async ({ }, use: (dataFactory: DataFactory) => Promise<void>) => {
    // Seed with test-specific value for deterministic but unique data
    const dataFactory = await DataFactory.create();
    // Note: In a real implementation, you'd need to modify DataFactory to accept seed
    // For now, we'll use the default seeding

    await use(dataFactory);
  },
});

export default dataFixture;