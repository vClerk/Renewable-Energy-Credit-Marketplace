'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useUserRECs, useTotalRECs } from '@/hooks/useREC';
import { useProducer } from '@/hooks/useProducer';
import { useWalletStore } from '@/store';
import { useTransactionStore } from '@/store';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { RECCard } from '@/components/rec/RECCard';
import { StatsCard } from '@/components/ui/StatsCard';
import { IssueRECModal } from '@/components/rec/IssueRECModal';
import { RegisterProducerModal } from '@/components/producer/RegisterProducerModal';
import { formatXLM, truncateAddress, formatMWh } from '@/lib/utils';
import {
  Leaf, TrendingUp, Award, Plus, Wallet, BarChart3,
  Shield, Clock, Activity, ShieldAlert, ShieldCheck, Factory
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
  const { isConnected, address, balance } = useWalletStore();
  const { data: userRECs, isLoading } = useUserRECs();
  const { data: producer, isLoading: isLoadingProducer } = useProducer(address);
  const { data: totalRECs } = useTotalRECs();
  const { transactions, getPendingCount } = useTransactionStore();
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const activeRECs = userRECs?.filter((r) => r.status === 'Active') ?? [];
  const listedRECs = userRECs?.filter((r) => r.status === 'Listed') ?? [];
  const retiredRECs = userRECs?.filter((r) => r.status === 'Retired') ?? [];
  const totalMWh = userRECs?.reduce((sum, r) => sum + r.mwhAmount, 0) ?? 0;
  const pendingTxCount = getPendingCount();

  const isProducer = producer?.status === 'Active';
  const isPendingProducer = producer?.status === 'Pending';

  if (!isConnected) {
    return (
      <AppShell>
        <div
          style={{
            maxWidth: 600,
            margin: '80px auto',
            padding: '0 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <Wallet size={32} color="#10b981" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, color: '#e2f4ee' }}>
            Connect to Dashboard
          </h1>
          <p style={{ color: '#7fb3a0', marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
            Connect your Stellar wallet to manage your Renewable Energy Credits,
            view your portfolio, and track transactions.
          </p>
          <WalletConnect />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Account Header */}
        <div
          className="glass-card"
          style={{
            padding: '24px 28px',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            background:
              'linear-gradient(135deg, rgba(5,150,105,0.1), rgba(2,11,18,0.5))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div 
              style={{ 
                width: 56, 
                height: 56, 
                borderRadius: 16, 
                background: isProducer ? 'rgba(16,185,129,0.15)' : 'rgba(74,122,102,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(16,185,129,0.1)'
              }}
            >
              {isProducer ? <ShieldCheck size={28} color="#10b981" /> : <Shield size={28} color="#4a7a66" />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 12, color: '#4a7a66', fontWeight: 600 }}>
                  {isProducer ? 'VERIFIED PRODUCER' : isPendingProducer ? 'PENDING VERIFICATION' : 'UNREGISTERED ACCOUNT'}
                </div>
                {isProducer && <span className="badge badge-active" style={{ fontSize: 10 }}>ACTIVE</span>}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: '#e2f4ee',
                  marginBottom: 4,
                }}
              >
                {producer?.name || truncateAddress(address!, 6)}
              </div>
              <div style={{ fontSize: 14, color: '#7fb3a0' }}>
                Balance:{' '}
                <span style={{ color: '#10b981', fontWeight: 600 }}>
                  {formatXLM(balance ?? BigInt(0))} XLM
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {pendingTxCount > 0 && (
              <div
                style={{
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: 10,
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Clock size={14} color="#F59E0B" />
                <span style={{ fontSize: 13, color: '#F59E0B', fontWeight: 600 }}>
                  {pendingTxCount} pending
                </span>
              </div>
            )}
            
            {!isProducer && !isPendingProducer && (
              <button
                className="btn-secondary"
                onClick={() => setRegisterModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Factory size={16} />
                Register as Producer
              </button>
            )}

            <button
              className="btn-primary"
              onClick={() => setIssueModalOpen(true)}
              disabled={!isProducer}
              style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: isProducer ? 1 : 0.6 }}
              title={!isProducer ? "Only verified producers can issue RECs" : ""}
            >
              <Plus size={16} />
              Issue REC
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <StatsCard
            label="Total RECs"
            value={userRECs?.length ?? 0}
            icon={Leaf}
            color="#10b981"
            subtext="in portfolio"
          />
          <StatsCard
            label="Active"
            value={activeRECs.length}
            icon={Activity}
            color="#34d399"
            subtext="ready to list"
          />
          <StatsCard
            label="Listed"
            value={listedRECs.length}
            icon={TrendingUp}
            color="#3B82F6"
            subtext="for sale"
          />
          <StatsCard
            label="Retired"
            value={retiredRECs.length}
            icon={Shield}
            color="#8B5CF6"
            subtext="certificates"
          />
          <StatsCard
            label="Total MWh"
            value={formatMWh(totalMWh)}
            icon={BarChart3}
            color="#F59E0B"
            subtext="generated"
            isString
          />
        </div>

        {/* REC Portfolio */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#e2f4ee' }}>
            Your Portfolio
          </h2>

          {isLoading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 20,
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />
              ))}
            </div>
          ) : userRECs?.length === 0 ? (
            <div
              className="glass-card"
              style={{ padding: 48, textAlign: 'center' }}
            >
              <Leaf size={48} color="#4a7a66" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#e2f4ee' }}>
                No RECs Yet
              </h3>
              <p style={{ color: '#7fb3a0', marginBottom: 24 }}>
                {isProducer 
                  ? "Issue your first Renewable Energy Credit to get started" 
                  : "Register as a Producer to start issuing RECs"}
              </p>
              <button
                className="btn-primary"
                onClick={() => isProducer ? setIssueModalOpen(true) : setRegisterModalOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                {isProducer ? <Plus size={16} /> : <Factory size={16} />}
                {isProducer ? "Issue First REC" : "Register Facility"}
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 20,
              }}
            >
              {userRECs?.map((rec) => (
                <RECCard key={rec.id} rec={rec} showOwnerActions />
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#e2f4ee' }}>
            Recent Transactions
          </h2>
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            {transactions.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#4a7a66' }}>
                No transactions yet
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>REC ID</th>
                    <th>Status</th>
                    <th>Hash</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx.id}>
                      <td style={{ textTransform: 'capitalize', color: '#e2f4ee' }}>
                        {tx.type}
                      </td>
                      <td>{tx.recId ?? '-'}</td>
                      <td>
                        <span
                          className={`badge badge-${
                            tx.status === 'confirmed'
                              ? 'active'
                              : tx.status === 'failed'
                              ? 'rejected'
                              : 'pending'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td>
                        {tx.hash ? (
                          <a
                            href={tx.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#10b981',
                              fontSize: 12,
                              fontFamily: 'monospace',
                              textDecoration: 'none',
                            }}
                          >
                            {tx.hash.slice(0, 8)}...
                          </a>
                        ) : (
                          <span style={{ color: '#4a7a66' }}>-</span>
                        )}
                      </td>
                      <td>
                        {new Date(tx.timestamp * 1000).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <IssueRECModal
        open={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
      />

      <RegisterProducerModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </AppShell>
  );
}
