'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap, BarChart3, Shield, ArrowRight, Leaf, Globe, Activity,
  TrendingUp, Users, Award, ChevronRight, ExternalLink,
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useWalletStore } from '@/store';
import { WalletButton } from '@/components/wallet/WalletButton';

const STATS = [
  { label: 'RECs Issued', value: '142,830', unit: 'MWh', icon: Leaf, color: 'emerald' },
  { label: 'Active Producers', value: '1,247', unit: 'verified', icon: Users, color: 'teal' },
  { label: 'Total Trades', value: '$8.4M', unit: 'volume', icon: TrendingUp, color: 'blue' },
  { label: 'CO₂ Offset', value: '68,420', unit: 'tonnes', icon: Globe, color: 'purple' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Tokenization',
    description:
      'Issue Renewable Energy Credits as blockchain tokens on Soroban with immutable proof of generation.',
  },
  {
    icon: BarChart3,
    title: 'Transparent Marketplace',
    description:
      'Browse, filter and purchase RECs with real-time pricing, on-chain settlement, and full audit trails.',
  },
  {
    icon: Shield,
    title: 'Secure Retirement',
    description:
      'Permanently retire RECs on-chain, preventing double-counting and generating verifiable certificates.',
  },
  {
    icon: Activity,
    title: 'Real-Time Events',
    description:
      'Live contract event streaming keeps your dashboard synchronized without manual refresh.',
  },
  {
    icon: Award,
    title: 'Multi-Certification',
    description:
      'Support Green-e Energy, RECS, I-REC, and custom certification bodies with on-chain provenance.',
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description:
      "Stellar's 5-second finality and ~$0.00001 fees make cross-border REC trading truly viable.",
  },
];

const ENERGY_SOURCES = [
  { label: 'Solar', icon: '☀️', color: '#F59E0B', pct: 38 },
  { label: 'Wind', icon: '🌬️', color: '#3B82F6', pct: 29 },
  { label: 'Hydro', icon: '💧', color: '#06B6D4', pct: 18 },
  { label: 'Biomass', icon: '🌿', color: '#10B981', pct: 10 },
  { label: 'Geothermal', icon: '🌋', color: '#EF4444', pct: 5 },
];

export default function LandingPage() {
  const { isConnected } = useWalletStore();

  return (
    <div className="min-h-screen bg-grid">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(2, 11, 18, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #059669, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Leaf size={18} color="white" />
            </div>
            <span
              style={{
                fontFamily: 'Space Grotesk',
                fontWeight: 700,
                fontSize: 18,
                color: '#e2f4ee',
              }}
            >
              REC<span style={{ color: '#10b981' }}>Market</span>
            </span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              href="/dashboard"
              style={{
                color: '#7fb3a0',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: 8,
                transition: 'color 0.2s',
              }}
            >
              Dashboard
            </Link>
            <Link
              href="/marketplace"
              style={{
                color: '#7fb3a0',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: 8,
              }}
            >
              Marketplace
            </Link>
            <Link
              href="/analytics"
              style={{
                color: '#7fb3a0',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: 8,
              }}
            >
              Analytics
            </Link>
            <WalletButton />
          </nav>
        </div>
      </header>

      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '100px 24px 80px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 400,
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse, rgba(16,185,129,0.10) 0%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(40px)',
          }}
        />

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 20,
            padding: '6px 14px',
            marginBottom: 24,
          }}
        >
          <div className="live-dot" />
          <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>
            Live on Stellar Testnet
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 24,
            letterSpacing: '-0.02em',
          }}
        >
          The Future of{' '}
          <span className="gradient-text">Clean Energy</span>
          <br />
          Trading is On-Chain
        </h1>

        <p
          style={{
            fontSize: 18,
            color: '#7fb3a0',
            maxWidth: 600,
            margin: '0 auto 40px',
            lineHeight: 1.7,
          }}
        >
          Issue, trade, and retire Renewable Energy Credits with unprecedented
          transparency, security, and speed — powered by Soroban smart contracts
          on the Stellar blockchain.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href={isConnected ? '/dashboard' : '/marketplace'}>
            <button className="btn-primary" style={{ padding: '14px 28px', fontSize: 15 }}>
              <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                Explore Marketplace <ArrowRight size={16} />
              </span>
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="btn-secondary" style={{ padding: '14px 28px', fontSize: 15 }}>
              Launch App
            </button>
          </Link>
        </div>
      </section>

      {/* ─── Stats ─────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="glass-card stat-card animate-slide-up"
              style={{ padding: 24, animationDelay: `${i * 0.1}s` }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(16,185,129,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <stat.icon size={20} color="#10b981" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#e2f4ee', marginBottom: 4 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 13, color: '#7fb3a0' }}>
                {stat.unit} · {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Energy Sources ─────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px 80px',
          display: 'grid',
          gap: 48,
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
            All Renewable Energy{' '}
            <span className="gradient-text">Sources Supported</span>
          </h2>
          <p style={{ color: '#7fb3a0', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
            RECMarket supports Solar, Wind, Hydro, Biomass, Geothermal, and Ocean
            energy types with source-specific certification and validation workflows.
          </p>

          {ENERGY_SOURCES.map((src) => (
            <div
              key={src.label}
              style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}
            >
              <span style={{ fontSize: 20 }}>{src.icon}</span>
              <span style={{ flex: 1, fontSize: 14, color: '#e2f4ee' }}>{src.label}</span>
              <div
                style={{
                  height: 6,
                  width: 160,
                  background: 'rgba(16,185,129,0.1)',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${src.pct}%`,
                    background: src.color,
                    borderRadius: 3,
                  }}
                />
              </div>
              <span style={{ fontSize: 13, color: '#7fb3a0', width: 36, textAlign: 'right' }}>
                {src.pct}%
              </span>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <div
            style={{
              fontSize: 13,
              color: '#10b981',
              fontWeight: 600,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div className="live-dot" />
            LIVE REC ISSUANCE
          </div>
          {[
            { src: '☀️ Solar', loc: 'California, USA', mwh: 500, status: 'Active' },
            { src: '🌬️ Wind', loc: 'Texas, USA', mwh: 1200, status: 'Listed' },
            { src: '💧 Hydro', loc: 'Oregon, USA', mwh: 3000, status: 'Active' },
            { src: '🌿 Biomass', loc: 'Georgia, USA', mwh: 750, status: 'Pending' },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: i < 3 ? '1px solid rgba(16,185,129,0.08)' : 'none',
              }}
            >
              <div>
                <div style={{ fontSize: 14, color: '#e2f4ee', fontWeight: 500 }}>
                  {item.src}
                </div>
                <div style={{ fontSize: 12, color: '#4a7a66' }}>{item.loc}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, color: '#10b981', fontWeight: 600 }}>
                  {item.mwh.toLocaleString()} MWh
                </div>
                <span
                  className={`badge badge-${item.status.toLowerCase()}`}
                  style={{ fontSize: 11 }}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Grid ──────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px 80px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Enterprise-Grade{' '}
            <span className="gradient-text">Blockchain Infrastructure</span>
          </h2>
          <p style={{ color: '#7fb3a0', fontSize: 16 }}>
            Built with Soroban smart contracts, inter-contract communication, and real-time event streaming.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
          }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="glass-card"
              style={{ padding: 28, cursor: 'default' }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(16,185,129,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <f.icon size={22} color="#10b981" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: '#e2f4ee' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: '#7fb3a0', lineHeight: 1.6 }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px 100px',
        }}
      >
        <div
          className="glass-card"
          style={{
            padding: 60,
            textAlign: 'center',
            background:
              'linear-gradient(135deg, rgba(5,150,105,0.12), rgba(6,78,59,0.08))',
            borderColor: 'rgba(16,185,129,0.25)',
          }}
        >
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
            Ready to Trade{' '}
            <span className="gradient-text">Clean Energy?</span>
          </h2>
          <p
            style={{
              color: '#7fb3a0',
              fontSize: 16,
              maxWidth: 480,
              margin: '0 auto 32px',
            }}
          >
            Connect your Stellar wallet and access the Renewable Energy Credit
            marketplace in seconds.
          </p>
          <WalletButton />
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid rgba(16,185,129,0.1)',
          padding: '32px 24px',
          textAlign: 'center',
          color: '#4a7a66',
          fontSize: 13,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span>© 2024 RECMarket · Built on Stellar Soroban</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <a
              href="https://stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#4a7a66',
                fontSize: 13,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Stellar.org <ExternalLink size={12} />
            </a>
            <a
              href="https://developers.stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#4a7a66',
                fontSize: 13,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Docs <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
