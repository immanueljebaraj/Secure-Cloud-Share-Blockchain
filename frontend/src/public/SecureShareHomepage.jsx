// src/public/SecureShareHomepage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/PublicPages.css';

const AUDIT_ROWS = [
  { action: 'UPLOAD',   hash: '0xa3f8…c219', time: '2s ago' },
  { action: 'REQUEST',  hash: '0x71bd…e804', time: '14s ago' },
  { action: 'APPROVE',  hash: '0xc94e…1f37', time: '31s ago' },
  { action: 'DOWNLOAD', hash: '0x2e6a…b055', time: '1m ago' },
];

const FEATURES = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>,
    title: 'SHA-256 Integrity Verification',
    body: 'Every file is cryptographically fingerprinted on upload. Any tampering is instantly detectable — the hash stored on-chain never matches a modified file.',
    delay: '0s',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"/><path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"/><path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"/></svg>,
    title: 'Immutable Blockchain Audit Trail',
    body: 'Every upload, access request, approval, and download is logged on Ethereum via a Solidity smart contract. Records cannot be altered or deleted — ever.',
    delay: '0.05s',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>,
    title: 'Consent-Based Access Control',
    body: 'Vendors submit reason-attached requests. Only the file owner can approve. No link forwarding, no guessing — every download is explicitly authorized.',
    delay: '0.1s',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>,
    title: 'Time-Limited Pre-Signed URLs',
    body: 'Approved downloads expire automatically. Links become invalid after a configurable TTL — preventing unauthorized reuse after sharing.',
    delay: '0.15s',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>,
    title: 'Role-Based Access Control',
    body: 'Owners and vendors have strictly separated capabilities enforced at the API layer. Vendors cannot approve their own requests.',
    delay: '0.2s',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd"/></svg>,
    title: 'Off-Chain File Storage',
    body: 'Files live in MinIO / Amazon S3 — not on-chain. Only hashes and event metadata touch the blockchain, keeping costs low and performance high.',
    delay: '0.25s',
  },
];

const WORKFLOW = [
  { n: '01', title: 'Owner Uploads',    body: 'File is hashed, stored in cloud, and logged on-chain.' },
  { n: '02', title: 'Vendor Requests',  body: 'Vendor submits a reason-attached access request, logged on-chain.' },
  { n: '03', title: 'Owner Approves',   body: 'Owner reviews and approves. A time-limited pre-signed URL is generated.' },
  { n: '04', title: 'Vendor Downloads', body: 'Vendor downloads via the expiring link. Download is logged on-chain.' },
];

const ARCH_LAYERS = [
  { color: '#00B4D8', bg: 'rgba(0,180,216,0.1)',   name: 'React Frontend',      desc: 'Owner & vendor portals with role-based routing and real-time blockchain status', tech: 'React + Vite' },
  { color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', name: 'Spring Boot API',     desc: 'RESTful backend handling auth, file ops, consent validation, and URL generation', tech: 'Java 17 + JWT' },
  { color: '#00C9A7', bg: 'rgba(0,201,167,0.1)',   name: 'MySQL / PostgreSQL',  desc: 'Operational metadata — users, file records, access requests, expiry parameters', tech: 'Spring Data JPA' },
  { color: '#FFB347', bg: 'rgba(255,179,71,0.1)',  name: 'Ethereum Blockchain', desc: 'Solidity smart contract logs every file event as an immutable on-chain record', tech: 'Hardhat + Web3j' },
  { color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',  name: 'MinIO / Amazon S3',   desc: 'S3-compatible object storage — files accessed only via consent-gated pre-signed URLs', tech: 'AWS SDK compat.' },
];

const COMPARISON = [
  { feature: 'Immutable Audit Logs',     gdrive: false,     dropbox: false,     proposed: true },
  { feature: 'Consent-Based Access',     gdrive: false,     dropbox: false,     proposed: true },
  { feature: 'Time-Limited Links',       gdrive: 'partial', dropbox: 'partial', proposed: true },
  { feature: 'SHA-256 Integrity',        gdrive: false,     dropbox: false,     proposed: true },
  { feature: 'Decentralised Trust',      gdrive: false,     dropbox: false,     proposed: true },
  { feature: 'Role-Based Access (RBAC)', gdrive: 'partial', dropbox: 'partial', proposed: true },
  { feature: 'Non-Repudiation',          gdrive: false,     dropbox: false,     proposed: true },
  { feature: 'Off-Chain File Storage',   gdrive: true,      dropbox: true,      proposed: true },
];

const Cell = ({ v }) =>
  v === true    ? <span className="check">✓</span> :
  v === false   ? <span className="cross">✗</span> :
                  <span className="partial">~</span>;

export default function SecureShareHomepage() {
  const navigate = useNavigate();
  useEffect(() => { document.title = 'SecureShare — Blockchain-Secured File Sharing'; }, []);

  return (
    <div className="public-shell">

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="pub-nav">
        <div className="pub-nav-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00B4D8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span className="pub-nav-logo-text">SecureShare</span>
        </div>
        <div className="pub-nav-actions">
          <button className="pub-btn pub-btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
          <button className="pub-btn pub-btn-primary" onClick={() => navigate('/login')}>Get Started</button>
        </div>
      </nav>

      <div className="pub-content">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="hero-section">
          <div className="hero-glow-1" />
          <div className="hero-glow-2" />
          <div className="hero-inner">
            <div>
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-dot" />
                Blockchain-Integrated File Sharing
              </div>
              <h1 className="hero-title">
                Trust You Can{' '}
                <span className="hero-title-accent">Verify.</span>
                <br/>Not Just Claim.
              </h1>
              <p className="hero-body">
                SecureShare combines cloud storage with Ethereum blockchain logging
                to deliver consent-driven, tamper-proof file sharing for enterprises
                and their vendors — with a complete immutable audit trail for every action.
              </p>
              <div className="hero-actions">
                <button className="pub-btn pub-btn-primary pub-btn-large" onClick={() => navigate('/login')}>
                  Open Portal
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                </button>
                <button className="pub-btn pub-btn-outline pub-btn-large" onClick={() => navigate('/register')}>
                  Register
                </button>
              </div>
              <div className="hero-stats">
                <div><div className="hero-stat-value">&lt;105ms</div><div className="hero-stat-label">Upload latency (10MB)</div></div>
                <div><div className="hero-stat-value">SHA-256</div><div className="hero-stat-label">Integrity proof</div></div>
                <div><div className="hero-stat-value">8 / 8</div><div className="hero-stat-label">Security features</div></div>
              </div>
            </div>

            {/* Live audit panel */}
            <div className="hero-visual">
              <div className="hero-panel">
                <div className="hero-panel-header">
                  <div className="panel-dot" style={{ background: '#FF5F57' }} />
                  <div className="panel-dot" style={{ background: '#FEBC2E' }} />
                  <div className="panel-dot" style={{ background: '#28C840' }} />
                  <span style={{ marginLeft: 8, fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--text-muted)' }}>blockchain audit log — live</span>
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontFamily: 'IBM Plex Mono', color: 'var(--success)' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s ease infinite', display: 'inline-block' }} />
                    Chain Active
                  </span>
                </div>
                <div className="hero-panel-body">
                  {AUDIT_ROWS.map((row, i) => (
                    <div key={i} className="audit-row" style={{ animationDelay: `${i * 0.1 + 0.5}s` }}>
                      <span className={`audit-badge ${row.action}`}>{row.action}</span>
                      <span className="audit-row-hash">{row.hash}</span>
                      <span className="audit-row-verified">
                        <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                        verified
                      </span>
                      <span style={{ fontSize: 10, fontFamily: 'IBM Plex Mono', color: 'var(--text-muted)', marginLeft: 8 }}>{row.time}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 14, padding: '10px 0', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--text-muted)' }}>4 events · Ethereum Ganache</span>
                    <span style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--accent)' }}>View full log →</span>
                  </div>
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: -16, right: -16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'float 4s ease infinite' }}>
                <div style={{ fontSize: 9, fontFamily: 'IBM Plex Mono', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>SHA-256</div>
                <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--success)' }}>a3f8c219…e804b055</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', position: 'relative', zIndex: 1 }}>
          <div className="pub-section">
            <div className="section-label">Core Capabilities</div>
            <h2 className="section-title">Built for Enterprise Security,<br/>Not Just Convenience</h2>
            <p className="section-sub">Every feature addresses a specific gap in centralised file-sharing — from tamper-proof logs to consent-gated downloads.</p>
            <div className="features-grid">
              {FEATURES.map((f, i) => (
                <div key={i} className="feature-card" style={{ animationDelay: f.delay }}>
                  <div className="feature-icon-wrap">{f.icon}</div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-body">{f.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Workflow ──────────────────────────────────────────────────────── */}
        <div className="workflow-section">
          <div className="pub-section">
            <div className="section-label">How It Works</div>
            <h2 className="section-title">Consent-Driven Access,<br/>Immutably Recorded</h2>
            <div className="workflow-grid">
              {WORKFLOW.map((w, i) => (
                <div key={i} className="workflow-step" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="workflow-step-num">{w.n}</div>
                  <div className="workflow-step-title">{w.title}</div>
                  <div className="workflow-step-body">{w.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Architecture ──────────────────────────────────────────────────── */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="pub-section">
            <div className="arch-section-grid">
              <div>
                <div className="section-label">System Architecture</div>
                <h2 className="section-title">Five Layers.<br/>One Trust Model.</h2>
                <p className="section-sub" style={{ marginBottom: 20 }}>
                  A stratified architecture separates concerns cleanly — the blockchain handles
                  trust, the cloud handles scale, and the API layer enforces all security decisions.
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, fontFamily: 'IBM Plex Mono' }}>
                  Files never touch the blockchain. Only SHA-256 hashes and event metadata are
                  logged on-chain — keeping gas costs low while preserving full auditability.
                </p>
              </div>
              <div className="arch-stack">
                {ARCH_LAYERS.map((l, i) => (
                  <div key={i} className="arch-layer" style={{ animationDelay: `${i * 0.07}s` }}>
                    <div className="arch-layer-icon" style={{ background: l.bg, color: l.color }}>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"/><path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"/><path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"/></svg>
                    </div>
                    <div className="arch-layer-info">
                      <div className="arch-layer-name">{l.name}</div>
                      <div className="arch-layer-desc">{l.desc}</div>
                    </div>
                    <div className="arch-layer-tech">{l.tech}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Comparison ────────────────────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
          <div className="pub-section">
            <div className="section-label">Feature Comparison</div>
            <h2 className="section-title">What Others Don't Provide</h2>
            <p className="section-sub">SecureShare is the only system delivering all eight enterprise security features simultaneously.</p>
            <div className="table-scroll-wrap">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Google Drive</th>
                    <th>Dropbox</th>
                    <th className="highlight">SecureShare</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={i}>
                      <td>{row.feature}</td>
                      <td><Cell v={row.gdrive} /></td>
                      <td><Cell v={row.dropbox} /></td>
                      <td className="highlight"><Cell v={row.proposed} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: 12, fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono' }}>
              ✓ Fully supported · ~ Partial · ✗ Not supported · Source: IEEE paper, Sathyabama Institute
            </p>
          </div>
        </div>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <div style={{ position: 'relative', zIndex: 1, padding: '80px 0 0' }}>
          <div className="cta-banner">
            <div className="section-label" style={{ justifyContent: 'center' }}>Get Started</div>
            <h2 className="cta-title">Ready to share files with verifiable trust?</h2>
            <p className="cta-sub">Sign in to the owner or vendor portal and experience blockchain-backed file sharing.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="pub-btn pub-btn-primary pub-btn-large" onClick={() => navigate('/login')}>Sign In</button>
              <button className="pub-btn pub-btn-ghost pub-btn-large" onClick={() => navigate('/register')}>Create Account</button>
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <footer className="pub-footer">
          <div className="footer-logo-text">SecureShare</div>
          <div className="footer-copy">Cloud-Based Secure File Sharing with Blockchain-Based Immutable Logging</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono' }}>Sathyabama Institute of Science and Technology</div>
        </footer>
      </div>
    </div>
  );
}