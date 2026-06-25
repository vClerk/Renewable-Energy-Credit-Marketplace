'use client';

import { useWallet } from '@/hooks/useWallet';
import { Wallet, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function WalletConnect() {
  const { openWalletSelector, isConnecting, error } = useWallet();

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={openWalletSelector}
        disabled={isConnecting}
        className="group relative px-8 py-4 bg-[#10b981] text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden mt-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        
        <div className="flex items-center gap-3 relative z-10">
          {isConnecting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet size={20} className="group-hover:scale-110 transition-transform" />
              <span>Secure Wallet Connection</span>
            </>
          )}
        </div>
      </button>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm max-w-sm text-center"
        >
          {error}
        </motion.div>
      )}

      <div className="mt-8 flex items-center gap-6">
        <div className="flex items-center gap-2 text-[#4a7a66]">
          <ShieldCheck size={16} />
          <span className="text-xs font-medium uppercase tracking-wider">End-to-End Secure</span>
        </div>
        <div className="flex items-center gap-2 text-[#4a7a66]">
          <Zap size={16} />
          <span className="text-xs font-medium uppercase tracking-wider">Instant Setup</span>
        </div>
      </div>
    </div>
  );
}
