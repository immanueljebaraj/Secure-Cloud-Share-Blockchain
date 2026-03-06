// src/public/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/PublicPages.css';

const ROLE_ID_MAP = {
  'owner@secureshare.com':  1,
  'vendor@secureshare.com': 2,
};

const validateCredentials = (email) => {
  if (email === 'owner@secureshare.com')  return { isValid: true, role: 'OWNER',  redirectPath: '/owner/dashboard' };
  if (email === 'vendor@secureshare.com') return { isValid: true, role: 'VENDOR', redirectPath: '/vendor/browse' };
  return { isValid: false, role: null, redirectPath: null };
};

const storeAuthenticatedUser = (email, role) => {
  const user = {
    id:    ROLE_ID_MAP[email],
    email,
    role,
    loggedInAt: new Date().toISOString(),
  };
  sessionStorage.setItem('secureShareUser', JSON.stringify(user));
};

export default function LoginPage() {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => { document.title = 'SecureShare — Sign In'; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const { isValid, role, redirectPath } = validateCredentials(email);
    if (!isValid) {
      setError('Invalid credentials. Use the demo accounts below.');
      setLoading(false);
      return;
    }
    storeAuthenticatedUser(email, role);
    navigate(redirectPath, { replace: true });
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo1234');
    setError('');
  };

  return (
    <div className="auth-shell">

      {/* ── Left brand panel ────────────────────────────────────────────── */}
      <div className="auth-left">
        <div className="auth-left-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00B4D8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span className="auth-left-logo-text">SecureShare</span>
        </div>

        <div className="auth-left-content">
          <h2 className="auth-left-title">
            Every action.<br/>
            Immutably recorded.
          </h2>
          <p className="auth-left-body">
            Sign in to access your portal. File uploads, access approvals, and downloads
            are all cryptographically logged on the Ethereum blockchain.
          </p>
          <div className="auth-trust-items">
            {[
              'SHA-256 integrity on every file',
              'Consent-gated pre-signed download URLs',
              'Immutable Ethereum audit trail',
              'Role-isolated tab sessions',
            ].map((t, i) => (
              <div key={i} className="auth-trust-item">
                <span className="auth-trust-dot" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="auth-left-footer">
          Sathyabama Institute of Science and Technology
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-box">
          <h1 className="auth-form-title">Welcome back</h1>
          <p className="auth-form-sub">Sign in to your Owner or Vendor portal</p>

          {/* Demo credentials */}
          <div className="demo-creds">
            <div className="demo-creds-title">Demo Accounts — click to fill</div>
            {[
              { email: 'owner@secureshare.com',  role: 'OWNER' },
              { email: 'vendor@secureshare.com', role: 'VENDOR' },
            ].map((d) => (
              <div key={d.email} className="demo-cred-row" style={{ cursor: 'pointer', padding: '5px 0', borderRadius: 4, transition: 'opacity 0.15s' }} onClick={() => fillDemo(d.email)}>
                <span className="demo-cred-label">{d.email}</span>
                <span className="demo-cred-role">{d.role}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="form-error">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className={`form-input ${error ? 'error' : ''}`}
                type="email"
                placeholder="you@secureshare.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-wrap">
                <input
                  className={`form-input ${error ? 'error' : ''}`}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                />
                <button type="button" className="form-input-icon" onClick={() => setShowPass(v => !v)}>
                  {showPass
                    ? <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
                  }
                </button>
              </div>
            </div>

            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? <><div className="spinner" />Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <div className="auth-link-row">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one</Link>
          </div>
          <div className="auth-link-row" style={{ marginTop: 8 }}>
            <Link to="/" className="auth-link" style={{ color: 'var(--text-muted)', fontSize: 12 }}>← Back to homepage</Link>
          </div>
        </div>
      </div>
    </div>
  );
}