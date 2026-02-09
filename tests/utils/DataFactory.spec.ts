import { test, expect } from '@playwright/test';
import { dataFactory } from '../../src/utils/DataFactory';

test.describe('DataFactory', () => {
  test('randomUser generates valid user object', () => {
    const user = dataFactory.randomUser();

    expect(user).toHaveProperty('firstName');
    expect(user).toHaveProperty('lastName');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('password');
    expect(typeof user.firstName).toBe('string');
    expect(typeof user.lastName).toBe('string');
    expect(typeof user.email).toBe('string');
    expect(typeof user.password).toBe('string');
    expect(user.email).toContain('@');
  });

  test('randomEmail generates valid email', () => {
    const email = dataFactory.randomEmail();
    expect(typeof email).toBe('string');
    expect(email).toContain('@');
  });

  test('randomEmail with domain', () => {
    const email = dataFactory.randomEmail('example.com');
    expect(email).toContain('@example.com');
  });

  test('randomString generates string of correct length', () => {
    const str = dataFactory.randomString(10);
    expect(typeof str).toBe('string');
    expect(str.length).toBe(10);
  });

  test('randomNumber generates number in range', () => {
    const num = dataFactory.randomNumber(5, 15);
    expect(typeof num).toBe('number');
    expect(num).toBeGreaterThanOrEqual(5);
    expect(num).toBeLessThanOrEqual(15);
  });

  test('deterministic generation with seed', () => {
    // Set seed via environment
    process.env.DATA_SEED = '12345';

    // Re-import to get new instance with seed
    delete require.cache[require.resolve('../../src/utils/DataFactory')];
    const { dataFactory: seededFactory } = require('../../src/utils/DataFactory');

    const user1 = seededFactory.randomUser();
    const email1 = seededFactory.randomEmail();
    const str1 = seededFactory.randomString(5);
    const num1 = seededFactory.randomNumber(1, 100);

    // Reset and get same results
    delete require.cache[require.resolve('../../src/utils/DataFactory')];
    const { dataFactory: seededFactory2 } = require('../../src/utils/DataFactory');

    const user2 = seededFactory2.randomUser();
    const email2 = seededFactory2.randomEmail();
    const str2 = seededFactory2.randomString(5);
    const num2 = seededFactory2.randomNumber(1, 100);

    expect(user1).toEqual(user2);
    expect(email1).toEqual(email2);
    expect(str1).toEqual(str2);
    expect(num1).toEqual(num2);

    // Clean up
    delete process.env.DATA_SEED;
  });
});