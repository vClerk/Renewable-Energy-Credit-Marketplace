'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { RECCard } from '@/components/rec/RECCard';
import { FilterBar } from '@/components/marketplace/FilterBar';
import { useListings } from '@/hooks/useREC';
import { useWalletStore } from '@/store';
import type { FilterParams } from '@/lib/types';
import { ShoppingBag, Search, Loader2 } from 'lucide-react';

export default function MarketplacePage() {
  const { isConnected } = useWalletStore();
  const [filters, setFilters] = useState<FilterParams>({
    energySource: 'all',
    sortBy: 'newest',
  });

  const { data: listings, isLoading, error } = useListings(filters);

  return (
    <AppShell>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <ShoppingBag size={24} color="#10b981" />
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e2f4ee' }}>
              REC Marketplace
            </h1>
          </div>
          <p style={{ color: '#7fb3a0', fontSize: 15 }}>
            Browse and purchase verified Renewable Energy Credits
          </p>
        </div>

        {/* Filters */}
        <FilterBar filters={filters} onChange={setFilters} />

        {/* Content */}
        {!isConnected ? (
          <div
            className="glass-card"
            style={{
              padding: 60,
              textAlign: 'center',
              marginTop: 24,
            }}
          >
            <ShoppingBag size={48} color="#4a7a66" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#e2f4ee' }}>
              Connect Your Wallet
            </h3>
            <p style={{ color: '#7fb3a0', marginBottom: 24, fontSize: 15 }}>
              Connect your Stellar wallet to browse and purchase RECs
            </p>
            <WalletConnect />
          </div>
        ) : isLoading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 20,
              marginTop: 24,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 280, borderRadius: 16 }}
              />
            ))}
          </div>
        ) : error ? (
          <div
            className="glass-card"
            style={{
              padding: 40,
              textAlign: 'center',
              marginTop: 24,
              borderColor: 'rgba(239,68,68,0.2)',
            }}
          >
            <p style={{ color: '#f87171' }}>
              Could not load marketplace. Ensure the contract is deployed.
            </p>
          </div>
        ) : listings?.length === 0 ? (
          <div
            className="glass-card"
            style={{ padding: 60, textAlign: 'center', marginTop: 24 }}
          >
            <Search size={48} color="#4a7a66" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#e2f4ee' }}>
              No Listings Found
            </h3>
            <p style={{ color: '#7fb3a0', fontSize: 15 }}>
              No RECs match your current filters. Try adjusting them.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 20,
              marginTop: 24,
            }}
          >
            {listings?.map((rec) => (
              <RECCard key={rec.id} rec={rec} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
