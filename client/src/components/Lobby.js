import React, { useState } from "react";
import { socket } from "../socket";

function Lobby() {
  const [joinCode, setJoinCode] = useState("");
  const handleCreateRoom = () => socket.emit("create_room");
  const handleJoinRoom = () => {
    if (joinCode.trim().length !== 4) {
      alert("enter a valid 4 digit code");
      return;
    }
    socket.emit("join_room", joinCode.toUpperCase());
  };

  return (
    <main className="lobby-shell">
      <header className="lobby-header">
        <a className="brand-lockup" href="#top" aria-label="IPL Auction home">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span className="brand-copy"><span className="brand-kicker">THE LIVE ROOM</span><span className="brand-name">IPL <strong>AUCTION</strong></span></span>
        </a>
        <span className="lobby-header-note"><span className="live-dot" /> PRIVATE ROOMS · LIVE BIDDING</span>
      </header>

      <section className="lobby-hero">
        <div className="lobby-copy">
          <p className="eyebrow">YOUR SEASON STARTS HERE</p>
          <h1>Every great<br /><span>squad starts</span><br />with a bid.</h1>
          <p className="lobby-description">Bring your friends together for a live IPL mock auction. Create a room or jump into one that’s already underway.</p>
          <div className="lobby-feature-row"><span><i>01</i> Private game rooms</span><span><i>02</i> Real-time bidding</span></div>
        </div>

        <div className="lobby-card surface-panel">
          <div className="lobby-card-topline"><span>AUCTION CONTROL</span><span className="lobby-card-mark">✦</span></div>
          <div className="lobby-action-block">
            <span className="step-label">01 <i>HOST A GAME</i></span>
            <h2>Start a new room</h2>
            <p>Become the host and invite your league in.</p>
            <button className="button button-primary lobby-create-button" type="button" onClick={handleCreateRoom}>Create room <span aria-hidden="true">↗</span></button>
          </div>
          <div className="lobby-separator"><span>OR</span></div>
          <div className="lobby-action-block join-room-block">
            <span className="step-label">02 <i>JOIN A GAME</i></span>
            <h2>Have a room code?</h2>
            <p>Enter the four-character code from your host.</p>
            <div className="room-code-form">
              <label className="visually-hidden" htmlFor="room-code">Four-letter room code</label>
              <input
                id="room-code"
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder="ROOM CODE"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") handleJoinRoom(); }}
                maxLength={4}
              />
              <button className="button button-secondary" type="button" onClick={handleJoinRoom}>Join <span aria-hidden="true">→</span></button>
            </div>
          </div>
          <div className="lobby-card-footer"><span>MADE FOR THE LOVE OF THE GAME</span><span>↗</span></div>
        </div>
      </section>

      <footer className="lobby-footer">
        <div><span className="footer-emblem">✦</span><p>Built by a B.Tech student. If your squad is enjoying the game, help keep the cloud servers running.</p></div>
        <a className="coffee-link" href="https://www.buymeacoffee.com/cartikeya" target="_blank" rel="noreferrer">Support the project <span aria-hidden="true">↗</span></a>
      </footer>
    </main>
  );
}
export default Lobby;
