import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';

// ─── Inline SVG Icons ──────────────────────────────────────────────────────────
const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconEye = ({ off }) => off ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// ─── Animated grid background ─────────────────────────────────────────────────
const GridCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const gap = 48;
      ctx.strokeStyle = 'rgba(255,255,255,0.035)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += gap) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += gap) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      // Moving highlight dots at grid intersections
      const dots = [[2,3],[5,1],[8,4],[3,7],[6,2],[10,5],[1,9],[7,6]];
      dots.forEach(([gx, gy], i) => {
        const px = gx * gap;
        const py = gy * gap + Math.sin(t * 0.4 + i * 1.3) * 12;
        const alpha = 0.15 + 0.1 * Math.sin(t * 0.6 + i);
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${alpha})`;
        ctx.fill();
      });
      t++;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}} />;
};

// ─── Stat ticker ─────────────────────────────────────────────────────────────
const Ticker = ({ value, label }) => {
  const [count, setCount] = useState(0);
  const target = parseFloat(value);
  const isFloat = value.includes('.');
  useEffect(() => {
    let start = null;
    const duration = 1800;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(isFloat ? (ease * target).toFixed(1) : Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);
  return (
    <div style={{textAlign:'center'}}>
      <div className="stat-val">{count}{value.replace(/[\d.]/g,'')}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Register = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { register: registerApi, user, loading } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      await registerApi(data.full_name, data.email, data.password);
      navigate("/dashboard");
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.detail || 'Registration failed. Please try again.';
      setApiError(message);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        :root {
          --ink: #f5f3ef;
          --ink2: rgba(245,243,239,0.55);
          --ink3: rgba(245,243,239,0.28);
          --bg: #0c0b0f;
          --bg2: #12111a;
          --bg3: rgba(255,255,255,0.04);
          --violet: #a78bfa;
          --violet2: #7c3aed;
          --violet3: rgba(124,58,237,0.18);
          --rose: #f9a8d4;
          --border: rgba(255,255,255,0.08);
          --border-focus: rgba(167,139,250,0.5);
          --red: #fca5a5;
          --red-bg: rgba(239,68,68,0.07);
          --red-border: rgba(239,68,68,0.18);
        }

        .lx-root {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          font-family: 'Geist', sans-serif;
          overflow: hidden;
          position: relative;
          color: var(--ink);
        }

        /* ── Noise texture overlay ── */
        .lx-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.028;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Gradient mesh ── */
        .lx-mesh {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .lx-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
        }
        .lx-glow-1 {
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(109,40,217,0.22) 0%, transparent 65%);
          top: -200px; left: -150px;
        }
        .lx-glow-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(219,39,119,0.1) 0%, transparent 65%);
          bottom: -100px; right: 200px;
        }
        .lx-glow-3 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%);
          top: 40%; right: -80px;
        }

        /* ── Left panel ── */
        .lx-left {
          display: none;
          flex: 1;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 60px;
          position: relative;
          z-index: 1;
          overflow: hidden;
        }
        @media(min-width:1024px){.lx-left{display:flex}}

        .lx-wordmark {
          display: flex;
          align-items: center;
          gap: 11px;
          text-decoration: none;
        }
        .lx-logomark {
          width: 36px; height: 36px;
          background: linear-gradient(145deg, #7c3aed, #a78bfa);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          box-shadow: 0 0 28px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .lx-logomark svg { width: 18px; height: 18px; }
        .lx-wordmark-name {
          font-family: 'Geist', sans-serif;
          font-size: 17px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.4px;
        }
        .lx-wordmark-name em {
          font-style: normal;
          color: var(--violet);
        }

        /* ── Hero copy ── */
        .lx-hero {
          max-width: 460px;
        }
        .lx-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
        }
        .lx-eyebrow-line {
          width: 28px;
          height: 1px;
          background: var(--violet);
          opacity: 0.7;
        }
        .lx-eyebrow-text {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--violet);
          opacity: 0.85;
        }

        .lx-headline {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(40px, 4vw, 58px);
          font-weight: 400;
          color: var(--ink);
          line-height: 1.08;
          letter-spacing: -1.5px;
          margin-bottom: 20px;
        }
        .lx-headline em {
          font-style: italic;
          background: linear-gradient(110deg, #a78bfa 10%, #f9a8d4 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lx-body {
          font-size: 15px;
          line-height: 1.75;
          color: var(--ink2);
          max-width: 360px;
          font-weight: 300;
        }

        /* ── Feature list ── */
        .lx-features {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 40px;
        }
        .lx-feature {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: var(--ink3);
          font-weight: 400;
        }
        .lx-feature-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--violet);
          opacity: 0.6;
          flex-shrink: 0;
        }

        /* ── Stats row ── */
        .lx-stats {
          display: flex;
          gap: 0;
          border-top: 1px solid var(--border);
          padding-top: 32px;
        }
        .lx-stat {
          flex: 1;
          padding: 0 24px;
          border-right: 1px solid var(--border);
        }
        .lx-stat:first-child { padding-left: 0; }
        .lx-stat:last-child { border-right: none; }
        .stat-val {
          font-family: 'Instrument Serif', serif;
          font-size: 30px;
          letter-spacing: -1px;
          color: var(--ink);
          font-weight: 400;
        }
        .stat-label {
          font-size: 11px;
          color: var(--ink3);
          margin-top: 2px;
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        /* ── Right / form panel ── */
        .lx-right {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          z-index: 1;
        }
        @media(min-width:1024px){
          .lx-right {
            width: 500px;
            flex: none;
            padding: 48px 52px;
            border-left: 1px solid var(--border);
          }
        }

        .lx-form-wrap {
          width: 100%;
          max-width: 420px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1);
        }
        .lx-form-wrap.in {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Mobile logo ── */
        .lx-mobile-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
        }
        @media(min-width:1024px){.lx-mobile-logo{display:none}}

        /* ── Section header ── */
        .lx-form-title {
          font-family: 'Instrument Serif', serif;
          font-size: 32px;
          font-weight: 400;
          color: var(--ink);
          letter-spacing: -0.8px;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .lx-form-sub {
          font-size: 13.5px;
          color: var(--ink2);
          margin-bottom: 32px;
          font-weight: 300;
        }

        /* ── Error ── */
        .lx-error {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          background: var(--red-bg);
          border: 1px solid var(--red-border);
          border-radius: 10px;
          padding: 13px 15px;
          margin-bottom: 24px;
          animation: errIn 0.3s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes errIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .lx-error svg { width: 15px; height: 15px; color: var(--red); flex-shrink: 0; margin-top: 1px; }
        .lx-error-title { font-size: 12px; font-weight: 600; color: var(--red); margin-bottom: 2px; letter-spacing: 0.1px; }
        .lx-error-msg { font-size: 12.5px; color: rgba(252,165,165,0.8); }

        /* ── Fields ── */
        .lx-fields { display: flex; flex-direction: column; gap: 18px; }

        .lx-field-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--ink3);
          margin-bottom: 8px;
        }

        .lx-input-shell {
          position: relative;
        }
        .lx-input-pfx {
          position: absolute;
          left: 15px; top: 50%; transform: translateY(-50%);
          width: 15px; height: 15px;
          color: var(--ink3);
          pointer-events: none;
          transition: color 0.2s;
        }
        .lx-input-pfx.lit { color: var(--violet); }

        .lx-input {
          width: 100%;
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 13px 15px 13px 43px;
          font-family: 'Geist', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: var(--ink);
          outline: none;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
        }
        .lx-input::placeholder { color: rgba(245,243,239,0.18); }
        .lx-input:focus {
          background: rgba(124,58,237,0.06);
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1), 0 1px 3px rgba(0,0,0,0.3);
        }
        .lx-input.err { border-color: var(--red-border); }
        .lx-input.err:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
        .lx-input.padend { padding-right: 43px; }

        .lx-eye-btn {
          position: absolute;
          right: 13px; top: 50%; transform: translateY(-50%);
          width: 16px; height: 16px;
          background: none; border: none; padding: 0; cursor: pointer;
          color: var(--ink3);
          display: flex; align-items: center;
          transition: color 0.15s;
        }
        .lx-eye-btn:hover { color: var(--ink2); }
        .lx-eye-btn svg { width: 15px; height: 15px; }

        .lx-field-err {
          margin-top: 6px;
          font-size: 11.5px;
          color: var(--red);
          display: flex; align-items: center; gap: 5px;
          font-weight: 400;
        }
        .lx-field-err::before {
          content: '';
          width: 3px; height: 3px;
          border-radius: 50%;
          background: currentColor;
          flex-shrink: 0;
        }

        /* ── CTA button ── */
        .lx-cta {
          margin-top: 28px;
          width: 100%;
          position: relative;
          padding: 14px 20px;
          background: linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #a855f7 100%);
          border: none; border-radius: 10px;
          font-family: 'Geist', sans-serif;
          font-size: 14px; font-weight: 500;
          color: #fff;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
          box-shadow: 0 1px 0 rgba(255,255,255,0.12) inset, 0 6px 24px rgba(124,58,237,0.35);
          letter-spacing: -0.1px;
          overflow: hidden;
        }
        .lx-cta::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg, rgba(0,0,0,0.15) 0%, transparent 60%);
        }
        .lx-cta:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 1px 0 rgba(255,255,255,0.12) inset, 0 12px 32px rgba(124,58,237,0.45);
        }
        .lx-cta:active:not(:disabled) { transform: translateY(0); }
        .lx-cta:disabled { opacity: 0.5; cursor: not-allowed; }
        .lx-cta-label { position: relative; z-index: 1; display: flex; align-items: center; gap: 9px; }
        .lx-cta-arrow { width: 15px; height: 15px; transition: transform 0.18s; }
        .lx-cta:hover .lx-cta-arrow { transform: translateX(3px); }

        /* ── Spinner ── */
        .lx-spin {
          width: 17px; height: 17px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.55s linear infinite;
        }
        @keyframes spin{to{transform:rotate(360deg)}}

        /* ── Footer ── */
        .lx-footer {
          margin-top: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .lx-divider {
          display: flex; align-items: center; gap: 12px;
        }
        .lx-div-line { flex: 1; height: 1px; background: var(--border); }
        .lx-div-text { font-size: 11px; color: var(--ink3); letter-spacing: 0.5px; }

        .lx-register {
          text-align: center;
          font-size: 13px;
          color: var(--ink3);
        }
        .lx-register-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'Geist', sans-serif;
          font-size: 13px; font-weight: 500;
          color: var(--violet);
          padding: 0; margin-left: 5px;
          transition: opacity 0.15s;
        }
        .lx-register-btn:hover { opacity: 0.8; }

        /* ── Left panel animation ── */
        .lx-left-inner {
          opacity: 0;
          transform: translateX(-16px);
          transition: opacity 0.7s 0.1s cubic-bezier(0.16,1,0.3,1), transform 0.7s 0.1s cubic-bezier(0.16,1,0.3,1);
        }
        .lx-left-inner.in { opacity: 1; transform: translateX(0); }
      `}</style>

      <div className="lx-root">
        <div className="lx-mesh">
          <div className="lx-glow lx-glow-1" />
          <div className="lx-glow lx-glow-2" />
          <div className="lx-glow lx-glow-3" />
        </div>

        {/* Left panel */}
        <div className="lx-left">
          <GridCanvas />
          <div className={`lx-left-inner ${mounted ? 'in' : ''}`} style={{display:'flex',flexDirection:'column',justifyContent:'space-between',height:'100%',position:'relative',zIndex:1}}>
            <div className="lx-wordmark">
              <div className="lx-logomark"><IconBox /></div>
              <span className="lx-wordmark-name">Invent<em>rix</em></span>
            </div>

            <div className="lx-hero">
              <div className="lx-eyebrow">
                <div className="lx-eyebrow-line" />
                <span className="lx-eyebrow-text">Inventory Management</span>
              </div>
              <h1 className="lx-headline">
                The&nbsp;<em>smarter</em><br />way to manage<br />your stock.
              </h1>
              <p className="lx-body">
                Track products, forecast demand, and coordinate your supply chain — all from one beautifully unified workspace.
              </p>
              <div className="lx-features">
                {['Real-time stock visibility across all locations', 'Automated low-stock alerts and reorder triggers', 'Supplier performance analytics and history'].map(f => (
                  <div className="lx-feature" key={f}>
                    <div className="lx-feature-dot" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lx-stats">
              {[
                { value: '99.9%', label: 'Uptime SLA' },
                { value: '50k+', label: 'SKUs tracked' },
                { value: '12ms', label: 'Response time' },
              ].map(s => (
                <div className="lx-stat" key={s.label}>
                  <Ticker value={s.value} label={s.label} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="lx-right">
          <div className={`lx-form-wrap ${mounted ? 'in' : ''}`}>

            <div className="lx-mobile-logo">
              <div className="lx-logomark" style={{width:30,height:30,borderRadius:8}}>
                <IconBox />
              </div>
              <span className="lx-wordmark-name" style={{fontSize:15}}>Invent<em>rix</em></span>
            </div>

            <div className="lx-form-title">Create workspace.</div>
            <div className="lx-form-sub">Sign up for the administrative portal</div>

            {apiError && (
              <div className="lx-error">
                <IconAlert />
                <div>
                  <div className="lx-error-title">Registration failed</div>
                  <div className="lx-error-msg">{apiError}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="lx-fields">
                {/* Full Name */}
                <div>
                  <label className="lx-field-label">Full Name</label>
                  <div className="lx-input-shell">
                    <span className={`lx-input-pfx ${focused === 'full_name' ? 'lit' : ''}`}>
                      <IconUser />
                    </span>
                    <input
                      type="text"
                      {...register('full_name', {
                        required: 'Full name is required',
                        minLength: { value: 3, message: 'Name must be at least 3 characters' }
                      })}
                      className={`lx-input${errors.full_name ? ' err' : ''}`}
                      placeholder="John Doe"
                      onFocus={() => setFocused('full_name')}
                      onBlur={() => setFocused('')}
                    />
                  </div>
                  {errors.full_name && <div className="lx-field-err">{errors.full_name.message}</div>}
                </div>

                {/* Email */}
                <div>
                  <label className="lx-field-label">Email</label>
                  <div className="lx-input-shell">
                    <span className={`lx-input-pfx ${focused === 'email' ? 'lit' : ''}`}>
                      <IconMail />
                    </span>
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' }
                      })}
                      className={`lx-input${errors.email ? ' err' : ''}`}
                      placeholder="you@company.com"
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused('')}
                    />
                  </div>
                  {errors.email && <div className="lx-field-err">{errors.email.message}</div>}
                </div>

                {/* Password */}
                <div>
                  <label className="lx-field-label">Password</label>
                  <div className="lx-input-shell">
                    <span className={`lx-input-pfx ${focused === 'password' ? 'lit' : ''}`}>
                      <IconLock />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' }
                      })}
                      className={`lx-input padend${errors.password ? ' err' : ''}`}
                      placeholder="••••••••••••"
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused('')}
                    />
                    <button
                      type="button"
                      className="lx-eye-btn"
                      onClick={() => setShowPassword(p => !p)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <IconEye off={showPassword} />
                    </button>
                  </div>
                  {errors.password && <div className="lx-field-err">{errors.password.message}</div>}
                </div>
              </div>

              <button type="submit" className="lx-cta" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="lx-spin" />
                ) : (
                  <span className="lx-cta-label">
                    Create Account
                    <IconArrow className="lx-cta-arrow" />
                  </span>
                )}
              </button>
            </form>

            <div className="lx-footer">
              <div className="lx-divider">
                <div className="lx-div-line" />
                <span className="lx-div-text">or</span>
                <div className="lx-div-line" />
              </div>
              <div className="lx-register">
                Already have an account?
                <button className="lx-register-btn" onClick={() => navigate('/login')}>Sign in</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
