import { calculateDiscount } from './discount.utils';

describe('calculateDiscount', () => {
  it('returns 0 when there are no purchases', () => {
    expect(calculateDiscount(0)).toBe(0);
  });

  it('returns 25 for 1-3 унікальних днів покупок', () => {
    expect(calculateDiscount(1)).toBe(25);
    expect(calculateDiscount(3)).toBe(25);
  });

  it('returns 30 for 4-7 унікальних днів', () => {
    expect(calculateDiscount(4)).toBe(30);
    expect(calculateDiscount(7)).toBe(30);
  });

  it('returns 35 for 8 і більше', () => {
    expect(calculateDiscount(8)).toBe(35);
    expect(calculateDiscount(12)).toBe(35);
  });
});
