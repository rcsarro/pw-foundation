// Import faker using require to handle ES module compatibility
const { faker } = require('@faker-js/faker'); // eslint-disable-line @typescript-eslint/no-var-requires

/**
 * DataFactory provides deterministic test data generation using faker.js.
 * Seed can be set via DATA_SEED environment variable for reproducible CI runs.
 */
export class DataFactory {
  constructor() {
    const seed = process.env.DATA_SEED ? parseInt(process.env.DATA_SEED, 10) : Date.now();
    faker.seed(seed);
    console.log(`DataFactory seeded with: ${seed}`);
  }

  /**
   * Generates a random user object.
   * @returns Object with firstName, lastName, email, password
   */
  randomUser(): { firstName: string; lastName: string; email: string; password: string } {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const password = faker.internet.password();

    return { firstName, lastName, email, password };
  }

  /**
   * Generates a random email address.
   * @param domain Optional domain for the email
   * @returns Random email string
   */
  randomEmail(domain?: string): string {
    return faker.internet.email({ provider: domain });
  }

  /**
   * Generates a random alphanumeric string of specified length.
   * @param length Length of the string
   * @returns Random string
   */
  randomString(length: number): string {
    return faker.string.alphanumeric(length);
  }

  /**
   * Generates a random integer within the specified range.
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @returns Random number
   */
  randomNumber(min: number, max: number): number {
    return faker.number.int({ min, max });
  }
}

export const dataFactory = new DataFactory();