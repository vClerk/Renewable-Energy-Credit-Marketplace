'use client';

import { AppShell } from '@/components/layout/AppShell';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
  AreaChart, Area,
} from 'recharts';
import { useMarketStats } from '@/hooks/useREC';
import { formatMWh, formatXLM } from '@/lib/utils';
import { BarChart3, TrendingUp, Globe, Zap, Loader2 } from 'lucide-react';

const MONTHLY_DATA = [
  { month: 'Jan', issued: 12400, traded: 8200, retired: 3100 },
  { month: 'Feb', issued: 15800, traded: 11200, retired: 4200 },
  { month: 'Mar', issued: 18300, traded: 13800, retired: 5800 },
  { month: 'Apr', issued: 22100, traded: 16300, retired: 7200 },
  { month: 'May', issued: 28400, traded: 19800, retired: 9100 },
  { month: 'Jun', issued: 31200, traded: 24100, retired: 11400 },
  { month: 'Jul', issued: 35800, traded: 28600, retired: 13200 },
  { month: 'Aug', issued: 42100, traded: 33200, retired: 16800 },
  { month: 'Sep', issued: 38700, traded: 30100, retired: 14200 },
  { month: 'Oct', issued: 44500, traded: 35800, retired: 18100 },
  { month: 'Nov', issued: 49200, traded: 39400, retired: 20600 },
  { month: 'Dec', issued: 52800, traded: 43100, retired: 23200 },
];

const ENERGY_PIE = [
  { name: 'Solar', value: 38, color: '#F59E0B' },
  { name: 'Wind', value: 29, color: '#3B82F6' },
  { name: 'Hydro', value: 18, color: '#06B6D4' },
  { name: 'Biomass', value: 10, color: '#10B981' },
  { name: 'Geothermal', value: 5, color: '#EF4444' },
];

const PRICE_DATA = [
  { date: 'Jan 1', price: 4.2 },
  { date: 'Jan 15', price: 4.8 },
  { date: 'Feb 1', price: 5.1 },
  { date: 'Feb 15', price: 4.9 },
  { date: 'Mar 1', price: 5.6 },
  { date: 'Mar 15', price: 6.2 },
  { date: 'Apr 1', price: 5.8 },
  { date: 'Apr 15', price: 6.5 },
  { date: 'May 1', price: 7.1 },
  { date: 'May 15', price: 7.8 },
  { date: 'Jun 1', price: 8.2 },
  { date: 'Jun 15', price: 8.9 },
];

const REGION_DATA = [
  { region: 'North America', mwh: 58400, producers: 412 },
  { region: 'Europe', mwh: 34200, producers: 289 },
  { region: 'Asia Pacific', mwh: 28100, producers: 198 },
  { region: 'Latin America', mwh: 14800, producers: 134 },
  { region: 'Middle East', mwh: 7300, producers: 64 },
];

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e2f4ee', marginBottom: 4 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 14, color: '#7fb3a0' }}>{subtitle}</p>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useMarketStats();

  const metrics = [
    { 
      label: 'Total MWh Issued', 
      value: stats ? formatMWh(stats.totalMwhIssued) : '...', 
      trend: '+12.4%', 
      icon: Zap, 
      color: '#10b981' 
    },
    { 
      label: 'Total MWh Retired', 
      value: stats ? formatMWh(stats.totalMwhRetired) : '...', 
      trend: '+18.2%', 
      icon: Globe, 
      color: '#8B5CF6' 
    },
    { 
      label: 'Market Volume', 
      value: stats ? formatXLM(stats.totalVolumeStroops) : '...', 
      trend: '+2.1%', 
      icon: TrendingUp, 
      color: '#F59E0B' 
    },
    { 
      label: 'Active Producers', 
      value: stats ? stats.totalProducers.toString() : '...', 
      trend: '+6.8%', 
      icon: BarChart3, 
      color: '#3B82F6' 
    },
  ];

  return (
    <AppShell>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 6,
            }}
          >
            <BarChart3 size={24} color="#10b981" />
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e2f4ee' }}>
              Analytics
            </h1>
            {isLoading && <Loader2 size={16} className="animate-spin text-[#4a7a66]" />}
          </div>
          <p style={{ color: '#7fb3a0', fontSize: 15 }}>
            Marketplace metrics, trading volume, and energy source breakdown
          </p>
        </div>

        {/* Key Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 36,
          }}
        >
          {metrics.map((m, i) => (
            <div key={i} className="glass-card" style={{ padding: 24 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: `${m.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <m.icon size={18} color={m.color} />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#10b981',
                    background: 'rgba(16,185,129,0.1)',
                    padding: '3px 8px',
                    borderRadius: 8,
                  }}
                >
                  {m.trend}
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#e2f4ee', marginBottom: 4 }}>
                {m.value}
              </div>
              <div style={{ fontSize: 13, color: '#4a7a66' }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Monthly Volume Chart */}
        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
          <SectionHeader
            title="Monthly REC Volume (MWh)"
            subtitle="Issued, traded, and retired certificates over time"
          />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={MONTHLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.07)" />
              <XAxis dataKey="month" tick={{ fill: '#4a7a66', fontSize: 12 }} />
              <YAxis tick={{ fill: '#4a7a66', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(8,20,32,0.95)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: 10,
                  color: '#e2f4ee',
                }}
              />
              <Legend wrapperStyle={{ color: '#7fb3a0', fontSize: 13 }} />
              <Bar dataKey="issued" name="Issued" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="traded" name="Traded" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="retired" name="Retired" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Two Column Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Energy Source Breakdown */}
          <div className="glass-card" style={{ padding: 28 }}>
            <SectionHeader title="Energy Source Mix" />
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={ENERGY_PIE}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {ENERGY_PIE.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(8,20,32,0.95)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: 10,
                    color: '#e2f4ee',
                  }}
                  formatter={(value: any) => [`${value}%`, '']}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#7fb3a0', fontSize: 13 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Price History */}
          <div className="glass-card" style={{ padding: 28 }}>
            <SectionHeader title="Average REC Price (XLM)" />
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={PRICE_DATA}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.07)" />
                <XAxis dataKey="date" tick={{ fill: '#4a7a66', fontSize: 11 }} />
                <YAxis tick={{ fill: '#4a7a66', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(8,20,32,0.95)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: 10,
                    color: '#e2f4ee',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#priceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Breakdown */}
        <div className="glass-card" style={{ padding: 28 }}>
          <SectionHeader title="Regional Distribution" subtitle="RECs by geography" />
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Region</th>
                  <th>MWh Issued</th>
                  <th>Producers</th>
                  <th>Market Share</th>
                </tr>
              </thead>
              <tbody>
                {REGION_DATA.map((r, i) => {
                  const total = REGION_DATA.reduce((s, x) => s + x.mwh, 0);
                  const pct = ((r.mwh / total) * 100).toFixed(1);
                  return (
                    <tr key={i}>
                      <td style={{ color: '#e2f4ee', fontWeight: 500 }}>{r.region}</td>
                      <td>{r.mwh.toLocaleString()} MWh</td>
                      <td>{r.producers}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              height: 6,
                              width: 120,
                              background: 'rgba(16,185,129,0.1)',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${pct}%`,
                                background: '#10b981',
                                borderRadius: 3,
                              }}
                            />
                          </div>
                          <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600 }}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
