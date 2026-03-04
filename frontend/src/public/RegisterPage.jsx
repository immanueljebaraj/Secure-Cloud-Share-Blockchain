// RegisterPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleBackToHome = (e) => {
    e.preventDefault();
    navigate('/');
  };

  const handleGoLogin = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="register-container">

      {/* Top Navigation */}
      <nav className="register-nav">
        <div className="nav-container">
          <div className="nav-logo" onClick={handleBackToHome} style={{ cursor: 'pointer' }}>
            SecureShare
          </div>
          <a href="/" className="back-link" onClick={handleBackToHome}>
            ← Back to Home
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="register-content">
        <div className="register-card-wrapper">
          <div className="register-card">

            {/* Header */}
            <div className="register-header">
              <div className="logo-icon">
                <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 5L8 10V20C8 28 13 35 20 37C27 35 32 28 32 20V10L20 5Z" fill="#0A1929" stroke="#2D9CDB" strokeWidth="2"/>
                  <path d="M16 20L19 23L24 17" stroke="#2D9CDB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="20" cy="20" r="12" stroke="#2D9CDB" strokeWidth="1.5" strokeDasharray="2 2"/>
                </svg>
              </div>
              <h1 className="register-title">Create an Account</h1>
              <p className="register-subtitle">
                User registration will be available in a future release.
              </p>
            </div>

            {/* Info Box */}
            <div className="info-box">
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="#2D9CDB"/>
                </svg>
              </div>
              <p className="info-text">
                SecureShare currently supports role-based demo access.
                Full account registration and authentication will be implemented soon.
              </p>
            </div>

            {/* Demo Access Info */}
            <div className="demo-access">
              <h3 className="demo-title">Demo Access Available:</h3>
              <div className="demo-credentials">
                <div className="credential-item">
                  <span className="credential-role">Owner:</span>
                  <code className="credential-email">owner@secureshare.com</code>
                </div>
                <div className="credential-item">
                  <span className="credential-role">Vendor:</span>
                  <code className="credential-email">vendor@secureshare.com</code>
                </div>
              </div>
            </div>

            {/* Disabled Button */}
            <button className="coming-soon-button" disabled>
              <span className="button-icon">⏳</span>
              Registration Coming Soon
            </button>

            {/* Sign In Link */}
            <div className="signin-prompt">
              <span>Already have access? </span>
              <a href="/login" className="signin-link" onClick={handleGoLogin}>
                Sign in instead
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="register-footer">
        <p className="copyright">© 2025 SecureShare. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default RegisterPage;