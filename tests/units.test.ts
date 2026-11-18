import { describe, it, expect } from 'vitest';
import {
  toInteger,
  clampInteger,
  ratioToBasisPoints,
  basisPointsToWholePercent,
  calculateReductionBasisPoints,
} from '../src/domain';

describe('Domain unit rounding and basis points helpers', () => {
  it('converts floats to nearest integers', () => {
    expect(toInteger(45.4)).toBe(45);
    expect(toInteger(45.6)).toBe(46);
    expect(toInteger(-12.7)).toBe(-13);
  });

  it('clamps integers within bounds', () => {
    expect(clampInteger(50, 0, 100)).toBe(50);
    expect(clampInteger(-10, 0, 100)).toBe(0);
    expect(clampInteger(150, 0, 100)).toBe(100);
  });

  it('converts fractions to basis points', () => {
    expect(ratioToBasisPoints(0.25)).toBe(2500);
    expect(ratioToBasisPoints(1.0)).toBe(10000);
    expect(ratioToBasisPoints(0)).toBe(0);
  });

  it('converts basis points to whole percent', () => {
    expect(basisPointsToWholePercent(2500)).toBe(25);
    expect(basisPointsToWholePercent(9960)).toBe(100);
    expect(basisPointsToWholePercent(40)).toBe(0);
  });

  it('calculates reduction basis points', () => {
    expect(calculateReductionBasisPoints(100, 60)).toBe(4000);
    expect(calculateReductionBasisPoints(0, 10)).toBe(0);
    expect(calculateReductionBasisPoints(100, 0)).toBe(10000);
  });
});
