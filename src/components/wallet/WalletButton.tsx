'use client';

import { useWallet } from '@/hooks/useWallet';
import { useWalletStore } from '@/store';
import { truncateAddress, formatXLM } from '@/lib/utils';
import { Wallet, LogOut, ChevronDown, SwitchCamera } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function WalletButton() {
  const { address, isConnected, balance } = useWalletStore();
  const { openWalletSelector, disconnect } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isConnected) {
    return (
      <button 
        onClick={openWalletSelector}
        className="btn-primary flex items-center gap-2"
        style={{ padding: '8px 16px', fontSize: '13px' }}
      >
        <Wallet size={16} />
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#081420] border border-[#10b981]/20 hover:border-[#10b981]/40 transition-all duration-200 group"
      >
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-wider">Connected</span>
          <span className="text-sm font-bold text-[#e2f4ee]">{formatXLM(balance ?? BigInt(0))} XLM</span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#064e3b] to-[#059669] flex items-center justify-center text-[#e2f4ee] font-bold text-xs ring-1 ring-[#10b981]/30">
          {address?.slice(1, 3)}
        </div>
        <ChevronDown size={14} className={`text-[#7fb3a0] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-[#081420] border border-[#10b981]/20 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
          >
            <div className="p-4 border-b border-[#10b981]/10 bg-[#10b981]/5">
              <span className="text-[10px] font-bold text-[#4a7a66] uppercase tracking-widest block mb-1">Your Address</span>
              <code className="text-xs text-[#e2f4ee] break-all block p-2 bg-black/30 rounded-lg border border-[#10b981]/5">
                {address}
              </code>
            </div>

            <div className="p-2">
              <button 
                onClick={() => {
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#7fb3a0] hover:text-[#e2f4ee] hover:bg-[#10b981]/5 transition-colors"
              >
                <SwitchCamera size={16} />
                Switch Account
              </button>
              
              <button 
                onClick={() => {
                  setIsOpen(false);
                  disconnect();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#f87171] hover:bg-[#ef4444]/10 transition-colors"
              >
                <LogOut size={16} />
                Disconnect
              </button>
            </div>
            
            <div className="px-4 py-3 bg-[#061018] border-t border-[#10b981]/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#4a7a66] uppercase tracking-widest">Network</span>
                <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  Testnet
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
