'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registryContract, submitTransaction } from '@/lib/contracts';
import { useWalletStore, useTransactionStore } from '@/store';
import { useWallet } from './useWallet';
import type { Producer } from '@/lib/types';
import { contractLogger, captureError } from '@/lib/logger';

export const producerKeys = {
  all: ['producers'] as const,
  byAddress: (address: string) => [...producerKeys.all, 'address', address] as const,
};

export function useProducer(address?: string | null) {
  return useQuery({
    queryKey: address ? producerKeys.byAddress(address) : ['none'],
    queryFn: () => (address ? registryContract.getProducer(address) : null),
    enabled: !!address,
    staleTime: 60_000,
  });
}

export function useRegisterProducer() {
  const { signTransaction } = useWallet();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const address = useWalletStore((s) => s.address);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      location: string;
      energyTypes: string[];
      capacityKw: number;
      certificationId: string;
    }) => {
      if (!address) throw new Error('Wallet not connected');

      const txId = addTransaction({
        type: 'transfer', // Reusing transfer type or add 'register' to types
        status: 'pending',
        hash: null,
        timestamp: Date.now() / 1000,
      });

      try {
        const xdr = await registryContract.buildRegisterProducer({
          address,
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
          error: err instanceof Error ? err.message : 'Registration failed',
        });
        captureError(err, { operation: 'register_producer' });
        throw err;
      }
    },
    onSuccess: () => {
      if (address) {
        queryClient.invalidateQueries({ queryKey: producerKeys.byAddress(address) });
      }
    },
  });
}
