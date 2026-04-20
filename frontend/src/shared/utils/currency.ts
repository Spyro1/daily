export interface CurrencyFormatOptions {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

function normalizeCurrencyCode(currencyCode: string | undefined): string {
  if (!currencyCode) return 'USD'
  const normalized = currencyCode.toUpperCase()
  return normalized.length === 3 ? normalized : 'USD'
}

export function formatCurrency(
  amount: number,
  currencyCode: string | undefined,
  options: CurrencyFormatOptions = {},
): string {
  const currency = normalizeCurrencyCode(currencyCode)
  const hasMin = options.minimumFractionDigits != null
  const hasMax = options.maximumFractionDigits != null
  const minimumFractionDigits = hasMin ? options.minimumFractionDigits! : 2
  const maximumFractionDigits = hasMax
    ? Math.max(options.maximumFractionDigits!, minimumFractionDigits)
    : Math.max(2, minimumFractionDigits)

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}

export function formatCurrencyCompact(
  amount: number,
  currencyCode: string | undefined,
): string {
  const currency = normalizeCurrencyCode(currencyCode)
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}
