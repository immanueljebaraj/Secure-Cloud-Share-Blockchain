// src/app/owner/OwnerLayout.jsx
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../../css/OwnerDashboard.css';

// ─── Nav Items — absolute paths prevent relative-URL stacking ─────────────────

const NAV_ITEMS = [
  {
    to: '/owner/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="nav-link-icon" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    to: '/owner/files',
    label: 'My Files',
    icon: (
      <svg className="nav-link-icon" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z" />
      </svg>
    ),
  },
  {
    to: '/owner/requests',
    label: 'Access Requests',
    icon: (
      <svg className="nav-link-icon" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm5 4a1 1 0 10-2 0v3a1 1 0 102 0V9zm2-1a1 1 0 011 1v3a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/owner/audit',
    label: 'Audit Log',
    icon: (
      <svg className="nav-link-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 12H9v-2h2v2zm0-4H9V6h2v4z" clipRule="evenodd" />
      </svg>
    ),
  },
];

// ─── Page title map ───────────────────────────────────────────────────────────

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  files:     'My Files',
  requests:  'Access Requests',
  audit:     'Audit Log',
};

// ─── Live Clock ───────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="topbar-time">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OwnerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('secureShareUser');
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('secureShareUser');
    navigate('/login');
  };

  // Derive current page label from the last URL segment
  const segment     = location.pathname.split('/').filter(Boolean).pop();
  const currentPage = PAGE_TITLES[segment] ?? 'Overview';
  const initials    = user?.id?.split('@')[0]?.slice(0, 2).toUpperCase() ?? 'OW';

  return (
    <div className="owner-shell">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="owner-sidebar">

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <path d="M20 5L8 10V20C8 28 13 35 20 37C27 35 32 28 32 20V10L20 5Z"
                fill="#071520" stroke="#00B4D8" strokeWidth="2"/>
              <path d="M16 20L19 23L24 17" stroke="#00B4D8" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="20" cy="20" r="12" stroke="#00B4D8" strokeWidth="1"
                strokeDasharray="2 2" opacity="0.5"/>
            </svg>
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">SecureShare</span>
            <span className="sidebar-brand-role">Owner Portal</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <span className="sidebar-nav-label">Navigation</span>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `owner-nav-link${isActive ? ' active' : ''}`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="user-avatar">{initials}</div>
            <div className="user-details">
              <div className="user-email">{user?.id ?? 'owner@secureshare.com'}</div>
              <div className="user-role-badge">Owner</div>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 100-2H4V5h6a1 1 0 100-2H3zm11.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L15.586 11H9a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="owner-main">

        {/* Topbar */}
        <header className="owner-topbar">
          <div className="topbar-breadcrumb">
            <span>Owner</span>
            <span className="topbar-sep">/</span>
            <span>{currentPage}</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-status">
              <span className="status-dot" />
              Blockchain Active
            </div>
            <LiveClock />
          </div>
        </header>

        {/* Page content */}
        <main className="owner-page">
          <Outlet />
        </main>

      </div>
    </div>
  );
}