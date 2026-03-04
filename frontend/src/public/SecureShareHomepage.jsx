// SecureShareHomepage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SecureShareHomepage.css';

const SecureShareHomepage = () => {
  const navigate = useNavigate();

  const handleLogin    = () => navigate('/login');
  const handleRegister = () => navigate('/register');

  return (
    <div className="secure-share">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">SecureShare</div>
          <div className="nav-buttons">
            <button className="btn btn-primary"  onClick={handleLogin}>Login</button>
            <button className="btn btn-outline"  onClick={handleRegister}>Register</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Secure, Transparent File Sharing Powered by Blockchain
          </h1>
          <p className="hero-subtitle">
            Enterprise-grade cloud storage with consent-driven access control
            and immutable blockchain audit logs for complete transparency.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-large" onClick={handleLogin}>
              Login to Continue
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="features">
        <div className="container">
          <div className="features-grid">

            <div className="feature-card">
              <div className="feature-icon">📁</div>
              <h3 className="feature-title">Secure Cloud Storage</h3>
              <p className="feature-description">
                AES-256 encrypted file storage with automatic backup and version
                history. Access your files anywhere, anytime.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3 className="feature-title">Blockchain-Based Audit Logging</h3>
              <p className="feature-description">
                Every access and action is permanently recorded on an immutable
                blockchain ledger for complete accountability.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3 className="feature-title">Owner-Approved Access Requests</h3>
              <p className="feature-description">
                Vendors request access, owners approve. Granular permission
                controls ensure files only reach authorized parties.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Architecture ───────────────────────────────────── */}
      <section className="architecture">
        <div className="container">
          <h2 className="section-title">Cloud for Storage. Blockchain for Trust.</h2>
          <div className="architecture-grid">

            <div className="architecture-panel cloud-panel">
              <div className="panel-header">
                <span className="panel-icon">☁️</span>
                <h3>Cloud Storage Layer</h3>
              </div>
              <ul className="panel-features">
                <li>Scalable AWS S3 / Google Cloud Storage</li>
                <li>Client-side encryption</li>
                <li>Automatic file versioning</li>
                <li>Geographic redundancy</li>
              </ul>
            </div>

            <div className="architecture-panel blockchain-panel">
              <div className="panel-header">
                <span className="panel-icon">⛓️</span>
                <h3>Blockchain Logging Layer</h3>
              </div>
              <ul className="panel-features">
                <li>Immutable audit trail on Hyperledger</li>
                <li>Timestamped access records</li>
                <li>Tamper-proof verification</li>
                <li>Smart contract-based permissions</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">SecureShare</div>
            <div className="footer-links">
              <a href="#privacy">Privacy</a>
              <a href="#security">Security</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="footer-copyright">
              © 2025 SecureShare. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default SecureShareHomepage;