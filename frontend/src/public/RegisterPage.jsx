// src/public/RegisterPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/PublicPages.css';

export default function RegisterPage() {
  const [form,     setForm]     = useState({ name: '', email: '', password: '', confirm: '', role: '' });
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  useEffect(() => { document.title = 'SecureShare — Create Account'; }, []);

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.role) { setError('All fields are required.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    // In the demo system registration is informational — redirect to login
    navigate('/login');
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
            Join SecureShare.<br/>
            Two roles. One system.
          </h2>
          <p className="auth-left-body">
            Register as a file owner to upload, manage, and govern document access.
            Or as a vendor to browse and request files from collaborating organisations.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00B4D8' }} />
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: '#00B4D8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Owner</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                Upload files, approve or reject vendor access requests, and view the full blockchain audit log.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C9A7' }} />
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: '#00C9A7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vendor</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                Browse available files, submit access requests with a stated reason, and download approved files within their expiry window.
              </p>
            </div>
          </div>
        </div>

        <div className="auth-left-footer">
          Sathyabama Institute of Science and Technology
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-box">
          <h1 className="auth-form-title">Create account</h1>
          <p className="auth-form-sub">Fill in your details and select a role to get started</p>

          {error && (
            <div className="form-error">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={set('name')} autoComplete="name" />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} autoComplete="email" />
            </div>

            {/* Role selector */}
            <div className="form-group">
              <label className="form-label">Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {['OWNER', 'VENDOR'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setForm(f => ({ ...f, role: r })); setError(''); }}
                    style={{
                      padding: '11px 14px',
                      borderRadius: 'var(--radius)',
                      border: `1px solid ${form.role === r ? (r === 'OWNER' ? 'rgba(0,180,216,0.6)' : 'rgba(0,201,167,0.6)') : 'var(--border)'}`,
                      background: form.role === r ? (r === 'OWNER' ? 'rgba(0,180,216,0.1)' : 'rgba(0,201,167,0.1)') : 'var(--bg-input)',
                      color: form.role === r ? (r === 'OWNER' ? '#00B4D8' : '#00C9A7') : 'var(--text-muted)',
                      fontFamily: 'IBM Plex Mono',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {r === 'OWNER' ? '⬡ File Owner' : '⬡ Vendor'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-wrap">
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                />
                <button type="button" className="form-input-icon" onClick={() => setShowPass(v => !v)}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className={`form-input ${error.includes('match') ? 'error' : ''}`}
                type={showPass ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={set('confirm')}
                autoComplete="new-password"
              />
            </div>

            {/* Password strength indicator */}
            {form.password.length > 0 && (
              <div style={{ marginTop: -10, marginBottom: 16 }}>
                <div style={{ height: 3, borderRadius: 2, background: 'var(--bg-surface)', overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{
                    height: '100%', borderRadius: 2, transition: 'width 0.3s ease',
                    width: form.password.length >= 12 ? '100%' : form.password.length >= 8 ? '65%' : '30%',
                    background: form.password.length >= 12 ? 'var(--success)' : form.password.length >= 8 ? 'var(--warning)' : 'var(--danger)',
                  }} />
                </div>
                <span style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--text-muted)' }}>
                  {form.password.length >= 12 ? 'Strong' : form.password.length >= 8 ? 'Acceptable' : 'Too short'}
                </span>
              </div>
            )}

            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? <><div className="spinner" style={{ borderTopColor: '#000' }} />Creating account…</> : 'Create Account'}
            </button>
          </form>

          <div className="auth-link-row" style={{ marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </div>
          <div className="auth-link-row" style={{ marginTop: 8 }}>
            <Link to="/" className="auth-link" style={{ color: 'var(--text-muted)', fontSize: 12 }}>← Back to homepage</Link>
          </div>
        </div>
      </div>
    </div>
  );
}