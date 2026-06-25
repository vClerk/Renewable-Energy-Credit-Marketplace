'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useWalletStore, useTransactionStore } from '@/store';
import { 
  Settings, User, Shield, Bell, Network, 
  Trash2, FileJson, Download, Wallet, CreditCard
} from 'lucide-react';
import { truncateAddress } from '@/lib/utils';
import { useState } from 'react';

export default function SettingsPage() {
  const { address, network, isConnected } = useWalletStore();
  const { clearTransactions } = useTransactionStore();
  const [notifications, setNotifications] = useState(true);

  if (!isConnected) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto mt-20 text-center px-6">
          <Settings size={48} className="mx-auto text-[#4a7a66] mb-4" />
          <h1 className="text-2xl font-bold text-[#e2f4ee] mb-4">Connect Wallet to View Settings</h1>
          <p className="text-[#7fb3a0]">You need to be connected to manage your account and preferences.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center gap-3 mb-10">
          <Settings size={28} className="text-[#10b981]" />
          <h1 className="text-3xl font-black text-[#e2f4ee] tracking-tight">Settings</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Navigation */}
          <nav className="space-y-1">
            {['General', 'Account', 'Security', 'Notifications', 'Advanced'].map((tab) => (
              <button
                key={tab}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  tab === 'General' 
                    ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/10' 
                    : 'text-[#7fb3a0] hover:text-[#e2f4ee] hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Settings Panels */}
          <div className="md:col-span-2 space-y-6">
            {/* Account Info */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <User size={18} className="text-[#10b981]" />
                <h3 className="text-lg font-bold text-[#e2f4ee]">Account Profile</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-black/20 rounded-xl border border-[#10b981]/5">
                  <label className="text-[10px] font-bold text-[#4a7a66] uppercase tracking-[0.2em] block mb-2">Connected Wallet</label>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-[#e2f4ee]">{truncateAddress(address!, 12)}</span>
                    <span className="badge badge-active text-[10px]">Verified</span>
                  </div>
                </div>

                <div className="p-4 bg-black/20 rounded-xl border border-[#10b981]/5">
                  <label className="text-[10px] font-bold text-[#4a7a66] uppercase tracking-[0.2em] block mb-2">Network Environment</label>
                  <div className="flex items-center gap-2 text-[#e2f4ee]">
                    <Network size={14} className="text-[#10b981]" />
                    <span className="text-sm font-semibold capitalize">{network}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Settings */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Bell size={18} className="text-[#10b981]" />
                <h3 className="text-lg font-bold text-[#e2f4ee]">Preferences</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-[#10b981]/5">
                  <div>
                    <h4 className="text-sm font-bold text-[#e2f4ee]">On-chain Notifications</h4>
                    <p className="text-xs text-[#7fb3a0]">Notify when transactions are confirmed</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications} 
                    onChange={() => setNotifications(!notifications)}
                    className="w-5 h-5 rounded border-[#10b981]/20 bg-[#020b12] text-[#10b981] focus:ring-[#10b981]"
                  />
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="glass-card p-6 border-red-500/10">
              <div className="flex items-center gap-2 mb-6">
                <Shield size={18} className="text-red-400" />
                <h3 className="text-lg font-bold text-[#e2f4ee]">Advanced Management</h3>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => {
                    const data = JSON.stringify(localStorage, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'rec-marketplace-config.json';
                    a.click();
                  }}
                  className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileJson size={18} className="text-[#7fb3a0]" />
                    <div>
                      <span className="text-sm font-bold text-[#e2f4ee] block">Export Local State</span>
                      <span className="text-xs text-[#4a7a66]">Download transaction history and settings</span>
                    </div>
                  </div>
                  <Download size={16} className="text-[#4a7a66]" />
                </button>

                <button 
                  onClick={() => {
                    if (confirm('Are you sure? This will clear your local transaction history.')) {
                      clearTransactions();
                    }
                  }}
                  className="w-full flex items-center justify-between p-4 bg-red-500/5 rounded-xl text-left hover:bg-red-500/10 transition-colors border border-red-500/10"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 size={18} className="text-red-400" />
                    <div>
                      <span className="text-sm font-bold text-red-100 block">Clear Transaction Logs</span>
                      <span className="text-xs text-red-400/60">Remove history from this browser</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
