// src/app/owner/OwnerDashboard.jsx
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { fetchFiles }         from '../../api/files';
import { fetchOwnerRequests } from '../../api/requests';
import { fetchAuditLogs }     from '../../api/audit';

const OWNER_ID = 1;

// ─── Action colour map ────────────────────────────────────────────────────────

const ACTION_DOT = {
  UPLOAD:   'upload',
  DELETE:   'delete',
  APPROVE:  'approve',
  REJECT:   'delete',
  REQUEST:  'request',
  DOWNLOAD: 'approve',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OwnerDashboard() {
  const [stats,    setStats]    = useState({ files: 0, pending: 0, approved: 0, logs: 0 });
  const [activity, setActivity] = useState([]);
  const [pending,  setPending]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [files, requests, logs] = await Promise.all([
          fetchFiles(),
          fetchOwnerRequests(OWNER_ID),
          fetchAuditLogs(),
        ]);

        const myFiles    = files.filter(f => f.ownerId === OWNER_ID);
        const myRequests = requests;
        const pendingReq = myRequests.filter(r => r.status === 'PENDING');
        const approved   = myRequests.filter(r => r.status === 'APPROVED');

        setStats({
          files:    myFiles.length,
          pending:  pendingReq.length,
          approved: approved.length,
          logs:     logs.length,
        });

        setPending(pendingReq.slice(0, 3));

        // Recent activity — last 8 log entries
        setActivity(
          [...logs]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 8)
        );
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1)  return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24)   return `${diffH}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your files, requests, and blockchain activity</p>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon blue">
                <div className="skeleton" style={{ width: 24, height: 24, borderRadius: 6 }} />
              </div>
              <div className="stat-content">
                <div className="skeleton" style={{ width: 48, height: 28, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: 100, height: 14 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon blue">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.files}</div>
              <div className="stat-label">Total Files</div>
              <div className="stat-sub">stored in cloud</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon yellow">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending Requests</div>
              <div className="stat-sub">awaiting approval</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.approved}</div>
              <div className="stat-label">Approved</div>
              <div className="stat-sub">active vendor access</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 12H9v-2h2v2zm0-4H9V6h2v4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.logs}</div>
              <div className="stat-label">Blockchain Entries</div>
              <div className="stat-sub">immutable audit records</div>
            </div>
          </div>

        </div>
      )}

      {/* Main grid */}
      <div className="dashboard-grid">

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 12H9v-2h2v2zm0-4H9V6h2v4z" clipRule="evenodd"/>
              </svg>
              Recent Blockchain Activity
            </h2>
            <NavLink to="../audit" relative="path" className="card-action-link">
              View all →
            </NavLink>
          </div>
          <div className="activity-list">
            {loading ? (
              <div style={{ padding: '20px' }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ display:'flex', gap:12, marginBottom:16 }}>
                    <div className="skeleton" style={{ width:8, height:8, borderRadius:'50%', marginTop:4, flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div className="skeleton" style={{ width:'70%', height:14, marginBottom:6 }} />
                      <div className="skeleton" style={{ width:'30%', height:11 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 12H9v-2h2v2zm0-4H9V6h2v4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <p className="empty-state-title">No activity yet</p>
                <p className="empty-state-sub">Blockchain entries will appear here</p>
              </div>
            ) : (
              activity.map((log) => (
                <div key={log.id} className="activity-item">
                  <div className={`activity-dot ${ACTION_DOT[log.action] ?? 'request'}`} />
                  <div className="activity-content">
                    <div className="activity-text">
                      <strong>{log.action}</strong>
                      {' — '}
                      File <strong>#{log.fileId}</strong>
                      {log.txHash && (
                        <span style={{ marginLeft: 6, fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--accent-dim)' }}>
                          {log.txHash.slice(0, 10)}…
                        </span>
                      )}
                    </div>
                    <div className="activity-time">{formatTime(log.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Requests quick-view */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              Pending Requests
              {stats.pending > 0 && (
                <span className="badge badge-pending" style={{ marginLeft: 6 }}>
                  {stats.pending}
                </span>
              )}
            </h2>
            <NavLink to="../requests" relative="path" className="card-action-link">
              Manage →
            </NavLink>
          </div>
          <div className="request-preview-list">
            {loading ? (
              <div style={{ padding: '16px' }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                    <div>
                      <div className="skeleton" style={{ width:120, height:14, marginBottom:6 }} />
                      <div className="skeleton" style={{ width:90, height:11 }} />
                    </div>
                    <div className="skeleton" style={{ width:60, height:26, borderRadius:4 }} />
                  </div>
                ))}
              </div>
            ) : pending.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <p className="empty-state-title">All clear</p>
                <p className="empty-state-sub">No pending requests</p>
              </div>
            ) : (
              pending.map((r) => (
                <div key={r.id} className="request-preview-item">
                  <div className="request-preview-info">
                    <div className="request-preview-file">File #{r.fileId}</div>
                    <div className="request-preview-vendor">{r.requesterId}</div>
                  </div>
                  <span className="badge badge-pending">Pending</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </>
  );
}