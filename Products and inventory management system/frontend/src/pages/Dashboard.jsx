import React, { useState, useEffect, useRef } from 'react';
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';
import api from '../api/axios';

// ─── Animated counter ─────────────────────────────────────────────────────────
const Counter = ({ value, prefix = '', suffix = '', duration = 1200 }) => {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (value == null) return;
    const from = prev.current;
    const to = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    prev.current = to;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setDisplay(Math.round(from + (to - from) * ease));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  if (value == null) return null;
  if (typeof value === 'string' && value.startsWith('$')) {
    return <>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(display)}</>;
  }
  return <>{prefix}{display.toLocaleString()}{suffix}</>;
};

// ─── Spark bar ────────────────────────────────────────────────────────────────
const SparkBar = ({ pct, color }) => (
  <div style={{ height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1, marginTop: 10, overflow: 'hidden' }}>
    <div style={{
      height: '100%', width: `${pct}%`, borderRadius: 1,
      background: color,
      transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
    }} />
  </div>
);

// ─── Stock level bar ──────────────────────────────────────────────────────────
const StockBar = ({ qty, max = 20 }) => {
  const pct = Math.min((qty / max) * 100, 100);
  const color = qty <= 3 ? '#ef4444' : qty <= 8 ? '#f59e0b' : '#22c55e';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500, color, minWidth: 24 }}>{qty}</span>
      <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)', opacity: 0.8 }} />
      </div>
    </div>
  );
};

// ─── Metric card ─────────────────────────────────────────────────────────────
const MetricCard = ({ title, value, icon: Icon, iconColor, accentColor, delta, loading, index }) => (
  <div className="db-metric" style={{ '--accent': accentColor, animationDelay: `${index * 80}ms` }}>
    <div className="db-metric-top">
      <span className="db-metric-title">{title}</span>
      <div className="db-metric-icon" style={{ color: iconColor }}>
        <Icon size={15} strokeWidth={1.5} />
      </div>
    </div>
    <div className="db-metric-value">
      {loading
        ? <div className="db-skel" style={{ width: 80, height: 28, marginTop: 4 }} />
        : <Counter value={value} />
      }
    </div>
    {delta && !loading && (
      <div className="db-metric-delta">
        <span style={{ color: delta > 0 ? '#4ade80' : '#f87171' }}>
          {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}%
        </span>
        <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 5 }}>vs last month</span>
      </div>
    )}
    <SparkBar pct={loading ? 0 : Math.min((Number(value) / (Number(value) * 1.3)) * 100, 80)} color={accentColor} />
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        setData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v || 0);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const metrics = [
    { title: 'Total Products',    value: data?.total_products,        icon: Package,      iconColor: '#818cf8', accentColor: '#6366f1', delta: 4  },
    { title: 'Customers',         value: data?.total_customers,        icon: Users,        iconColor: '#34d399', accentColor: '#10b981', delta: 12 },
    { title: 'Orders',            value: data?.total_orders,           icon: ShoppingCart, iconColor: '#c084fc', accentColor: '#a855f7', delta: -3 },
    { title: 'Inventory Value',   value: loading ? null : formatCurrency(data?.total_inventory_value), icon: DollarSign, iconColor: '#fbbf24', accentColor: '#f59e0b', delta: 7 },
  ];

  if (error) return (
    <div className="db-error">
      <AlertTriangle size={16} />
      <span>{error}</span>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Sora:wght@300;400;500;600&display=swap');

        .db-root *,
        .db-root *::before,
        .db-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .db-root {
          font-family: 'Sora', sans-serif;
          color: rgba(245,243,239,0.88);
          min-height: 100vh;
          padding: 32px 36px 48px;
          background: #0d0c12;
          position: relative;
        }

        /* subtle scanline */
        .db-root::before {
          content: '';
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.06) 2px,
            rgba(0,0,0,0.06) 4px
          );
        }

        .db-root > * { position: relative; z-index: 1; }

        /* ── Header ── */
        .db-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 36px;
        }
        .db-header-left {}
        .db-page-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .db-page-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #6366f1;
          box-shadow: 0 0 8px #6366f1;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .db-page-eyebrow-text {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #6366f1;
        }
        .db-page-title {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 600;
          color: #f5f3ef;
          letter-spacing: -0.5px;
        }
        .db-page-sub {
          font-size: 12px;
          color: rgba(245,243,239,0.35);
          margin-top: 4px;
          font-weight: 300;
        }

        .db-clock {
          text-align: right;
        }
        .db-clock-time {
          font-family: 'DM Mono', monospace;
          font-size: 22px;
          font-weight: 400;
          color: rgba(245,243,239,0.9);
          letter-spacing: 1px;
          line-height: 1;
        }
        .db-clock-date {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: rgba(245,243,239,0.3);
          letter-spacing: 1.5px;
          margin-top: 5px;
          text-transform: uppercase;
        }

        /* ── Metrics grid ── */
        .db-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 28px;
        }
        @media(max-width:900px){ .db-metrics { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:560px){ .db-metrics { grid-template-columns: 1fr; } }

        .db-metric {
          background: #12111a;
          padding: 24px 26px;
          position: relative;
          opacity: 0;
          animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
          overflow: hidden;
        }
        .db-metric::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: var(--accent);
          opacity: 0.4;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .db-metric.visible::before,
        .db-metric::before { transform: scaleX(1); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        .db-metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .db-metric-title {
          font-size: 11px;
          font-weight: 400;
          color: rgba(245,243,239,0.4);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .db-metric-icon {
          width: 28px; height: 28px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
        }
        .db-metric-value {
          font-family: 'Sora', sans-serif;
          font-size: 26px;
          font-weight: 600;
          color: #f5f3ef;
          letter-spacing: -0.8px;
          line-height: 1;
          min-height: 32px;
        }
        .db-metric-delta {
          font-size: 11px;
          margin-top: 8px;
          font-weight: 400;
        }

        /* ── Skeleton ── */
        .db-skel {
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.05) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }
        @keyframes shimmer { from{background-position:200% 0} to{background-position:-200% 0} }

        /* ── Low stock section ── */
        .db-section {
          background: #12111a;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
        }

        .db-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.015);
        }
        .db-section-head-left {
          display: flex; align-items: center; gap: 10px;
        }
        .db-section-title {
          font-size: 13px;
          font-weight: 500;
          color: rgba(245,243,239,0.85);
          letter-spacing: -0.2px;
        }
        .db-badge {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 400;
          padding: 3px 10px;
          border-radius: 20px;
        }
        .db-badge-warn {
          background: rgba(245,158,11,0.12);
          border: 1px solid rgba(245,158,11,0.2);
          color: #fbbf24;
        }
        .db-badge-ok {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.2);
          color: #4ade80;
        }

        /* ── Table ── */
        .db-table-wrap { overflow-x: auto; }

        .db-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .db-table thead th {
          font-family: 'DM Mono', monospace;
          font-size: 9.5px;
          font-weight: 400;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(245,243,239,0.25);
          padding: 12px 24px;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          white-space: nowrap;
        }
        .db-table thead th:last-child { text-align: right; }

        .db-table tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .db-table tbody tr:last-child { border-bottom: none; }
        .db-table tbody tr:hover { background: rgba(255,255,255,0.025); }

        .db-table td {
          padding: 14px 24px;
          vertical-align: middle;
        }
        .db-td-name {
          font-weight: 500;
          color: rgba(245,243,239,0.88);
          font-size: 13px;
        }
        .db-td-sku {
          font-family: 'DM Mono', monospace;
          font-size: 11.5px;
          color: rgba(245,243,239,0.3);
          letter-spacing: 0.5px;
        }
        .db-td-status { text-align: right; }

        .db-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: 'DM Mono', monospace;
          font-size: 10.5px;
          padding: 4px 10px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }
        .db-chip-danger {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5;
        }
        .db-chip-warn {
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.2);
          color: #fcd34d;
        }
        .db-chip::before { content: '●'; font-size: 7px; }

        /* ── Empty & error ── */
        .db-empty {
          padding: 52px 24px;
          text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .db-empty-icon {
          width: 40px; height: 40px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(245,243,239,0.2);
          margin-bottom: 4px;
        }
        .db-empty p { font-size: 13px; color: rgba(245,243,239,0.35); font-weight: 300; }

        .db-error {
          display: flex; align-items: center; gap: 10px;
          padding: 16px 20px;
          background: rgba(239,68,68,0.07);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 10px;
          font-size: 13px;
          color: #fca5a5;
        }
      `}</style>

      <div className="db-root">
        {/* Header */}
        <div className="db-header">
          <div className="db-header-left">
            <div className="db-page-eyebrow">
              <div className="db-page-eyebrow-dot" />
              <span className="db-page-eyebrow-text">Live · Inventrix</span>
            </div>
            <div className="db-page-title">Overview</div>
            <div className="db-page-sub">Real-time inventory snapshot</div>
          </div>
          <div className="db-clock">
            <div className="db-clock-time">{timeStr}</div>
            <div className="db-clock-date">{dateStr}</div>
          </div>
        </div>

        {/* Metrics */}
        <div className="db-metrics">
          {metrics.map((m, i) => (
            <MetricCard key={m.title} {...m} loading={loading} index={i} />
          ))}
        </div>

        {/* Low stock table */}
        <div className="db-section">
          <div className="db-section-head">
            <div className="db-section-head-left">
              <AlertTriangle size={14} color="#f59e0b" strokeWidth={1.5} />
              <span className="db-section-title">Low Stock Alerts</span>
            </div>
            <span className={`db-badge ${loading || (data?.low_stock_products?.length || 0) > 0 ? 'db-badge-warn' : 'db-badge-ok'}`}>
              {loading ? '···' : `${data?.low_stock_products?.length || 0} items`}
            </span>
          </div>

          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(4).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td><div className="db-skel" style={{ height: 12, width: '60%' }} /></td>
                      <td><div className="db-skel" style={{ height: 12, width: '40%' }} /></td>
                      <td><div className="db-skel" style={{ height: 12, width: '70%' }} /></td>
                      <td className="db-td-status"><div className="db-skel" style={{ height: 22, width: 100, marginLeft: 'auto', borderRadius: 4 }} /></td>
                    </tr>
                  ))
                ) : data?.low_stock_products?.length > 0 ? (
                  data.low_stock_products.map((p) => (
                    <tr key={p.id}>
                      <td className="db-td-name">{p.name}</td>
                      <td className="db-td-sku">{p.sku}</td>
                      <td style={{ minWidth: 160 }}>
                        <StockBar qty={p.quantity_in_stock} />
                      </td>
                      <td className="db-td-status">
                        <span className={`db-chip ${p.quantity_in_stock <= 3 ? 'db-chip-danger' : 'db-chip-warn'}`}>
                          {p.quantity_in_stock <= 3 ? 'Critical' : 'Restock'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">
                      <div className="db-empty">
                        <div className="db-empty-icon"><Package size={18} strokeWidth={1.25} /></div>
                        <p style={{ fontWeight: 500, color: 'rgba(245,243,239,0.55)' }}>All levels healthy</p>
                        <p>No products are currently low on stock.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;