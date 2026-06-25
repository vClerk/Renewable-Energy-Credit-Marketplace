'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useContractEvents } from '@/hooks/useContractEvents';
import { timeAgo } from '@/lib/utils';
import { Activity, Wifi, WifiOff, RefreshCw, X } from 'lucide-react';
import type { ContractEvent } from '@/lib/types';

const EVENT_ICONS: Record<string, string> = {
  rec_issue: '🌱',
  rec_apprv: '✅',
  rec_rejct: '❌',
  rec_list: '🏷️',
  rec_dlist: '↩️',
  rec_buy: '💰',
  rec_retir: '🏆',
  rec_xfer: '↔️',
  prod_reg: '🏭',
  prod_apv: '✅',
  role_add: '👤',
  default: '⚡',
};

const EVENT_LABELS: Record<string, string> = {
  rec_issue: 'REC Issued',
  rec_apprv: 'REC Approved',
  rec_rejct: 'REC Rejected',
  rec_list: 'Listed for Sale',
  rec_dlist: 'Delisted',
  rec_buy: 'REC Purchased',
  rec_retir: 'REC Retired',
  rec_xfer: 'REC Transferred',
  prod_reg: 'Producer Registered',
  prod_apv: 'Producer Approved',
  role_add: 'Role Granted',
};

function EventItem({ event }: { event: ContractEvent }) {
  const icon = EVENT_ICONS[event.type] ?? EVENT_ICONS.default;
  const label = EVENT_LABELS[event.type] ?? event.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div
      className="animate-slide-up"
      style={{
        display: 'flex',
        gap: 16,
        padding: '16px 24px',
        borderBottom: '1px solid rgba(16,185,129,0.07)',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'rgba(16,185,129,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e2f4ee' }}>
            {label}
          </span>
          <span style={{ fontSize: 12, color: '#4a7a66' }}>
            {timeAgo(event.timestamp)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {event.recId !== undefined && (
            <span style={{ fontSize: 12, color: '#7fb3a0' }}>
              REC #{event.recId}
            </span>
          )}
          {event.txHash && (
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${event.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                color: '#10b981',
                fontFamily: 'monospace',
                textDecoration: 'none',
              }}
            >
              {event.txHash.slice(0, 12)}...
            </a>
          )}
          <span style={{ fontSize: 12, color: '#4a7a66' }}>
            Ledger #{event.ledger}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const { events, isConnected, clearEvents } = useContractEvents();

  return (
    <AppShell>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 28,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 6,
              }}
            >
              <Activity size={24} color="#10b981" />
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e2f4ee' }}>
                Activity Feed
              </h1>
              {isConnected ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: 20,
                    padding: '3px 10px',
                  }}
                >
                  <div className="live-dot" />
                  <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                    LIVE
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: 20,
                    padding: '3px 10px',
                  }}
                >
                  <WifiOff size={12} color="#f87171" />
                  <span style={{ fontSize: 11, color: '#f87171', fontWeight: 600 }}>
                    OFFLINE
                  </span>
                </div>
              )}
            </div>
            <p style={{ color: '#7fb3a0', fontSize: 15 }}>
              Real-time contract events from Marketplace & Registry
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-secondary"
              onClick={clearEvents}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                padding: '8px 14px',
              }}
            >
              <X size={14} />
              Clear
            </button>
          </div>
        </div>

        {/* Connection Status Banner */}
        {!isConnected && (
          <div
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12,
              padding: '12px 20px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <WifiOff size={16} color="#f87171" />
            <span style={{ fontSize: 14, color: '#f87171' }}>
              Unable to connect to Stellar RPC. Events will appear when connection is restored.
            </span>
          </div>
        )}

        {/* Event Count */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 13, color: '#4a7a66' }}>
            {events.length} events (showing latest 100)
          </span>
          <span style={{ fontSize: 12, color: '#4a7a66' }}>
            Polling every 5 seconds
          </span>
        </div>

        {/* Events List */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {events.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(16,185,129,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <Activity size={28} color="#4a7a66" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#e2f4ee' }}>
                Waiting for Events
              </h3>
              <p style={{ color: '#7fb3a0', fontSize: 14 }}>
                {isConnected
                  ? 'No contract events yet. Start trading to see activity here.'
                  : 'Connecting to Stellar network...'}
              </p>
            </div>
          ) : (
            events.map((event) => <EventItem key={event.id} event={event} />)
          )}
        </div>
      </div>
    </AppShell>
  );
}
