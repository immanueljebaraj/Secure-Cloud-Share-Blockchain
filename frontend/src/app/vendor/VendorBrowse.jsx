// src/app/vendor/VendorBrowse.jsx
import { useEffect, useState } from 'react';
import { fetchFiles }                      from '../../api/files';
import { requestAccess, fetchVendorRequests } from '../../api/requests';

const VENDOR_ID = 2;

export default function VendorBrowse() {
  const [files,      setFiles]      = useState([]);
  const [myRequests, setMyRequests] = useState([]); // full request objects
  const [reasons,    setReasons]    = useState({});
  const [submitting, setSubmitting] = useState(null);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [allFiles, reqs] = await Promise.all([
          fetchFiles(),
          fetchVendorRequests(VENDOR_ID),
        ]);
        setFiles(allFiles);
        setMyRequests(reqs);
      } catch (err) {
        console.error('VendorBrowse load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // For a given fileId, return the most recent request or null
  const getRequest = (fileId) =>
    myRequests
      .filter(r => r.fileId === fileId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] ?? null;

  // A file is "blocked" (can't re-request) if there's a PENDING or a
  // non-expired APPROVED request. Expired APPROVED and REJECTED are re-requestable.
  const isBlocked = (fileId) => {
    const req = getRequest(fileId);
    if (!req) return false;
    if (req.status === 'PENDING') return true;
    if (req.status === 'APPROVED') {
      const expired = req.expiresAt && new Date(req.expiresAt) < new Date();
      return !expired; // blocked only if NOT expired
    }
    return false; // REJECTED → allow re-request
  };

  const handleRequest = async (fileId) => {
    const reason = reasons[fileId]?.trim();
    if (!reason) { setError(`Please enter a reason for file #${fileId}`); return; }
    setError('');
    setSubmitting(fileId);
    try {
      await requestAccess({ fileId, reason });
      // Refresh requests so isBlocked() updates immediately
      const updated = await fetchVendorRequests(VENDOR_ID);
      setMyRequests(updated);
      setReasons(prev => ({ ...prev, [fileId]: '' }));
    } catch (err) {
      console.error('requestAccess error:', err);
      setError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  const getExt      = (name) => name?.split('.').pop()?.toUpperCase() ?? '—';
  const shortHash   = (h) => h ? `${h.slice(0, 8)}…${h.slice(-6)}` : null;
  const filtered    = files.filter(f =>
    f.filename?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Browse Files</h1>
          <p className="page-subtitle">Request access to owner-shared files</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', marginBottom: 16,
          background: 'var(--danger-bg)', border: '1px solid rgba(255,71,87,0.2)',
          borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--danger)',
        }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="browse-toolbar">
        <div className="search-input-wrap">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <input
            className="search-input"
            placeholder="Search files…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono' }}>
          {filtered.length} file{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="browse-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="browse-card" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="browse-card-header">
                <div className="skeleton" style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0 }} />
                <div className="skeleton" style={{ flex: 1, height: 16, borderRadius: 4 }} />
              </div>
              <div className="browse-card-body">
                <div className="skeleton" style={{ width: '60%', height: 12, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '80%', height: 12 }} />
              </div>
              <div className="browse-card-footer">
                <div className="skeleton" style={{ width: 110, height: 32, borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z"/>
            </svg>
          </div>
          <p className="empty-state-title">No files available</p>
          <p className="empty-state-sub">No files have been uploaded by owners yet</p>
        </div>
      ) : (
        <div className="browse-grid">
          {filtered.map((f, i) => {
            const blocked = isBlocked(f.id);
            const req     = getRequest(f.id);
            const expired = req?.status === 'APPROVED' && req.expiresAt && new Date(req.expiresAt) < new Date();
            const rejected = req?.status === 'REJECTED';
            return (
              <div key={f.id} className="browse-card" style={{ animationDelay: `${i * 0.04}s` }}>

                {/* Card Header */}
                <div className="browse-card-header">
                  <div className="browse-card-file-icon">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z"/>
                    </svg>
                  </div>
                  <span className="browse-card-name" title={f.filename}>{f.filename}</span>
                  <span className="badge badge-file">{getExt(f.filename)}</span>
                </div>

                {/* Card Body */}
                <div className="browse-card-body">
                  <div className="browse-card-meta">
                    <div className="browse-meta-item">
                      <span className="browse-meta-label">Owner ID</span>
                      <span className="browse-meta-value">#{f.ownerId}</span>
                    </div>
                    <div className="browse-meta-item">
                      <span className="browse-meta-label">File ID</span>
                      <span className="browse-meta-value">#{f.id}</span>
                    </div>
                  </div>

                  {/* ── SHA-256 Integrity Badge ─────────────────────────────── */}
                  {f.fileHash && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 10px', marginBottom: 10,
                      background: 'var(--success-bg)',
                      border: '1px solid rgba(0,201,167,0.2)',
                      borderRadius: 'var(--radius)',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--success)', flexShrink: 0 }}>
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span style={{ fontSize: 10, color: 'var(--success)', fontFamily: 'IBM Plex Mono', letterSpacing: '0.04em' }}>
                        SHA-256 VERIFIED
                      </span>
                      <span
                        title={`Full hash: ${f.fileHash}\nClick to copy`}
                        onClick={() => navigator.clipboard?.writeText(f.fileHash)}
                        style={{
                          marginLeft: 'auto', fontSize: 10,
                          fontFamily: 'IBM Plex Mono', color: 'var(--success)',
                          opacity: 0.8, cursor: 'pointer',
                        }}
                      >
                        {shortHash(f.fileHash)}
                      </span>
                    </div>
                  )}

                  {/* Reason input — show when not blocked */}
                  {!blocked && (
                    <div className="reason-input-wrap">
                      <span className="reason-label">
                        {expired ? 'Link expired — reason to request again' : rejected ? 'Reason for new request' : 'Reason for access'}
                      </span>
                      <textarea
                        className="reason-input"
                        rows={2}
                        placeholder="Describe why you need access to this file…"
                        value={reasons[f.id] ?? ''}
                        onChange={(e) =>
                          setReasons(prev => ({ ...prev, [f.id]: e.target.value }))
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="browse-card-footer">
                  {blocked ? (
                    <span className="badge badge-pending">
                      <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                      </svg>
                      {req?.status === 'APPROVED' ? 'Access Granted' : 'Request Sent'}
                    </span>
                  ) : (
                    <>
                      {expired && (
                        <span style={{ fontSize: 11, color: 'var(--danger)', fontFamily: 'IBM Plex Mono', marginRight: 8 }}>
                          ⚠ Expired
                        </span>
                      )}
                      {rejected && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono', marginRight: 8 }}>
                          Previously rejected
                        </span>
                      )}
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleRequest(f.id)}
                        disabled={submitting === f.id}
                      >
                        {submitting === f.id ? 'Sending…' : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                            </svg>
                            {expired || rejected ? 'Request Again' : 'Request Access'}
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </>
  );
}