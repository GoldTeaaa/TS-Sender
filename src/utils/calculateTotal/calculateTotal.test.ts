import { describe, it, expect } from 'vitest';
import { calculateTotal } from './calculateTotal';

describe('calculateTotal', () => {
  it('returns 0 for empty string', () => {
    expect(calculateTotal("")).toBe(0);
  });

  it('calculates total from newline-separated values', () => {
    expect(calculateTotal("100\n200\n300")).toBe(600);
  });

  it('calculates total from comma-separated values', () => {
    expect(calculateTotal("100,200,300")).toBe(600);
  });

  it('calculates total from mixed commas and newlines', () => {
    expect(calculateTotal("100,200\n300")).toBe(600);
  });

  it('ignores whitespace and empty lines', () => {
    expect(calculateTotal(" 100 , \n 200 \n ,300 ")).toBe(600);
  });

  it('ignores invalid numbers (NaN)', () => {
    expect(calculateTotal("100,abc,200")).toBe(300);
  });

  it('returns 0 for null or undefined input', () => {
    expect(calculateTotal(null as unknown as string)).toBe(0);
    expect(calculateTotal(undefined as unknown as string)).toBe(0);
  });

  it('handles single number input', () => {
    expect(calculateTotal("500")).toBe(500);
  });
});
