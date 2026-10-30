export function parseMoney(input: string | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  const n = Number(input);
  return Number.isFinite(n) ? n : null;
}

export function formatMoney(amount: number, currency: string): string {
  const rounded = Math.round(amount * 100) / 100;
  const symbol = currency === 'THB' ? '฿' : currency === 'INR' ? '₹' : 'रू';
  return `${symbol}${rounded.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}