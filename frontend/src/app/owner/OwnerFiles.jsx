// src/app/owner/OwnerFiles.jsx
import { useEffect, useState, useRef } from 'react';
import { fetchFiles, uploadFile }      from '../../api/files';
import api                             from '../../api/axios';

const OWNER_ID = 1;

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ file, onConfirm, onCancel }) {
  if (!file) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd"/>
          </svg>
        </div>
        <h2 className="modal-title">Delete File</h2>
        <p className="modal-body">
          Are you sure you want to delete <strong>{file.filename}</strong>?
          This action will be permanently recorded on the blockchain and cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger"    onClick={onConfirm}>Delete File</button>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OwnerFiles() {
  const [files,       setFiles]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [selectedFile, setSelectedFile] = useState(null);  // file to delete
  const [uploading,   setUploading]   = useState(false);
  const [uploadFile_,  setUploadFile_] = useState(null);   // chosen file object
  const [progress,    setProgress]    = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [dragOver,    setDragOver]    = useState(false);
  const [showUpload,  setShowUpload]  = useState(false);

  const fileInputRef = useRef();

  const loadFiles = async () => {
    setLoading(true);
    try {
      const all = await fetchFiles();
      setFiles(all.filter(f => f.ownerId === OWNER_ID));
    } catch (err) {
      console.error('fetchFiles error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFiles(); }, []);

  // ── Upload ──────────────────────────────────────────────────────────────────

  const handleFilePick = (f) => {
    setUploadFile_(f);
    setUploadError('');
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!uploadFile_) { setUploadError('Please choose a file first.'); return; }
    setUploading(true);
    setUploadError('');
    try {
      await uploadFile(uploadFile_, OWNER_ID, (pct) => setProgress(pct));
      setUploadFile_(null);
      setProgress(0);
      setShowUpload(false);
      await loadFiles();
    } catch (err) {
      setUploadError(err.response?.data ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!selectedFile) return;
    try {
      await api.delete(`/files/${selectedFile.id}`);
      setSelectedFile(null);
      await loadFiles();
    } catch (err) {
      console.error('delete error:', err);
    }
  };

  // ── Filtered list ───────────────────────────────────────────────────────────

  const filtered = files.filter(f =>
    f.filename?.toLowerCase().includes(search.toLowerCase())
  );

  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return '—';
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getExt = (name) => name?.split('.').pop()?.toUpperCase() ?? '—';

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">My Files</h1>
          <p className="page-subtitle">Manage your encrypted cloud files</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowUpload(v => !v); setUploadError(''); }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
          {showUpload ? 'Hide Upload' : 'Upload File'}
        </button>
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div className="upload-panel">
          <div className="upload-panel-header">
            <span className="upload-panel-title">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--accent)' }}>
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
              Upload New File
            </span>
          </div>

          {/* Drop zone */}
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFilePick(f);
            }}
          >
            <div className="upload-zone-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="upload-zone-text">
              Drop file here or <span>browse</span>
            </div>
            <div className="upload-zone-sub">All file types supported</div>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => handleFilePick(e.target.files[0])}
            />
          </div>

          {/* Chosen file preview */}
          {uploadFile_ && (
            <div className="upload-file-row">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--accent)', flexShrink: 0 }}>
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z"/>
              </svg>
              <span className="upload-file-name">{uploadFile_.name}</span>
              <span className="upload-file-size">{formatSize(uploadFile_.size)}</span>
              <button
                style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:16, padding:0 }}
                onClick={() => setUploadFile_(null)}
              >×</button>
            </div>
          )}

          {/* Progress */}
          {uploading && progress > 0 && (
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          )}

          {/* Error */}
          {uploadError && (
            <div className="upload-error">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {uploadError}
            </div>
          )}

          <div className="upload-actions">
            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading || !uploadFile_}>
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
            <button className="btn btn-secondary" onClick={() => { setShowUpload(false); setUploadFile_(null); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="files-toolbar">
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

      {/* Table */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>SHA-256 Hash</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z"/>
                      </svg>
                    </div>
                    <p className="empty-state-title">{search ? 'No files match your search' : 'No files uploaded yet'}</p>
                    <p className="empty-state-sub">Upload a file to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div className="file-name-cell">
                      <div className="file-icon">
                        <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="file-name">{f.filename}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-upload">{getExt(f.filename)}</span>
                  </td>
                  <td><span className="mono">{formatSize(f.size)}</span></td>
                  <td>
                    {f.fileHash ? (
                      <span
                        className="tx-hash"
                        title={`SHA-256: ${f.fileHash}\nClick to copy`}
                        onClick={() => navigator.clipboard?.writeText(f.fileHash)}
                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                      >
                        <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--success)', flexShrink: 0 }}>
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        {f.fileHash.slice(0, 8)}…{f.fileHash.slice(-6)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setSelectedFile(f)}
                      >
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirm modal */}
      <DeleteModal
        file={selectedFile}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSelectedFile(null)}
      />
    </>
  );
}