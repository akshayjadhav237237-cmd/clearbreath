/** Clock port token. */
export const CLOCK_PORT = 'clock';

/** Id generator port token. */
export const ID_GENERATOR_PORT = 'id-generator';

/** System clock interface. */
export interface Clock {
  /** Returns the current timestamp in milliseconds. */
  now(): number;
}

/** Unique identifier generator interface. */
export interface IdGenerator {
  /** Generates a new unique identifier string. */
  next(): string;
}
