// Ad accounts don't all bill in the same currency the UI used to assume
// ($ everywhere). This formats an amount using the ad platform's real
// currency code (e.g. "KES", "GBP") pulled from Settings > Integrations,
// falling back to USD only when a platform isn't connected yet and we
// genuinely have no currency to go on.
export function formatMoney(amount: number | string | null | undefined, currencyCode?: string | null): string {
  if (amount === null || amount === undefined || amount === '') return '—';
  const value = Number(amount);
  if (Number.isNaN(value)) return '—';

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode || 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Intl throws on an unrecognized/malformed currency code — fall back
    // to a plain number rather than crashing the page over a display detail.
    return value.toLocaleString();
  }
}

// For inline field labels like "Daily Budget (KES)" where a full formatted
// amount isn't wanted yet, just the code the user should know they're
// typing in.
export function currencyLabel(currencyCode?: string | null): string {
  return currencyCode || 'USD';
}
