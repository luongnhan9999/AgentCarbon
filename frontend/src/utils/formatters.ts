export function formatAddress(addr: string): string {
  if (!addr) return '';
  if (addr === '0x0000000000000000000000000000000000000000') return 'Unassigned';
  if (addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatGen(weiStr: string | bigint | number): string {
  try {
    const val = BigInt(weiStr || 0);
    const whole = val / 10n ** 18n;
    const rem = val % 10n ** 18n;
    const decimals = (rem / 10n ** 14n).toString().padStart(4, '0');
    return `${whole}.${decimals} GEN`;
  } catch {
    return '0.0000 GEN';
  }
}

export function getStatusDetails(status: number): { label: string; color: string; bg: string; border: string } {
  switch (status) {
    case 0:
      return {
        label: 'OFFER OPEN',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200'
      };
    case 1:
      return {
        label: 'ACTIVE MONITORING',
        color: 'text-sky-700',
        bg: 'bg-sky-50',
        border: 'border-sky-200'
      };
    case 2:
      return {
        label: 'AWAITING PAYOUT (COOLING-OFF)',
        color: 'text-amber-800',
        bg: 'bg-amber-100',
        border: 'border-amber-300'
      };
    case 3:
      return {
        label: 'OFFSET VERIFIED (100% PAID)',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200'
      };
    case 4:
      return {
        label: 'OFFSET DEFICIT (100% REFUNDED)',
        color: 'text-rose-700',
        bg: 'bg-rose-50',
        border: 'border-rose-200'
      };
    case 5:
      return {
        label: 'OFFSET PARTIAL (60/40 SPLIT)',
        color: 'text-purple-700',
        bg: 'bg-purple-50',
        border: 'border-purple-200'
      };
    case 6:
      return {
        label: 'IN DISPUTE (APPEAL)',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300'
      };
    case 7:
      return {
        label: 'CANCELLED & RECLAIMED',
        color: 'text-slate-600',
        bg: 'bg-slate-100',
        border: 'border-slate-200'
      };
    default:
      return {
        label: 'UNKNOWN',
        color: 'text-slate-500',
        bg: 'bg-slate-50',
        border: 'border-slate-200'
      };
  }
}
