'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceContract, registryContract, submitTransaction } from '@/lib/contracts';
import { useWallet } from './useWallet';
import { useTransactionStore, useWalletStore } from '@/store';
import type { RECToken, RECEnergySource, FilterParams } from '@/lib/types';
import { contractLogger, captureError } from '@/lib/logger';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const recKeys = {
  all: ['recs'] as const,
  listings: () => [...recKeys.all, 'listings'] as const,
  rec: (id: number) => [...recKeys.all, 'rec', id] as const,
  userRecs: (address: string) => [...recKeys.all, 'user', address] as const,
  total: () => [...recKeys.all, 'total'] as const,
};

export const registryKeys = {
  all: ['registry'] as const,
  stats: () => [...registryKeys.all, 'stats'] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useListings(filters?: FilterParams) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...recKeys.listings(), filters],
    queryFn: async (): Promise<RECToken[]> => {
      const listingIds = await marketplaceContract.getListings();
      const recs = await Promise.all(
        listingIds.map((id) => marketplaceContract.getREC(id))
      );
      let results = recs.filter((r): r is RECToken => r !== null);

      if (filters?.energySource && filters.energySource !== 'all') {
        results = results.filter((r) => r.energySource === filters.energySource);
      }
      if (filters?.minPrice) {
        results = results.filter(
          (r) => r.price !== null && Number(r.price) >= (filters.minPrice! * 10_000_000)
        );
      }
      if (filters?.maxPrice) {
        results = results.filter(
          (r) => r.price !== null && Number(r.price) <= (filters.maxPrice! * 10_000_000)
        );
      }
      if (filters?.location) {
        results = results.filter((r) =>
          r.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      if (filters?.vintageYear) {
        results = results.filter((r) => r.vintageYear === filters.vintageYear);
      }

      // Sort
      switch (filters?.sortBy) {
        case 'price-asc':
          results.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
          break;
        case 'price-desc':
          results.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
          break;
        case 'newest':
          results.sort((a, b) => b.issuedAt - a.issuedAt);
          break;
        case 'oldest':
          results.sort((a, b) => a.issuedAt - b.issuedAt);
          break;
        case 'mwh-desc':
          results.sort((a, b) => b.mwhAmount - a.mwhAmount);
          break;
        case 'mwh-asc':
          results.sort((a, b) => a.mwhAmount - b.mwhAmount);
          break;
      }

      return results;
    },
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

export function useREC(recId: number | null) {
  return useQuery({
    queryKey: recId ? recKeys.rec(recId) : ['none'],
    queryFn: () => marketplaceContract.getREC(recId!),
    enabled: recId !== null,
    staleTime: 10_000,
  });
}

export function useUserRECs() {
  const address = useWalletStore((s) => s.address);

  return useQuery({
    queryKey: address ? recKeys.userRecs(address) : ['none'],
    queryFn: async (): Promise<RECToken[]> => {
      if (!address) return [];
      const ids = await marketplaceContract.getUserRECs(address);
      const recs = await Promise.all(ids.map((id) => marketplaceContract.getREC(id)));
      return recs.filter((r): r is RECToken => r !== null);
    },
    enabled: !!address,
    refetchInterval: 20_000,
  });
}

export function useTotalRECs() {
  return useQuery({
    queryKey: recKeys.total(),
    queryFn: () => marketplaceContract.getTotalRECs(),
    refetchInterval: 30_000,
  });
}

export function useMarketStats() {
  return useQuery({
    queryKey: registryKeys.stats(),
    queryFn: () => registryContract.getStats(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useIssueREC() {
  const { signTransaction } = useWallet();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const address = useWalletStore((s) => s.address);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      energySource: RECEnergySource;
      mwhAmount: number;
      location: string;
      certificationBody: string;
      vintageYear: number;
      metadataUri: string;
    }) => {
      if (!address) throw new Error('Wallet not connected');
      contractLogger.contractCall('issue_rec', params);

      const txId = addTransaction({
        type: 'issue',
        status: 'pending',
        hash: null,
        timestamp: Date.now() / 1000,
      });

      try {
        const xdr = await marketplaceContract.buildIssueREC({
          issuer: address,
          ...params,
        });

        updateTransaction(txId, { status: 'processing' });
        const signedXdr = await signTransaction(xdr);
        const hash = await submitTransaction(signedXdr);

        updateTransaction(txId, {
          status: 'confirmed',
          hash,
          explorerUrl: `https://stellar.expert/explorer/testnet/tx/${hash}`,
        });

        return { txId, hash };
      } catch (err) {
        updateTransaction(txId, {
          status: 'failed',
          error: err instanceof Error ? err.message : 'Transaction failed',
        });
        captureError(err, { operation: 'issue_rec' });
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recKeys.all });
    },
  });
}

export function useListForSale() {
  const { signTransaction } = useWallet();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const address = useWalletStore((s) => s.address);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { recId: number; priceStroops: bigint }) => {
      if (!address) throw new Error('Wallet not connected');

      const txId = addTransaction({
        type: 'list',
        status: 'pending',
        hash: null,
        timestamp: Date.now() / 1000,
        recId: params.recId,
        amount: params.priceStroops,
      });

      try {
        const xdr = await marketplaceContract.buildListForSale({
          owner: address,
          ...params,
        });

        updateTransaction(txId, { status: 'processing' });
        const signedXdr = await signTransaction(xdr);
        const hash = await submitTransaction(signedXdr);

        updateTransaction(txId, { status: 'confirmed', hash });
        return { txId, hash };
      } catch (err) {
        updateTransaction(txId, {
          status: 'failed',
          error: err instanceof Error ? err.message : 'Transaction failed',
        });
        throw err;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recKeys.all }),
  });
}

export function usePurchaseREC() {
  const { signTransaction } = useWallet();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const address = useWalletStore((s) => s.address);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { recId: number; paymentToken: string }) => {
      if (!address) throw new Error('Wallet not connected');

      const txId = addTransaction({
        type: 'purchase',
        status: 'pending',
        hash: null,
        timestamp: Date.now() / 1000,
        recId: params.recId,
      });

      try {
        const xdr = await marketplaceContract.buildPurchase({
          buyer: address,
          ...params,
        });

        updateTransaction(txId, { status: 'processing' });
        const signedXdr = await signTransaction(xdr);
        const hash = await submitTransaction(signedXdr);

        updateTransaction(txId, { status: 'confirmed', hash });
        return { txId, hash };
      } catch (err) {
        updateTransaction(txId, {
          status: 'failed',
          error: err instanceof Error ? err.message : 'Transaction failed',
        });
        captureError(err, { operation: 'purchase_rec', ...params });
        throw err;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recKeys.all }),
  });
}

export function useRetireREC() {
  const { signTransaction } = useWallet();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const address = useWalletStore((s) => s.address);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      recId: number;
      beneficiaryName: string;
      retirementReason: string;
    }) => {
      if (!address) throw new Error('Wallet not connected');

      const txId = addTransaction({
        type: 'retire',
        status: 'pending',
        hash: null,
        timestamp: Date.now() / 1000,
        recId: params.recId,
      });

      try {
        const xdr = await marketplaceContract.buildRetire({
          owner: address,
          ...params,
        });

        updateTransaction(txId, { status: 'processing' });
        const signedXdr = await signTransaction(xdr);
        const hash = await submitTransaction(signedXdr);

        updateTransaction(txId, { status: 'confirmed', hash });
        return { txId, hash };
      } catch (err) {
        updateTransaction(txId, {
          status: 'failed',
          error: err instanceof Error ? err.message : 'Transaction failed',
        });
        throw err;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recKeys.all }),
  });
}
