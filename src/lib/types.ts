// Core REC types matching Soroban contract types

export type RECEnergySource = 'Solar' | 'Wind' | 'Hydro' | 'Biomass' | 'Geothermal' | 'Ocean';

export type RECStatus = 'Pending' | 'Active' | 'Listed' | 'Retired' | 'Rejected';

export interface RECToken {
  id: number;
  issuer: string;
  owner: string;
  energySource: RECEnergySource;
  mwhAmount: number;
  location: string;
  certificationBody: string;
  vintageYear: number;
  metadataUri: string;
  status: RECStatus;
  issuedAt: number;
  updatedAt: number;
  price: bigint | null;
  retiredAt: number | null;
  retireBeneficiary: string | null;
}

export interface Trade {
  recId: number;
  seller: string;
  buyer: string;
  price: bigint;
  fee: bigint;
  timestamp: number;
}

export interface Producer {
  address: string;
  name: string;
  location: string;
  energyTypes: string[];
  capacityKw: number;
  certificationId: string;
  status: 'Pending' | 'Active' | 'Suspended';
  registeredAt: number;
  totalMwhIssued: number;
  totalMwhRetired: number;
}

export interface MarketStats {
  totalProducers: number;
  totalMwhIssued: number;
  totalMwhRetired: number;
  totalTransactions: number;
  totalVolumeStroops: bigint;
}

export interface TransactionRecord {
  id: string;
  type: 'issue' | 'approve' | 'list' | 'delist' | 'purchase' | 'retire' | 'transfer';
  status: 'pending' | 'processing' | 'confirmed' | 'failed';
  hash: string | null;
  timestamp: number;
  recId?: number;
  amount?: bigint;
  from?: string;
  to?: string;
  error?: string;
  explorerUrl?: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  network: string;
  balance: bigint | null;
}

export type Role = 'Validator' | 'Producer' | 'Operator';

export interface ContractEvent {
  id: string;
  type: string;
  recId?: number;
  timestamp: number;
  data: Record<string, unknown>;
  ledger: number;
  txHash: string;
}

export interface FilterParams {
  energySource?: RECEnergySource | 'all';
  status?: RECStatus | 'all';
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  vintageYear?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'oldest' | 'mwh-asc' | 'mwh-desc';
}
