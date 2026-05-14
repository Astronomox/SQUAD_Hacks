// Currency, date, ID formatters used across the app.

const nairaFmt = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFmt = new Intl.NumberFormat('en-NG');

/** Format a Naira amount: 185000 → "₦185,000" */
export function formatNaira(amount) {
  if (amount == null) return '—';
  return nairaFmt.format(Number(amount));
}

/** Short Naira: 4_200_000 → "₦4.2M" */
export function formatNairaShort(amount) {
  if (amount == null) return '—';
  const n = Number(amount);
  if (Math.abs(n) >= 1e9) return '₦' + (n / 1e9).toFixed(1) + 'B';
  if (Math.abs(n) >= 1e6) return '₦' + (n / 1e6).toFixed(1) + 'M';
  if (Math.abs(n) >= 1e3) return '₦' + (n / 1e3).toFixed(0) + 'k';
  return '₦' + n;
}

/** Plain number with thousand separators */
export function formatNumber(n) {
  if (n == null) return '—';
  return numberFmt.format(Number(n));
}

/** "May 13, 2025" */
export function formatDate(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** "May 13, 2025 09:14 AM" */
export function formatDateTime(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** ISO-ish "2025-05-13 09:14:22" */
export function formatTimestamp(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** "2m ago" */
export function relativeTime(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 30)       return 'just now';
  if (diff < 60)       return `${Math.floor(diff)}s ago`;
  if (diff < 3600)     return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)    return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)   return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(d);
}

/** "EMP-00001" */
export function formatEmployeeId(num) {
  return 'EMP-' + String(num).padStart(5, '0');
}

/** "BATCH-2024-Q1" etc — passthrough but trims */
export function formatBatchId(id) { return id || '—'; }

/** Initials e.g. "Adaeze Okonkwo" → "AO" */
export function initials(name) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');
}

/** Mask a bank account: "0123456789" → "•••• 6789" */
export function maskAccount(acct) {
  if (!acct) return '—';
  const s = String(acct);
  return '•••• ' + s.slice(-4);
}

/** Days between now and a date */
export function daysSince(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}
