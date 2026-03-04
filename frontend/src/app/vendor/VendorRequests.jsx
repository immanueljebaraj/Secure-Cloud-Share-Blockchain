// src/app/vendor/VendorRequests.jsx
import { useEffect, useState } from 'react';
import { fetchVendorRequests } from '../../api/requests';

const VENDOR_ID = 2;
const FILTERS   = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

export default function VendorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchVendorRequests(VENDOR_ID);
      setRequests(data);
    } catch (err) {
      console.error('fetchVendorRequests error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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

  const handleDownload = (requestId) => {
    window.open(
      `http://localhost:8080/api/requests/${requestId}/download?requesterId=${VENDOR_ID}`,
      '_blank'
    );
  };

  const statusBadge = (status) => {
    const map = { PENDING: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-rejected' };
    return <span className={`badge ${map[status] ?? 'badge-pending'}`}>{status}</span>;
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">My Requests</h1>
          <p className="page-subtitle">Track your file access requests</p>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
          </svg>
          Refresh
        </button>
      </div>

      <div className="requests-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
            <span style={{ marginLeft:6, fontFamily:'IBM Plex Mono', fontSize:11, opacity:0.7 }}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="requests-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="vendor-request-card">
              <div className="vendor-request-header">
                <div className="skeleton" style={{ width:140, height:16 }}/>
                <div className="skeleton" style={{ width:70, height:20, borderRadius:4 }}/>
              </div>
              <div className="vendor-request-body">
                <div className="skeleton" style={{ width:'60%', height:13, marginBottom:8 }}/>
                <div className="skeleton" style={{ width:'80%', height:40, borderRadius:6 }}/>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ marginTop:40 }}>
          <div className="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
          </div>
          <p className="empty-state-title">No {filter !== 'ALL' ? filter.toLowerCase() : ''} requests yet</p>
          <p className="empty-state-sub">Browse files and request access to get started</p>
        </div>
      ) : (
        <div className="requests-grid">
          {filtered.map((r, i) => (
            <div
              key={r.id}
              className={`vendor-request-card status-${r.status}`}
              style={{ animationDelay:`${i*0.04}s` }}
            >
              <div className="vendor-request-header">
                <div className="vendor-request-file">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ color:'var(--accent)' }}>
                    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z"/>
                  </svg>
                  File #{r.fileId}
                </div>
                {statusBadge(r.status)}
              </div>

              <div className="vendor-request-body">
                <div className="request-meta-row">
                  <div className="request-meta-item">
                    <span className="request-meta-label">Request #</span>
                    <span className="request-meta-value mono">#{r.id}</span>
                  </div>
                  <div className="request-meta-item">
                    <span className="request-meta-label">Submitted</span>
                    <span className="request-meta-value mono">{formatDate(r.createdAt)}</span>
                  </div>
                </div>
                {r.reason && (
                  <div className="request-reason">"{r.reason}"</div>
                )}
              </div>

              <div className="vendor-request-footer">
                {r.status === 'APPROVED' ? (
                  <button className="btn-download" onClick={() => handleDownload(r.id)}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                    Download File
                  </button>
                ) : r.status === 'PENDING' ? (
                  <span style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'IBM Plex Mono' }}>
                    Awaiting owner approval
                  </span>
                ) : (
                  <span style={{ fontSize:12, color:'var(--danger)', fontFamily:'IBM Plex Mono' }}>
                    Access was not approved
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