import React, { useState } from "react";

function PlayerPool({ playersList, currentPlayer }) {
  const [selectedRole, setSelectedRole] = useState("All");
  if (!playersList || playersList.length === 0) return null;

  const currentIndex = currentPlayer
    ? playersList.findIndex((player) => player.name === currentPlayer.name)
    : 0;
  const remainingPlayers = currentIndex >= 0 ? playersList.slice(currentIndex) : playersList;
  const uniqueRoles = ["All", ...new Set(remainingPlayers.map((p) => p.role || "Other"))];
  const displayedPlayers = selectedRole === "All"
    ? remainingPlayers
    : remainingPlayers.filter((p) => (p.role || "Other") === selectedRole);

  return (
    <section className="player-pool surface-panel">
      <div className="section-heading pool-heading">
        <div><p className="eyebrow">UP NEXT</p><h2>Player pool</h2></div>
        <span className="player-remaining-count"><strong>{remainingPlayers.length}</strong> remaining</span>
      </div>
      <div className="role-filters" role="group" aria-label="Filter players by role">
        {uniqueRoles.map((role) => (
          <button
            key={role}
            type="button"
            className={`role-filter${selectedRole === role ? " is-active" : ""}`}
            aria-pressed={selectedRole === role}
            onClick={() => setSelectedRole(role)}
          >{role}</button>
        ))}
      </div>
      <div className="player-pool-track">
        {displayedPlayers.length === 0 ? (
          <div className="empty-pool">No players left in this category.</div>
        ) : (
          displayedPlayers.map((player, index) => {
            const isCurrent = currentPlayer && currentPlayer.name === player.name;
            return (
              <article className={`pool-player-card${isCurrent ? " is-current" : ""}`} key={`${player.name}-${index}`}>
                {isCurrent && <span className="on-block-label">ON THE BLOCK</span>}
                <img
                  src={`https://ui-avatars.com/api/?name=${player.name.replace(" ", "+")}&size=96&background=random&color=fff`}
                  alt=""
                />
                <strong title={player.name}>{player.name}</strong>
                <span className="pool-player-role">{player.role || "Player"}</span>
                <span className="pool-player-price">Base ₹{player.basePrice || 20}L</span>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

export default PlayerPool;
