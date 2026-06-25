import { STROOPS_PER_XLM } from './config';

export function formatXLM(stroops: bigint, decimals = 2): string {
  const xlm = Number(stroops) / STROOPS_PER_XLM;
  return xlm.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * STROOPS_PER_XLM));
}

export function stroopsToXLM(stroops: bigint): number {
  return Number(stroops) / STROOPS_PER_XLM;
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatTimestamp(ts: number): string {
  if (!ts) return '-';
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(ts: number): string {
  const now = Date.now() / 1000;
  const diff = now - ts;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return formatTimestamp(ts);
}

export function formatMWh(mwh: number): string {
  if (mwh >= 1_000_000) return `${(mwh / 1_000_000).toFixed(1)}TWh`;
  if (mwh >= 1_000) return `${(mwh / 1_000).toFixed(1)}GWh`;
  return `${mwh.toFixed(0)} MWh`;
}

export function getExplorerTxUrl(hash: string, network = 'testnet'): string {
  return `https://stellar.expert/explorer/${network}/tx/${hash}`;
}

export function getExplorerAccountUrl(address: string, network = 'testnet'): string {
  return `https://stellar.expert/explorer/${network}/account/${address}`;
}

export function getExplorerContractUrl(contractId: string, network = 'testnet'): string {
  return `https://stellar.expert/explorer/${network}/contract/${contractId}`;
}

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function calculatePlatformFee(priceStroops: bigint, feeBps: number): bigint {
  return (priceStroops * BigInt(feeBps)) / BigInt(10_000);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address) || /^C[A-Z2-7]{55}$/.test(address);
}
