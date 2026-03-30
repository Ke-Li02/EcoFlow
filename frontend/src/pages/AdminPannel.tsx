import { useEffect, useState } from "react";
import "../adminpannel.css";
 
// ─── Types ───────────────────────────────────────────────────────────────────
 
interface Stat {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  accent: string;
}
 
// ─── Constants ────────────────────────────────────────────────────────────────
 
// Average CO2 saved per rental (kg) — based on substituting a personal car
// trip with a shared vehicle (generic industry estimate: ~4.6 kg CO2/rental)
const CO2_KG_PER_RENTAL = 4.6;
 
// ─── Mock data (replace with real API calls) ──────────────────────────────────
 
const MOCK = {
  totalUsers: 3_847,
  totalRentals: 12_509,
  totalRevenueCents: 1_438_720_00, // cents → $1 438 720.00
  providePageClicks: 2_134,
};
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
 
function formatRevenue(cents: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
 
function formatCO2(rentals: number): string {
  const kg = rentals * CO2_KG_PER_RENTAL;
  return kg >= 1_000
    ? `${(kg / 1_000).toFixed(2)} t`
    : `${kg.toFixed(0)} kg`;
}
 
function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-CA").format(n);
}
 
// ─── Sub-components ───────────────────────────────────────────────────────────
 
function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const [visible, setVisible] = useState(false);
 
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 90);
    return () => clearTimeout(t);
  }, [index]);
 
  return (
    <div
      className="stat-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 0.45s ease, transform 0.45s ease",
        borderLeft: `3px solid ${stat.accent}`,
      }}
    >
      <div className="stat-header">
        <span className="stat-icon" style={{ color: stat.accent }}>
          {stat.icon}
        </span>
        <span className="stat-label">{stat.label}</span>
      </div>
      <div className="stat-value">{stat.value}</div>
      {stat.sub && <div className="stat-sub">{stat.sub}</div>}
    </div>
  );
}
 
function GatewayCard({
  clicks,
  totalUsers,
}: {
  clicks: number;
  totalUsers: number;
}) {
  const [visible, setVisible] = useState(false);
  const pct = ((clicks / totalUsers) * 100).toFixed(1);
  const barWidth = Math.min((clicks / totalUsers) * 100, 100);
 
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, []);
 
  return (
    <div
      className="gateway-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <div className="gateway-header">
        <span className="gateway-title">Gateway Analytics</span>
        <span className="gateway-badge">LIVE</span>
      </div>
 
      <div className="gateway-row">
        <div className="gateway-endpoint">
          <span className="method">GET</span>
          <span className="path">/provide</span>
        </div>
        <div className="gateway-meta">
          <span className="gateway-metric-label">Unique clicks</span>
          <span className="gateway-metric-val">{formatNumber(clicks)}</span>
        </div>
      </div>
 
      <div className="bar-track">
        <div
          className="bar-fill"
          style={{
            width: visible ? `${barWidth}%` : "0%",
            transition: "width 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s",
          }}
        />
      </div>
      <div className="bar-legend">
        <span>{pct}% of registered users visited /provide</span>
        <span>{formatNumber(totalUsers - clicks)} haven't yet</span>
      </div>
    </div>
  );
}
 
// ─── Page ─────────────────────────────────────────────────────────────────────
 
export default function AdminPanel() {
  const co2Saved = formatCO2(MOCK.totalRentals);
 
  const stats: Stat[] = [
    {
      label: "Total Users",
      value: formatNumber(MOCK.totalUsers),
      sub: "registered accounts",
      icon: "👤",
      accent: "#60a5fa",
    },
    {
      label: "Rentals Listed",
      value: formatNumber(MOCK.totalRentals),
      sub: "all-time listings",
      icon: "🚗",
      accent: "#34d399",
    },
    {
      label: "Total Revenue",
      value: formatRevenue(MOCK.totalRevenueCents),
      sub: "gross platform revenue",
      icon: "💰",
      accent: "#fbbf24",
    },
    {
      label: "CO₂ Emissions Saved",
      value: co2Saved,
      sub: `est. ${CO2_KG_PER_RENTAL} kg saved per rental`,
      icon: "🌿",
      accent: "#a3e635",
    },
  ];
 
  return (
    <>
    
      <div className="admin-root">
        {/* Header */}
        <div className="admin-header">
          <div>
            <div className="admin-eyebrow">Admin Dashboard</div>
            <div className="admin-title">Platform Overview</div>
          </div>
          <div className="admin-timestamp">
            {new Date().toLocaleString("en-CA", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </div>
        </div>
 
        {/* KPI grid */}
        <div className="stats-grid">
          {stats.map((s, i) => (
            <StatCard key={s.label} stat={s} index={i} />
          ))}
        </div>
 
        {/* Gateway analytics */}
        <GatewayCard
          clicks={MOCK.providePageClicks}
          totalUsers={MOCK.totalUsers}
        />
      </div>
    </>
  );
}
 