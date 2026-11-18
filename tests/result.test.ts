import { describe, it, expect } from 'vitest';
import {
  ok,
  err,
  isOk,
  isErr,
  mapResult,
  flatMapResult,
  type Result,
  type Ok,
  type Err,
} from '../src/shared';

describe('Result creation and predicates', () => {
  it('creates ok result with value', () => {
    const res: Ok<number> = ok(42);
    expect(res.ok).toBe(true);
    expect(res.value).toBe(42);
    expect(isOk(res)).toBe(true);
    expect(isErr(res)).toBe(false);
  });

  it('creates err result with error', () => {
    const res: Err<Error> = err(new Error('failure'));
    expect(res.ok).toBe(false);
    expect(res.error.message).toBe('failure');
    expect(isOk(res)).toBe(false);
    expect(isErr(res)).toBe(true);
  });
});

describe('Result transformations', () => {
  it('maps an ok result value', () => {
    const initial = ok(10);
    const mapped = mapResult(initial, (n) => n * 2);
    expect(isOk(mapped)).toBe(true);
    if (isOk(mapped)) {
      expect(mapped.value).toBe(20);
    }
  });

  it('leaves an err result unchanged when mapping', () => {
    const initial: Result<number, string> = err('failed');
    const mapped = mapResult(initial, (n: number) => n * 2);
    expect(isErr(mapped)).toBe(true);
    if (isErr(mapped)) {
      expect(mapped.error).toBe('failed');
    }
  });

  it('flat-maps an ok result returning ok', () => {
    const initial = ok('hello');
    const mapped = flatMapResult(initial, (val) => ok(val.length));
    expect(isOk(mapped)).toBe(true);
    if (isOk(mapped)) {
      expect(mapped.value).toBe(5);
    }
  });

  it('flat-maps an ok result returning err', () => {
    const initial = ok(0);
    const mapped = flatMapResult(initial, (n) =>
      n === 0 ? err('division by zero') : ok(100 / n)
    );
    expect(isErr(mapped)).toBe(true);
    if (isErr(mapped)) {
      expect(mapped.error).toBe('division by zero');
    }
  });

  it('passes through err result when flat-mapping', () => {
    const initial: Result<number, string> = err('early error');
    const mapped = flatMapResult(initial, (n: number) => ok(n * 2));
    expect(isErr(mapped)).toBe(true);
    if (isErr(mapped)) {
      expect(mapped.error).toBe('early error');
    }
  });
});
