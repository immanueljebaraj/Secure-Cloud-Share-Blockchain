// src/app/vendor/VendorAudit.jsx
import { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../../api/audit';

const VENDOR_ID    = 2;
const ACTION_TYPES = ['ALL', 'UPLOAD', 'DOWNLOAD', 'REQUEST', 'APPROVE', 'REJECT'];

export default function VendorAudit() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('ALL');
  const [search,  setSearch]  = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const all = await fetchAuditLogs();
      // Only show this vendor's own actions
      setLogs(all.filter(l => l.userId === VENDOR_ID));
    } catch (err) {
      console.error('fetchAuditLogs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = logs.filter(l => {
    const matchAction = filter === 'ALL' || l.action === filter;
    const matchSearch = !search ||
      String(l.fileId).includes(search) ||
      (l.txHash ?? '').toLowerCase().includes(search.toLowerCase());
    return matchAction && matchSearch;
  });

  const formatDateTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString([], {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const shortHash = (hash) => {
    if (!hash) return null;
    return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">Your activity recorded on the blockchain</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px',
            background: 'var(--success-bg)',
            border: '1px solid rgba(0,201,167,0.2)',
            borderRadius: 'var(--radius)',
            fontSize: 12, color: 'var(--success)',
            fontFamily: 'IBM Plex Mono',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--success)',
              animation: 'pulse 2.5s ease infinite',
              display: 'inline-block',
            }} />
            Chain Active
          </div>
          <button className="btn btn-secondary" onClick={load} disabled={loading}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="audit-filters">
        <div className="search-input-wrap" style={{ maxWidth: 280 }}>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <input
            className="search-input"
            placeholder="Search by file or tx hash…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ACTION_TYPES.map((a) => (
            <button
              key={a}
              className={`filter-btn ${filter === a ? 'active' : ''}`}
              onClick={() => setFilter(a)}
            >
              {a}
            </button>
          ))}
        </div>

        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono' }}>
          {filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'}
        </span>
      </div>

      {/* Table */}
      <div className="audit-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Action</th>
              <th>File ID</th>
              <th>Timestamp</th>
              <th>Tx Hash</th>
              <th>Block</th>
              <th>Chain Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 12H9v-2h2v2zm0-4H9V6h2v4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <p className="empty-state-title">No activity recorded yet</p>
                    <p className="empty-state-sub">Actions you take will appear here</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id}>
                  {/* # */}
                  <td>
                    <span className="mono" style={{ color: 'var(--text-muted)' }}>#{l.id}</span>
                  </td>

                  {/* Action badge */}
                  <td>
                    <span className={`audit-action-badge ${l.action}`}>{l.action}</span>
                  </td>

                  {/* File ID */}
                  <td>
                    <span className="mono" style={{ color: 'var(--text-secondary)' }}>#{l.fileId}</span>
                  </td>

                  {/* Timestamp */}
                  <td>
                    <span className="audit-time">{formatDateTime(l.createdAt)}</span>
                  </td>

                  {/* Tx Hash — click to copy */}
                  <td>
                    <span
                      className="tx-hash"
                      title={l.txHash ?? 'No transaction hash yet'}
                      onClick={() => l.txHash && navigator.clipboard?.writeText(l.txHash)}
                    >
                      {shortHash(l.txHash) ?? (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>pending</span>
                      )}
                    </span>
                  </td>

                  {/* Block number */}
                  <td>
                    <span className="block-num">
                      {l.blockNumber != null ? `#${l.blockNumber}` : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>
                      )}
                    </span>
                  </td>

                  {/* Chain Status */}
                  <td>
                    {l.txHash ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 8px', borderRadius: 4,
                        background: 'var(--success-bg)',
                        border: '1px solid rgba(0,201,167,0.2)',
                        fontSize: 11, fontFamily: 'IBM Plex Mono',
                        color: 'var(--success)',
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: 'var(--success)', flexShrink: 0,
                        }} />
                        Verified
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 8px', borderRadius: 4,
                        background: 'var(--warning-bg)',
                        border: '1px solid rgba(255,179,71,0.2)',
                        fontSize: 11, fontFamily: 'IBM Plex Mono',
                        color: 'var(--warning)',
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: 'var(--warning)', flexShrink: 0,
                          animation: 'pulse 2s ease infinite',
                        }} />
                        Confirming…
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}