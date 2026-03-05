// src/app/owner/OwnerRequests.jsx
import { useEffect, useState } from 'react';
import {
  fetchOwnerRequests,
  approveRequest,
  rejectRequest,
} from '../../api/requests';

const OWNER_ID = 1;

const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

export default function OwnerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('ALL');
  const [acting,   setActing]   = useState(null); // requestId currently being processed

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchOwnerRequests(OWNER_ID);
      setRequests(data);
    } catch (err) {
      console.error('fetchOwnerRequests error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    setActing(id);
    try {
      await approveRequest(id);
      await load();
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id) => {
    setActing(id);
    try {
      await rejectRequest(id);
      await load();
    } finally {
      setActing(null);
    }
  };

  const filtered = filter === 'ALL'
    ? requests
    : requests.filter(r => r.status === filter);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'ALL' ? requests.length : requests.filter(r => r.status === f).length;
    return acc;
  }, {});

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const statusBadge = (status) => {
    const map = {
      PENDING:  'badge-pending',
      APPROVED: 'badge-approved',
      REJECTED: 'badge-rejected',
    };
    return (
      <span className={`badge ${map[status] ?? 'badge-pending'}`}>
        {status}
      </span>
    );
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Access Requests</h1>
          <p className="page-subtitle">Review and manage vendor file access requests</p>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="requests-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
            <span style={{
              marginLeft: 6,
              fontFamily: 'IBM Plex Mono',
              fontSize: 11,
              opacity: 0.7,
            }}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="requests-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="request-card">
              <div className="request-card-header">
                <div className="skeleton" style={{ width: 140, height: 16 }} />
                <div className="skeleton" style={{ width: 70, height: 20, borderRadius: 4 }} />
              </div>
              <div className="request-card-body">
                <div className="skeleton" style={{ width: '60%', height: 13, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '80%', height: 13, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '90%', height: 40, borderRadius: 6 }} />
              </div>
              <div className="request-card-actions">
                <div className="skeleton" style={{ width: 84, height: 32, borderRadius: 6 }} />
                <div className="skeleton" style={{ width: 72, height: 32, borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          </div>
          <p className="empty-state-title">No {filter !== 'ALL' ? filter.toLowerCase() : ''} requests</p>
          <p className="empty-state-sub">
            {filter === 'PENDING' ? 'You\'re all caught up' : 'Nothing to show for this filter'}
          </p>
        </div>
      ) : (
        <div className="requests-grid">
          {filtered.map((r, i) => (
            <div
              key={r.id}
              className="request-card"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              {/* Card header */}
              <div className="request-card-header">
                <div className="request-card-file">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--accent)' }}>
                    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z"/>
                  </svg>
                  File #{r.fileId}
                </div>
                {statusBadge(r.status)}
              </div>

              {/* Card body */}
              <div className="request-card-body">
                <div className="request-meta-row">
                  <div className="request-meta-item">
                    <span className="request-meta-label">Requester</span>
                    <span className="request-meta-value mono">{r.requesterId}</span>
                  </div>
                  <div className="request-meta-item">
                    <span className="request-meta-label">Date</span>
                    <span className="request-meta-value mono">{formatDate(r.createdAt)}</span>
                  </div>
                  <div className="request-meta-item">
                    <span className="request-meta-label">Request #</span>
                    <span className="request-meta-value mono">#{r.id}</span>
                  </div>
                </div>

                {r.reason && (
                  <div className="request-reason">
                    "{r.reason}"
                  </div>
                )}
              </div>

              {/* Card actions */}
              <div className="request-card-actions">
                {r.status === 'PENDING' && (
                  <>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleApprove(r.id)}
                      disabled={acting === r.id}
                    >
                      <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      {acting === r.id ? 'Processing…' : 'Approve'}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleReject(r.id)}
                      disabled={acting === r.id}
                    >
                      <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                      {acting === r.id ? 'Processing…' : 'Reject'}
                    </button>
                  </>
                )}
                {r.status !== 'PENDING' && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono' }}>
                    {r.status === 'APPROVED' ? '✓ Approved' : '✗ Rejected'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}