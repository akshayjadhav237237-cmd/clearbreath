/**
 * Domain integer unit helpers and rounding primitives.
 * Enforces zero floating-point leakage across domain layer boundaries.
 */

/** Converts any floating-point number to a bounded integer. */
export function toInteger(value: number): number {
  return Math.round(value);
}

/** Clamps an integer between an inclusive minimum and maximum bound. */
export function clampInteger(value: number, min: number, max: number): number {
  const rounded = Math.round(value);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
}

/** Converts a fractional ratio (0.0 to 1.0) to integer basis points (0 to 10000). */
export function ratioToBasisPoints(ratio: number): number {
  return clampInteger(Math.round(ratio * 10000), 0, 10000);
}

/** Converts basis points to an integer percentage rounded to nearest whole unit. */
export function basisPointsToWholePercent(basisPoints: number): number {
  return clampInteger(Math.round(basisPoints / 100), 0, 100);
}

/** Calculates the relative difference in basis points between baseline and reduced values. */
export function calculateReductionBasisPoints(
  baseline: number,
  reduced: number
): number {
  if (baseline <= 0) return 0;
  const delta = baseline - reduced;
  const ratio = delta / baseline;
  return ratioToBasisPoints(ratio);
}
