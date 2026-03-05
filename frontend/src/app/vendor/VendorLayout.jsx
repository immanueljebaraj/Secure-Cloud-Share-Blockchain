// src/app/vendor/VendorLayout.jsx
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../../css/VendorDashboard.css';

const NAV_ITEMS = [
  {
    to: '/vendor/browse',
    label: 'Browse Files',
    icon: (
      <svg className="nav-link-icon" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z"/>
      </svg>
    ),
  },
  {
    to: '/vendor/requests',
    label: 'My Requests',
    icon: (
      <svg className="nav-link-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
      </svg>
    ),
  },
  {
    to: '/vendor/audit',
    label: 'Audit Log',
    icon: (
      <svg className="nav-link-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 12H9v-2h2v2zm0-4H9V6h2v4z" clipRule="evenodd"/>
      </svg>
    ),
  },
];

const PAGE_TITLES = { browse: 'Browse Files', requests: 'My Requests', audit: 'Audit Log' };

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

export default function VendorLayout() {
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

  const segment     = location.pathname.split('/').filter(Boolean).pop();
  const currentPage = PAGE_TITLES[segment] ?? 'Vendor';
  const initials = user?.email?.split('@')[0]?.slice(0, 2).toUpperCase() ?? 'VE';

  return (
    <div className="vendor-shell">
      <aside className="vendor-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <path d="M20 5L8 10V20C8 28 13 35 20 37C27 35 32 28 32 20V10L20 5Z" fill="#071520" stroke="#00C9A7" strokeWidth="2"/>
              <path d="M16 20L19 23L24 17" stroke="#00C9A7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="20" cy="20" r="12" stroke="#00C9A7" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
            </svg>
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">SecureShare</span>
            <span className="vendor-brand-role">Vendor Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-nav-label">Navigation</span>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `vendor-nav-link${isActive ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="vendor-avatar">{initials}</div>
            <div className="user-details">
            <div className="user-email">{user?.email ?? 'vendor@secureshare.com'}</div>
              <div className="vendor-role-badge">Vendor</div>
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

      <div className="vendor-main">
        <header className="vendor-topbar">
          <div className="topbar-breadcrumb">
            <span>Vendor</span>
            <span className="topbar-sep">/</span>
            <span>{currentPage}</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-status"><span className="status-dot" />Connected</div>
            <LiveClock />
          </div>
        </header>
        <main className="vendor-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}