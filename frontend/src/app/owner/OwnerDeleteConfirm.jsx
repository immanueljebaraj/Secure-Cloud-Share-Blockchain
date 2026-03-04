export default function OwnerDeleteConfirm({ open, onConfirm, onCancel }) {
    if (!open) return null;
  
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ background: "#fff", padding: 20 }}>
          <h4>Confirm Delete</h4>
          <p>This action cannot be undone.</p>
  
          <button onClick={onConfirm}>Delete</button>
          <button onClick={onCancel} style={{ marginLeft: 8 }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
  