/** Successful result variant containing a value. */
export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

/** Error result variant containing an error. */
export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

/** Union type representing either success with T or failure with E. */
export type Result<T, E> = Ok<T> | Err<E>;

/** Creates a successful Result wrapping a value. */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/** Creates a failed Result wrapping an error. */
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

/** Type guard verifying if a Result is Ok. */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

/** Type guard verifying if a Result is Err. */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

/** Maps a transformation function over an Ok value while preserving Err. */
export function mapResult<T, E, U>(
  result: Result<T, E>,
  fn: (val: T) => U
): Result<U, E> {
  if (result.ok) {
    return ok(fn(result.value));
  }
  return result;
}

/** Chains a Result-producing computation on an Ok value. */
export function flatMapResult<T, E, U>(
  result: Result<T, E>,
  fn: (val: T) => Result<U, E>
): Result<U, E> {
  if (result.ok) {
    return fn(result.value);
  }
  return result;
}
