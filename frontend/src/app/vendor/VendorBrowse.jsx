// src/app/vendor/VendorBrowse.jsx
import { useEffect, useState } from 'react';
import { fetchFiles }    from '../../api/files';
import { requestAccess, fetchVendorRequests } from '../../api/requests';

const VENDOR_ID = 2;

export default function VendorBrowse() {
  const [files,       setFiles]       = useState([]);
  const [requested,   setRequested]   = useState(new Set()); // fileIds already requested
  const [reasons,     setReasons]     = useState({});        // fileId → reason string
  const [submitting,  setSubmitting]  = useState(null);      // fileId currently submitting
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [allFiles, myRequests] = await Promise.all([
          fetchFiles(),
          fetchVendorRequests(VENDOR_ID),
        ]);
        setFiles(allFiles);
        // Pre-mark files that already have a request from this vendor
        const alreadyRequested = new Set(myRequests.map(r => r.fileId));
        setRequested(alreadyRequested);
      } catch (err) {
        console.error('VendorBrowse load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRequest = async (fileId) => {
    const reason = reasons[fileId]?.trim();
    if (!reason) {
      setError(`Please enter a reason for file #${fileId}`);
      return;
    }
    setError('');
    setSubmitting(fileId);
    try {
      await requestAccess({ fileId, requesterId: VENDOR_ID, reason });
      setRequested(prev => new Set([...prev, fileId]));
      setReasons(prev => ({ ...prev, [fileId]: '' }));
    } catch (err) {
      console.error('requestAccess error:', err);
      setError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  const getExt  = (name) => name?.split('.').pop()?.toUpperCase() ?? '—';
  const filtered = files.filter(f =>
    f.filename?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Browse Files</h1>
          <p className="page-subtitle">Request access to owner-shared files</p>
        </div>
      </div>

      {error && (
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'10px 14px', marginBottom:16,
          background:'var(--danger-bg)', border:'1px solid rgba(255,71,87,0.2)',
          borderRadius:'var(--radius)', fontSize:13, color:'var(--danger)',
        }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}

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
        <span style={{ fontSize:12, color:'var(--text-muted)', fontFamily:'IBM Plex Mono' }}>
          {filtered.length} file{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="browse-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="browse-card" style={{ animationDelay:`${i*0.04}s` }}>
              <div className="browse-card-header">
                <div className="skeleton" style={{ width:34, height:34, borderRadius:8, flexShrink:0 }}/>
                <div className="skeleton" style={{ flex:1, height:16, borderRadius:4 }}/>
              </div>
              <div className="browse-card-body">
                <div className="skeleton" style={{ width:'60%', height:12, marginBottom:8 }}/>
                <div className="skeleton" style={{ width:'80%', height:12 }}/>
              </div>
              <div className="browse-card-footer">
                <div className="skeleton" style={{ width:110, height:32, borderRadius:6 }}/>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ marginTop:40 }}>
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
            const alreadyRequested = requested.has(f.id);
            return (
              <div
                key={f.id}
                className="browse-card"
                style={{ animationDelay:`${i*0.04}s` }}
              >
                <div className="browse-card-header">
                  <div className="browse-card-file-icon">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z"/>
                    </svg>
                  </div>
                  <span className="browse-card-name" title={f.filename}>{f.filename}</span>
                  <span className="badge badge-file">{getExt(f.filename)}</span>
                </div>

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

                  {!alreadyRequested && (
                    <div className="reason-input-wrap">
                      <span className="reason-label">Reason for access</span>
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

                <div className="browse-card-footer">
                  {alreadyRequested ? (
                    <span className="badge badge-pending">
                      <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                      </svg>
                      Request Sent
                    </span>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleRequest(f.id)}
                      disabled={submitting === f.id}
                    >
                      {submitting === f.id ? (
                        'Sending…'
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                          </svg>
                          Request Access
                        </>
                      )}
                    </button>
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