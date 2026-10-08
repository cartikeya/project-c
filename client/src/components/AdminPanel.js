import React from "react";

function AdminPanel({ nextPlayer, socket, roomId, isPaused, togglePause }) {
  return (
    <div className="admin-actions">
      <button className="button button-danger" type="button" onClick={nextPlayer}>
        <span aria-hidden="true">→|</span> Next player
      </button>
      <button className={`button ${isPaused ? "button-primary" : "button-warning"}`} type="button" onClick={togglePause}>
        <span aria-hidden="true">{isPaused ? "▶" : "Ⅱ"}</span> {isPaused ? "Resume auction" : "Pause auction"}
      </button>
    </div>
  );
}

export default AdminPanel;
