import { describe, it, expect } from 'vitest';
import { alpha } from '../MyAlpha';

describe('alpha (color opacity utility)', () => {
  it('converts hex + opacity to rgba string', () => {
    const result = alpha('#007AFF', 0.15);
    expect(result).toContain('rgba');
    expect(result).toMatch(/rgba?\([^)]+\)/);
  });

  it('handles 0 opacity', () => {
    const result = alpha('#007AFF', 0);
    expect(result).toContain('rgba');
  });

  it('handles 1 opacity', () => {
    const result = alpha('#FF3B30', 1);
    expect(result).toMatch(/rgba?\(\s*\d+,\s*\d+,\s*\d+,\s*1(?:\.0+)?\s*\)/);
  });
});
