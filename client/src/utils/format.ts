let _currency = 'GNF'

export function setCurrency(c: string) {
  _currency = c
}

export function getCurrency(): string {
  return _currency
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return `0 ${_currency}`
  return amount.toLocaleString('fr-FR') + ` ${_currency}`
}

export function formatDate(date: string): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(new Date(date))
}

export function formatDateTime(date: string): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date))
}

export function formatDecimal(value: number | null | undefined, maxDecimals = 6): string {
  if (value == null) return '0'
  return value.toFixed(maxDecimals).replace(/\.?0+$/, '')
}

export function formatSurface(surface: number | null | undefined): string {
  if (surface == null) return '0 m²'
  return `${formatDecimal(surface, 6)} m²`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}
