import { describe, it, expect } from 'vitest';
import { isGoal } from './goal';

describe('isGoal', () => {
  const W = 40, GW = 10, R = 0.9;
  it('no goal when outside gate z', () => {
    expect(isGoal(21, 6, R, W, GW)).toBe(0);
  });
  it('goal right when ball surface crosses +W/2', () => {
    expect(isGoal(20.2, 0, R, W, GW)).toBe(1);
  });
  it('goal left when ball surface crosses -W/2', () => {
    expect(isGoal(-20.2, 0, R, W, GW)).toBe(2);
  });
});

