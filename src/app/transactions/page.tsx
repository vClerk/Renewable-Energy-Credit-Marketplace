'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useTransactionStore } from '@/store';
import { formatTimestamp, getExplorerTxUrl } from '@/lib/utils';
import {
  Receipt, CheckCircle2, Clock, XCircle, Loader2,
  ExternalLink, Filter,
} from 'lucide-react';
import { useState } from 'react';
import type { TransactionRecord } from '@/lib/types';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: '#F59E0B', label: 'Pending' },
  processing: { icon: Loader2, color: '#3B82F6', label: 'Processing' },
  confirmed: { icon: CheckCircle2, color: '#10b981', label: 'Confirmed' },
  failed: { icon: XCircle, color: '#EF4444', label: 'Failed' },
};

const TYPE_LABELS: Record<string, string> = {
  issue: '🌱 Issue REC',
  approve: '✅ Approve REC',
  list: '🏷️ List for Sale',
  delist: '↩️ Delist',
  purchase: '💰 Purchase',
  retire: '🏆 Retire',
  transfer: '↔️ Transfer',
};

function TxRow({ tx }: { tx: TransactionRecord }) {
  const status = STATUS_CONFIG[tx.status];

  return (
    <tr>
      <td>
        <span style={{ color: '#e2f4ee', fontWeight: 500 }}>
          {TYPE_LABELS[tx.type] ?? tx.type}
        </span>
      </td>
      <td>
        <span style={{ color: '#7fb3a0' }}>
          {tx.recId !== undefined ? `#${tx.recId}` : '-'}
        </span>
      </td>
      <td>
        <span
          className={`badge badge-${
            tx.status === 'confirmed' ? 'active' :
            tx.status === 'failed' ? 'rejected' :
            tx.status === 'processing' ? 'listed' : 'pending'
          }`}
        >
          <status.icon size={10} />
          {status.label}
        </span>
      </td>
      <td>
        {tx.hash ? (
          <a
            href={getExplorerTxUrl(tx.hash)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#10b981',
              fontFamily: 'monospace',
              fontSize: 12,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {tx.hash.slice(0, 12)}...
            <ExternalLink size={10} />
          </a>
        ) : (
          <span style={{ color: '#4a7a66' }}>-</span>
        )}
      </td>
      <td style={{ color: '#7fb3a0', fontSize: 13 }}>
        {formatTimestamp(tx.timestamp)}
      </td>
      <td>
        {tx.error && (
          <span
            title={tx.error}
            style={{
              color: '#f87171',
              fontSize: 12,
              cursor: 'help',
              display: 'block',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {tx.error}
          </span>
        )}
      </td>
    </tr>
  );
}

export default function TransactionsPage() {
  const { transactions, clearTransactions } = useTransactionStore();
  const [filter, setFilter] = useState<string>('all');

  const filtered =
    filter === 'all' ? transactions : transactions.filter((t) => t.status === filter);

  const confirmed = transactions.filter((t) => t.status === 'confirmed').length;
  const pending = transactions.filter(
    (t) => t.status === 'pending' || t.status === 'processing'
  ).length;
  const failed = transactions.filter((t) => t.status === 'failed').length;

  return (
    <AppShell>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 6,
            }}
          >
            <Receipt size={24} color="#10b981" />
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e2f4ee' }}>
              Transaction Center
            </h1>
          </div>
          <p style={{ color: '#7fb3a0', fontSize: 15 }}>
            Full lifecycle tracking for all your blockchain operations
          </p>
        </div>

        {/* Summary Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
            marginBottom: 28,
          }}
        >
          {[
            { label: 'Total', value: transactions.length, color: '#7fb3a0' },
            { label: 'Confirmed', value: confirmed, color: '#10b981' },
            { label: 'Pending', value: pending, color: '#F59E0B' },
            { label: 'Failed', value: failed, color: '#EF4444' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card"
              style={{ padding: '20px 24px', textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: stat.color,
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 13, color: '#7fb3a0' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['all', 'confirmed', 'pending', 'processing', 'failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '7px 16px',
                borderRadius: 20,
                border: '1px solid',
                borderColor:
                  filter === f ? 'rgba(16,185,129,0.5)' : 'rgba(16,185,129,0.12)',
                background:
                  filter === f ? 'rgba(16,185,129,0.12)' : 'transparent',
                color: filter === f ? '#10b981' : '#7fb3a0',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
            >
              {f}
            </button>
          ))}

          <button
            onClick={clearTransactions}
            style={{
              marginLeft: 'auto',
              padding: '7px 16px',
              borderRadius: 20,
              border: '1px solid rgba(239,68,68,0.2)',
              background: 'transparent',
              color: '#f87171',
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Clear All
          </button>
        </div>

        {/* Transactions Table */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <Receipt size={48} color="#4a7a66" style={{ marginBottom: 16 }} />
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: '#e2f4ee',
                }}
              >
                No Transactions
              </h3>
              <p style={{ color: '#7fb3a0', fontSize: 14 }}>
                {filter === 'all'
                  ? 'Transactions will appear here after you start trading.'
                  : `No ${filter} transactions found.`}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>REC</th>
                    <th>Status</th>
                    <th>Hash</th>
                    <th>Time</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx) => (
                    <TxRow key={tx.id} tx={tx} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
