import type { Faker } from '@faker-js/faker';

/**
 * DataFactory provides deterministic test data generation using faker.js.
 * Seed can be set via DATA_SEED environment variable for reproducible CI runs.
 */
export class DataFactory {
  private faker: Faker;

  private constructor(faker: Faker) {
    this.faker = faker;
    const seed = process.env.DATA_SEED ? parseInt(process.env.DATA_SEED, 10) : Date.now();
    this.faker.seed(seed);
    console.log(`DataFactory seeded with: ${seed}`);
  }

  /**
   * Creates a new DataFactory instance with faker dynamically imported.
   * This method handles ES module compatibility issues.
   */
  static async create(): Promise<DataFactory> {
    const { faker } = await import('@faker-js/faker');
    return new DataFactory(faker);
  }

  /**
   * Generates a random user object.
   * @returns Object with firstName, lastName, email, password
   */
  randomUser(): { firstName: string; lastName: string; email: string; password: string } {
    const firstName = this.faker.person.firstName();
    const lastName = this.faker.person.lastName();
    const email = this.faker.internet.email({ firstName, lastName });
    const password = this.faker.internet.password();

    return { firstName, lastName, email, password };
  }

  /**
   * Generates a random email address.
   * @param domain Optional domain for the email
   * @returns Random email string
   */
  randomEmail(domain?: string): string {
    return this.faker.internet.email({ provider: domain });
  }

  /**
   * Generates a random alphanumeric string of specified length.
   * @param length Length of the string
   * @returns Random string
   */
  randomString(length: number): string {
    return this.faker.string.alphanumeric(length);
  }

  /**
   * Generates a random integer within the specified range.
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @returns Random number
   */
  randomNumber(min: number, max: number): number {
    return this.faker.number.int({ min, max });
  }
}