export const DISCOUNT_RULES = [
  { minChecks: 8, percent: 35 },
  { minChecks: 4, percent: 30 },
  { minChecks: 1, percent: 25 },
] as const;

export function calculateDiscount(uniquePurchaseDays: number) {
  for (const rule of DISCOUNT_RULES) {
    if (uniquePurchaseDays >= rule.minChecks) {
      return rule.percent;
    }
  }

  return 0;
}
