import React from "react";

function AdminPanel({ nextPlayer, socket, roomId, isPaused, togglePause }) {
  return (
    <div
      style={{
        marginTop: "20px",
        display: "flex",
        gap: "15px",
        justifyContent: "center",
      }}
    >
      {/* Existing Next Player Button */}
      <button
        onClick={nextPlayer}
        style={{
          padding: "12px 24px",
          background: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "1rem",
          boxShadow: "0 4px 6px rgba(220, 53, 69, 0.3)",
        }}
      >
        ⏭️ Next Player
      </button>

      {/* The New Panic / Pause Button */}
      <button
        onClick={togglePause}
        style={{
          padding: "12px 24px",
          // Green to resume, Orange/Yellow for the emergency pause
          background: isPaused ? "#2ecc71" : "#f39c12",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "1rem",
          boxShadow: isPaused
            ? "0 4px 6px rgba(46, 204, 113, 0.3)"
            : "0 4px 6px rgba(243, 156, 18, 0.3)",
          transition: "all 0.2s ease",
        }}
      >
        {isPaused ? "▶️ Resume Game" : "⏸️ Pause (Teacher!)"}
      </button>
    </div>
  );
}

export default AdminPanel;
