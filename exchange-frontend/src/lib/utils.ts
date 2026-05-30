export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatNumber(value: string | number, digits = 2) {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);
}

export function formatCompact(value: string | number) {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(num);
}

export function shortMarketName(market: string) {
  return market.replace("_", "/");
}