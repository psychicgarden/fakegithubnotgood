export const SCALE = 1_000_000n;        // USDC-6
export const toBase = (x: number) => BigInt(Math.round(x * 1_000_000));
export const fromBase = (b: bigint) => Number(b) / 1_000_000;

export const fmtUSD = (b: bigint) =>
  fromBase(b).toLocaleString(undefined, { style: 'currency', currency: 'USD' });

// Helper for percentage calculations
export const toBasisPoints = (percentage: number) => Math.round(percentage * 100);
export const fromBasisPoints = (bps: number) => bps / 100;

// Validation helpers
export const validateDownPayment = (downPaymentBase: bigint, purchasePriceBase: bigint) => {
  const minDownBps = 2000n; // 20%
  return downPaymentBase * 10000n >= purchasePriceBase * minDownBps;
};

// Monthly payment calculation
export const calculateMonthlyPayment = (
  principal: bigint,
  aprBps: number,
  termMonths: number
): bigint => {
  const monthlyRate = (aprBps / 100) / 12 / 100;
  const numerator = principal * BigInt(Math.round(monthlyRate * 1e6));
  const denominator = BigInt(Math.round((1 - Math.pow(1 + monthlyRate, -termMonths)) * 1e6));
  return numerator / denominator;
}; 