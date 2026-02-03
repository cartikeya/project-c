import React from "react";

function AdminPanel({ nextPlayer }) {
  return (
    <div style={{ marginTop: "20px" }}>
      <button
        onClick={nextPlayer}
        style={{
          padding: "10px 20px",
          background: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        next Player
      </button>
    </div>
  );
}
export default AdminPanel;
