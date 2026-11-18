export type { Ok, Err, Result } from './result';
export { ok, err, isOk, isErr, mapResult, flatMapResult } from './result';
export type { Clock, IdGenerator } from './ports';
export { CLOCK_PORT, ID_GENERATOR_PORT } from './ports';
export { SystemClock, SystemIdGenerator } from './system-ports';
