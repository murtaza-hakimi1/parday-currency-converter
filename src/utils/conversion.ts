export function convertAmount(amount: number, rate: number): number {
  if (!Number.isFinite(amount) || amount < 0)
    throw new Error("Amount must be a non-negative number");
  if (!Number.isFinite(rate) || rate <= 0)
    throw new Error("Exchange rate must be positive");
  return amount * rate;
}

export function invertRate(rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0)
    throw new Error("Exchange rate must be positive");
  return 1 / rate;
}

export function parseAmount(value: string): number | null {
  if (value.trim() === "") return null;
  if (!/^\d+(\.\d*)?$/.test(value.trim())) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

export function formatCurrency(
  amount: number,
  currency: string,
  locale = "en-US",
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(amount)} ${currency}`;
  }
}

export function formatNumber(
  amount: number,
  maximumFractionDigits = 4,
): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(
    amount,
  );
}
