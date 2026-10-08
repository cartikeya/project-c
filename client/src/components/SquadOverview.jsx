import React from "react";

const formatPrice = (amount) => {
  if (amount === undefined || amount === null) return "???";
  if (amount >= 100) return `₹ ${(amount / 100).toFixed(2)} Cr`;
  return `₹ ${amount} L`;
};

function SquadOverview({ teamsData }) {
  if (!teamsData || Object.keys(teamsData).length === 0) return null;
  const teams = Object.entries(teamsData);

  return (
    <section className="squad-section">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">THE LEAGUE</p>
          <h2>Squads &amp; spending</h2>
        </div>
        <span className="team-total">{teams.length} <small>teams</small></span>
      </div>
      <div className="squad-grid">
        {teams.map(([teamName, teamInfo]) => (
          <article className="squad-card" key={teamName}>
            <div className="squad-card-heading">
              <span className="squad-team-mark">{teamName.slice(0, 1)}</span>
              <div><h3>{teamName}</h3><span>{teamInfo.squad.length} players signed</span></div>
            </div>
            <div className="squad-budget-row">
              <span>Available purse</span>
              <strong>{formatPrice(teamInfo.budget)}</strong>
            </div>
            <div className="squad-progress" aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(100, (teamInfo.budget / 10000) * 100))}%` }} /></div>
            <ul className="squad-player-list">
              {teamInfo.squad.length === 0 ? (
                <li className="empty-squad">No players signed yet</li>
              ) : (
                teamInfo.squad.map((player, idx) => (
                  <li key={`${player.name}-${idx}`}>
                    <span className="squad-player-name">{player.name}</span>
                    <span className="squad-player-price">{formatPrice(player.soldPrice)}</span>
                  </li>
                ))
              )}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export default SquadOverview;
