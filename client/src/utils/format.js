let _currency = 'GNF';
export function setCurrency(c) {
    _currency = c;
}
export function getCurrency() {
    return _currency;
}
export function formatCurrency(amount) {
    if (amount == null)
        return `0 ${_currency}`;
    return amount.toLocaleString('fr-FR') + ` ${_currency}`;
}
export function formatDate(date) {
    if (!date)
        return '';
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(new Date(date));
}
export function formatDateTime(date) {
    if (!date)
        return '';
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date));
}
export function formatDecimal(value, maxDecimals = 6) {
    if (value == null)
        return '0';
    return value.toFixed(maxDecimals).replace(/\.?0+$/, '');
}
export function formatSurface(surface) {
    if (surface == null)
        return '0 m²';
    return `${formatDecimal(surface, 6)} m²`;
}
export function formatFileSize(bytes) {
    if (bytes < 1024)
        return `${bytes} o`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
