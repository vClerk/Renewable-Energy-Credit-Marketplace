'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WalletState, TransactionRecord } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { walletLogger } from '@/lib/logger';

interface WalletStore extends WalletState {
  // Actions
  setAddress: (address: string | null) => void;
  setConnected: (connected: boolean) => void;
  setBalance: (balance: bigint | null) => void;
  setNetwork: (network: string) => void;
  disconnect: () => void;
  reconnect: () => void;
}

interface TransactionStore {
  transactions: TransactionRecord[];
  addTransaction: (tx: Omit<TransactionRecord, 'id'>) => string;
  updateTransaction: (id: string, updates: Partial<TransactionRecord>) => void;
  clearTransactions: () => void;
  getPendingCount: () => number;
}

interface UIStore {
  sidebarOpen: boolean;
  activeModal: string | null;
  walletModalOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  setWalletModalOpen: (open: boolean) => void;
}

// ─── Wallet Store ─────────────────────────────────────────────────────────────

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      address: null,
      isConnected: false,
      network: 'testnet',
      balance: null,

      setAddress: (address) => {
        walletLogger.walletEvent('address-changed', { address });
        set({ address });
      },
      setConnected: (isConnected) => {
        walletLogger.walletEvent(isConnected ? 'connected' : 'disconnected');
        set({ isConnected });
      },
      setBalance: (balance) => set({ balance }),
      setNetwork: (network) => {
        walletLogger.walletEvent('network-changed', { network });
        set({ network });
      },
      disconnect: () => {
        walletLogger.walletEvent('disconnect');
        set({ address: null, isConnected: false, balance: null });
      },
      reconnect: () => {
        // Attempt to restore session
        const { address } = get();
        if (address) {
          walletLogger.walletEvent('reconnect-attempt', { address });
        }
      },
    }),
    {
      name: 'rec-wallet-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        address: state.address,
        network: state.network,
      }),
    }
  )
);

// ─── Transaction Store ────────────────────────────────────────────────────────

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (tx) => {
        const id = generateId();
        const record: TransactionRecord = {
          ...tx,
          id,
          timestamp: tx.timestamp || Date.now() / 1000,
        };
        set((state) => ({
          transactions: [record, ...state.transactions].slice(0, 100),
        }));
        return id;
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
        }));
      },

      clearTransactions: () => set({ transactions: [] }),

      getPendingCount: () => {
        return get().transactions.filter(
          (tx) => tx.status === 'pending' || tx.status === 'processing'
        ).length;
      },
    }),
    {
      name: 'rec-transactions-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ─── UI Store ─────────────────────────────────────────────────────────────────

export const useUIStore = create<UIStore>()((set) => ({
  sidebarOpen: false,
  activeModal: null,
  walletModalOpen: false,

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setActiveModal: (activeModal) => set({ activeModal }),
  setWalletModalOpen: (walletModalOpen) => set({ walletModalOpen }),
}));
