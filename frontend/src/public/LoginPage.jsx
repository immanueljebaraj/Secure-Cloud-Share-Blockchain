// LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LoginPage.css';

// ─── Auth Logic (kept separate from JSX) ─────────────────────────────────────

const validateCredentials = (email) => {
  if (email === 'owner@secureshare.com') {
    return { isValid: true, role: 'OWNER', redirectPath: '/owner/dashboard' };
  }
  if (email === 'vendor@secureshare.com') {
    return { isValid: true, role: 'VENDOR', redirectPath: '/vendor/browse' };
  }
  return { isValid: false, role: null, redirectPath: null };
};

const storeAuthenticatedUser = (email, role) => {
  const user = {
    id: email,
    role,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem('secureShareUser', JSON.stringify(user));
};

const simulateNetworkDelay = () =>
  new Promise((resolve) => setTimeout(resolve, 800));

// ─── Component ────────────────────────────────────────────────────────────────

const LoginPage = () => {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);

  const navigate = useNavigate();

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setIsLoading(true);

    await simulateNetworkDelay();

    const validation = validateCredentials(email);

    if (validation.isValid) {
      storeAuthenticatedUser(email, validation.role);
      // isLoading intentionally left true — page is navigating away
      navigate(validation.redirectPath);
    } else {
      setError(
        'Invalid credentials. Use owner@secureshare.com or vendor@secureshare.com.'
      );
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setError('Password reset is not available in the demo version.');
  };

  const handleGoHome = (e) => {
    e.preventDefault();
    navigate('/');
  };

  const handleGoRegister = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="login-container">
      <div className="login-card-wrapper">
        <div className="login-card">

          {/* Logo and Header */}
          <div className="login-header">
            <div className="logo-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 5L8 10V20C8 28 13 35 20 37C27 35 32 28 32 20V10L20 5Z" fill="#0A1929" stroke="#2D9CDB" strokeWidth="2"/>
                <path d="M16 20L19 23L24 17" stroke="#2D9CDB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="20" r="12" stroke="#2D9CDB" strokeWidth="1.5" strokeDasharray="2 2"/>
              </svg>
            </div>
            <h1 className="login-title">SecureShare</h1>
            <p className="login-subtitle">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message" role="alert">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="#DC2626"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form" noValidate>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                type="email"
                id="email"
                className={`form-input ${error && !email ? 'input-error' : ''}`}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="password-header">
                <label htmlFor="password" className="form-label">Password</label>
              </div>
              <input
                type="password"
                id="password"
                className={`form-input ${error && !password ? 'input-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox-input"
                  disabled={isLoading}
                />
                <span className="checkbox-label">Remember me</span>
              </label>
              <a href="#" className="forgot-link" onClick={handleForgotPassword}>
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`signin-button ${isLoading ? 'button-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Demo Hint */}
          <div className="demo-hint">
            <p>Demo: owner@secureshare.com &nbsp;/&nbsp; vendor@secureshare.com</p>
          </div>

          {/* Register prompt */}
          <div className="register-prompt">
            <span>Don&apos;t have an account? </span>
            <a href="/register" className="register-link" onClick={handleGoRegister}>
              Request access
            </a>
          </div>

          {/* Back to Home */}
          <div className="back-home">
            <a href="/" className="back-home-link" onClick={handleGoHome}>
              ← Back to Home
            </a>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="login-footer">
        <p className="copyright">© 2025 SecureShare. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LoginPage;