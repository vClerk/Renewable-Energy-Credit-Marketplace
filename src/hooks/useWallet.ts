'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  StellarWalletsKit,
  Networks,
  ISupportedWallet,
} from '@creit.tech/stellar-wallets-kit';
import { useWalletStore } from '@/store';
import { getAccountBalance } from '@/lib/contracts';
import { walletLogger } from '@/lib/logger';
import { NETWORK } from '@/lib/config';

let isInitialized = false;

function initKit(): void {
  if (isInitialized) return;
  
  StellarWalletsKit.init({
    network:
      NETWORK === 'mainnet'
        ? Networks.PUBLIC
        : Networks.TESTNET,
    modules: [], // will use dynamic wallet detection
  });
  
  isInitialized = true;
}

interface UseWalletReturn {
  connect: (walletId?: string) => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
  openWalletSelector: () => void;
  availableWallets: ISupportedWallet[];
  isConnecting: boolean;
  error: string | null;
}

export function useWallet(): UseWalletReturn {
  const {
    setAddress,
    setConnected,
    setBalance,
    setNetwork,
    disconnect: storeDisconnect,
    address: storedAddress,
  } = useWalletStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<ISupportedWallet[]>([]);

  // Restore session on mount
  useEffect(() => {
    initKit();
    if (storedAddress) {
      // Try to silently reconnect
      getAccountBalance(storedAddress).then((bal) => {
        setBalance(bal);
        setConnected(true);
      }).catch(() => {
        // Session expired, clear
        storeDisconnect();
      });
    }

    // Get available wallets
    StellarWalletsKit.refreshSupportedWallets().then(setAvailableWallets).catch(console.error);
  }, [storedAddress, setBalance, setConnected, storeDisconnect]);

  const connect = useCallback(async (walletId?: string) => {
    setIsConnecting(true);
    setError(null);
    try {
      initKit();

      if (walletId) {
        StellarWalletsKit.setWallet(walletId);
      }

      const { address } = await StellarWalletsKit.getAddress();
      if (!address) throw new Error('No address returned from wallet');

      const balance = await getAccountBalance(address);

      setAddress(address);
      setConnected(true);
      setBalance(balance);
      setNetwork(NETWORK);

      walletLogger.walletEvent('connect-success', { address });
    } catch (err: unknown) {
      const message = getWalletErrorMessage(err);
      setError(message);
      walletLogger.error('Wallet connection failed', err);
    } finally {
      setIsConnecting(false);
    }
  }, [setAddress, setConnected, setBalance, setNetwork]);

  const disconnect = useCallback(async () => {
    await StellarWalletsKit.disconnect();
    storeDisconnect();
    walletLogger.walletEvent('disconnect');
  }, [storeDisconnect]);

  const signTransaction = useCallback(async (xdr: string): Promise<string> => {
    initKit();
    try {
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase:
          NETWORK === 'mainnet'
            ? Networks.PUBLIC
            : Networks.TESTNET,
      });
      return signedTxXdr;
    } catch (err: unknown) {
      const message = getWalletErrorMessage(err);
      walletLogger.error('Transaction signing failed', err);
      throw new Error(message);
    }
  }, []);

  const openWalletSelector = useCallback(async () => {
    initKit();
    try {
      // In v2.x authModal replaces the manual manual wallet selection for connection
      const { address } = await StellarWalletsKit.authModal();
      if (address) {
        const balance = await getAccountBalance(address);
        setAddress(address);
        setConnected(true);
        setBalance(balance);
        setNetwork(NETWORK);
      }
    } catch (err) {
      console.error('Wallet selection failed', err);
    }
  }, [setAddress, setConnected, setBalance, setNetwork]);

  return {
    connect,
    disconnect,
    signTransaction,
    openWalletSelector,
    availableWallets,
    isConnecting,
    error,
  };
}

function getWalletErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    const msg = (err.message as string) || '';
    if (msg.includes('User rejected')) return 'Transaction rejected by user.';
    if (msg.includes('insufficient')) return 'Insufficient XLM balance for this transaction.';
    if (msg.includes('not found') || msg.includes('not installed'))
      return 'Wallet not found. Please install Freighter or another Stellar wallet.';
    if (msg.includes('network')) return 'Network mismatch. Please switch to the correct network in your wallet.';
    if (msg) return msg;
  }
  return 'An unexpected wallet error occurred. Please try again.';
}
