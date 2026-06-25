// Contract addresses and network configuration
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'testnet';
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org';
export const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';
export const MARKETPLACE_CONTRACT_ID = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID || '';
export const REGISTRY_CONTRACT_ID = process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ID || '';
export const NATIVE_ASSET_ID = process.env.NEXT_PUBLIC_NATIVE_ASSET_ID || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCN4';
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://stellar.expert/explorer/testnet';
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'REC Marketplace';

// Network passphrase
export const NETWORK_PASSPHRASE =
  NETWORK === 'mainnet'
    ? 'Public Global Stellar Network ; September 2015'
    : 'Test SDF Network ; September 2015';

// Platform constants
export const PLATFORM_FEE_BPS = 250; // 2.5%
export const STROOPS_PER_XLM = 10_000_000;
export const BASE_FEE = 100_000; // 0.01 XLM in stroops

// REC energy source labels
export const ENERGY_SOURCE_LABELS: Record<string, string> = {
  Solar: 'Solar',
  Wind: 'Wind',
  Hydro: 'Hydroelectric',
  Biomass: 'Biomass',
  Geothermal: 'Geothermal',
  Ocean: 'Ocean/Tidal',
};

export const ENERGY_SOURCE_COLORS: Record<string, string> = {
  Solar: '#F59E0B',
  Wind: '#3B82F6',
  Hydro: '#06B6D4',
  Biomass: '#10B981',
  Geothermal: '#EF4444',
  Ocean: '#8B5CF6',
};

export const ENERGY_SOURCE_ICONS: Record<string, string> = {
  Solar: '☀️',
  Wind: '🌬️',
  Hydro: '💧',
  Biomass: '🌿',
  Geothermal: '🌋',
  Ocean: '🌊',
};
