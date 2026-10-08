import React, { useCallback, useEffect, useState } from "react";
import { API_BASE_URL, socket } from "./socket";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login";
import PlayerCard from "./components/PlayerCard";
import SoldOverlay from "./components/SoldOverlay";
import SquadOverview from "./components/SquadOverview";
import Lobby from "./components/Lobby";
import PlayerPool from "./components/PlayerPool";
import GoogleSignIn from "./components/GoogleSignIn";
import "./App.css";

const AUTH_TOKEN_KEY = "project-c.auth-token";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "671625674339-atieils13ucn4icst5r2dgk05f0musmg.apps.googleusercontent.com";

function App() {
  const [authToken, setAuthToken] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const [auctionData, setAuctionData] = useState(null);
  const [teamsData, setTeamsData] = useState({});
  const [myTeamName, setMyTeamName] = useState("");
  const [isTeamSet, setIsTeamSet] = useState(false);
  const [soldInfo, setSoldInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [timer, setTimer] = useState(10);
  const [roomId, setRoomId] = useState(null);
  const [inRoom, setInRoom] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playersList, setPlayersList] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const savedToken = window.sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (!savedToken) {
      setAuthLoading(false);
      return () => { cancelled = true; };
    }

    setAuthToken(savedToken);
    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || "Please sign in again.");
        if (!cancelled) setAuthUser(payload.user);
      })
      .catch((error) => {
        if (cancelled) return;
        window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
        setAuthToken("");
        setAuthUser(null);
        setAuthError(error.message || "Your sign-in has expired. Please sign in again.");
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const handleGoogleCredential = useCallback(async (credential) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || "Google sign-in failed.");
    if (!payload.token || !payload.user) throw new Error("The sign-in response was incomplete.");

    window.sessionStorage.setItem(AUTH_TOKEN_KEY, payload.token);
    setAuthError("");
    setAuthToken(payload.token);
    setAuthUser(payload.user);
    setAuthLoading(false);
  }, []);

  const handleSignOut = useCallback(() => {
    socket.disconnect();
    window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthToken("");
    setAuthUser(null);
    setAuthError("");
    setRoomId(null);
    setInRoom(false);
    setIsTeamSet(false);
    setMyTeamName("");
    setAuctionData(null);
    setTeamsData({});
    setGameStarted(false);
    setIsPaused(false);
    setIsAdmin(null);
    setTimer(10);
    setPlayersList([]);
    setSoldInfo(null);
  }, []);

  useEffect(() => {
    if (!authToken || !authUser) return undefined;
    socket.auth = { token: authToken };

    const onConnect = () => {
      setAuthError("");
      socket.emit("restore_session");
    };
    const onRoomCreated = (id) => {
      setRoomId(id);
      setInRoom(true);
    };
    const onRoomJoined = (id) => {
      setRoomId(id);
      setInRoom(true);
    };
    const onSessionRestored = ({ roomId: restoredRoomId, teamName, isAdmin: restoredAdmin }) => {
      setRoomId(restoredRoomId);
      setInRoom(true);
      setMyTeamName(teamName || "");
      setIsTeamSet(Boolean(teamName));
      setIsAdmin(Boolean(restoredAdmin));
    };
    const onSessionNotFound = () => {
      setRoomId(null);
      setInRoom(false);
      setMyTeamName("");
      setIsTeamSet(false);
    };
    const onErrorMessage = (message) => window.alert(message);
    const onConnectError = (error) => {
      const message = error.message || "Unable to connect to the auction server.";
      setAuthError(message);
      if (/sign-in|required|expired/i.test(message)) {
        window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
        setAuthToken("");
        setAuthUser(null);
      }
    };

    socket.on("connect", onConnect);
    socket.on("room_created", onRoomCreated);
    socket.on("room_joined", onRoomJoined);
    socket.on("session_restored", onSessionRestored);
    socket.on("session_not_found", onSessionNotFound);
    socket.on("error_message", onErrorMessage);
    socket.on("connect_error", onConnectError);
    socket.on("update_auction", (data) => {
      setAuctionData(data);
      setSoldInfo(null);
    });
    socket.on("update_teams", (data) => setTeamsData(data));
    socket.on("auction_sold", (data) => setSoldInfo(data));
    socket.on("set_admin", (isAdminStatus) => setIsAdmin(isAdminStatus));
    socket.on("timer_update", (time) => setTimer(time));
    socket.on("auction_status", (status) => setGameStarted(status));
    socket.on("pause_status", (status) => setIsPaused(status));
    socket.on("players_list", (list) => setPlayersList(list));

    socket.connect();
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("room_created", onRoomCreated);
      socket.off("room_joined", onRoomJoined);
      socket.off("session_restored", onSessionRestored);
      socket.off("session_not_found", onSessionNotFound);
      socket.off("error_message", onErrorMessage);
      socket.off("connect_error", onConnectError);
      socket.off("update_auction");
      socket.off("update_teams");
      socket.off("auction_sold");
      socket.off("set_admin");
      socket.off("timer_update");
      socket.off("auction_status");
      socket.off("pause_status");
      socket.off("players_list");
      socket.disconnect();
    };
  }, [authToken, authUser]);

  const togglePause = () => {
    if (!roomId) return;
    socket.emit("toggle_pause", { roomId });
  };
  const handleSetTeam = () => setIsTeamSet(true);
  const placeBid = () => {
    if (!isTeamSet || !auctionData || !roomId || isPaused) return;
    const myWallet = teamsData[myTeamName]?.budget || 0;
    const nextBid = auctionData.currentBid + 50;

    if (nextBid > myWallet) {
      return window.alert(`not enough money! you only have ${myWallet}`);
    }
    socket.emit("place_bid", { amount: nextBid, teamName: myTeamName, roomId });
  };

  const nextPlayer = () => socket.emit("next_player", roomId);
  const startGame = () => socket.emit("start_auction", roomId);

  if (authLoading) {
    return (
      <main className="loading-screen">
        <div className="loading-orbit" aria-hidden="true"><span /></div>
        <p className="eyebrow">IPL MOCK AUCTION</p>
        <h1>Restoring your account</h1>
        <p className="muted-copy">Checking your saved auction session…</p>
      </main>
    );
  }

  if (!authToken || !authUser) {
    return (
      <GoogleSignIn
        clientId={GOOGLE_CLIENT_ID}
        onCredential={handleGoogleCredential}
        error={authError}
      />
    );
  }

  if (!inRoom) {
    return <Lobby user={authUser} onSignOut={handleSignOut} connectionError={authError} />;
  }

  if (!auctionData || !auctionData.currentPlayer) {
    return (
      <main className="loading-screen">
        <div className="loading-orbit" aria-hidden="true"><span /></div>
        <p className="eyebrow">IPL MOCK AUCTION</p>
        <h1>Setting the stage</h1>
        <p className="muted-copy">Loading your saved room…</p>
      </main>
    );
  }

  const isWinning = auctionData.currentLeader === myTeamName;
  const takenTeamNames = Object.keys(teamsData);
  const myStats = teamsData[myTeamName] || { budget: 10000, squad: [] };

  return (
    <main className="app-shell">
      {soldInfo && (
        <SoldOverlay
          auctionData={{ lastSoldTo: soldInfo.winner, currentPlayer: soldInfo.player }}
        />
      )}

      <header className="app-header">
        <a className="brand-lockup" href="#top" aria-label="IPL Auction home">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span className="brand-copy">
            <span className="brand-kicker">THE LIVE ROOM</span>
            <span className="brand-name">IPL <strong>AUCTION</strong></span>
          </span>
        </a>
        <div className="header-actions">
          <div className="room-badge" aria-label={`Room code ${roomId}`}>
            <span className="room-badge-label"><span className="live-dot" /> ROOM CODE</span>
            <strong>{roomId}</strong>
          </div>
          <AccountControl user={authUser} onSignOut={handleSignOut} />
        </div>
      </header>
      {authError && <div className="connection-notice" role="status">{authError}</div>}

      <section className="page-intro">
        <div>
          <p className="eyebrow">{gameStarted ? "AUCTION IN PROGRESS" : "YOUR PRIVATE AUCTION"}</p>
          <h1>{gameStarted ? "Make your move." : "Build your squad."}</h1>
          <p className="page-subtitle">
            {gameStarted
              ? "Every bid changes the game. Stay sharp and back your strategy."
              : "Choose your franchise, bring your crew in, and get ready to bid."}
          </p>
        </div>
        {gameStarted && <span className="status-pill"><span className="live-dot" /> LIVE AUCTION</span>}
      </section>

      {!isTeamSet ? (
        <section className="join-panel surface-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">STEP 01 / PICK YOUR SIDE</p>
              <h2>Choose your franchise</h2>
            </div>
            <span className="heading-note">{takenTeamNames.length} teams in the room</span>
          </div>
          <Login
            setMyTeamName={setMyTeamName}
            handleSetTeam={handleSetTeam}
            takenTeamNames={takenTeamNames}
            roomId={roomId}
          />
        </section>
      ) : (
        <section className="team-summary surface-panel" aria-label="Your team summary">
          <div className="team-summary-brand">
            <span className="team-avatar">{myTeamName.slice(0, 2)}</span>
            <div>
              <span className="eyebrow">YOUR FRANCHISE</span>
              <strong>{myTeamName}</strong>
            </div>
          </div>
          <div className="summary-stat">
            <span>Remaining purse</span>
            <strong>₹ {(myStats.budget / 100.0).toFixed(2)} <small>Cr</small></strong>
          </div>
          <div className="summary-stat">
            <span>Players signed</span>
            <strong>{myStats.squad.length}</strong>
          </div>
          <div className="summary-stat summary-stat-room">
            <span>Room</span>
            <strong>{roomId}</strong>
          </div>
        </section>
      )}

      {auctionData.lastSoldTo && (
        <div className="last-sold-banner">
          <span className="sold-banner-icon" aria-hidden="true">✓</span>
          <span>Last player secured by <strong>{auctionData.lastSoldTo}</strong></span>
        </div>
      )}

      {isTeamSet && !gameStarted && (
        <section className="waiting-room surface-panel">
          <div className="waiting-heading">
            <div className="waiting-icon" aria-hidden="true">⌛</div>
            <div>
              <p className="eyebrow">ROOM STATUS</p>
              <h2>Waiting for the room to fill</h2>
              <p className="muted-copy">Your host will kick off the auction when everyone is ready.</p>
            </div>
          </div>
          <div className="waiting-actions">
            <div className="player-count"><strong>{takenTeamNames.length}</strong><span>franchises joined</span></div>
            {isAdmin ? (
              <button className="button button-primary button-start" onClick={startGame}>
                <span aria-hidden="true">▶</span> Start auction
              </button>
            ) : (
              <p className="host-note"><span className="pulse-dot" /> Waiting for the host to start</p>
            )}
          </div>
          <div className="section-divider" />
          <SquadOverview teamsData={teamsData} />
          <PlayerPool playersList={playersList} currentPlayer={null} />
        </section>
      )}

      {isTeamSet && gameStarted && (
        <>
          <div className="auction-workspace">
            <section className="auction-main-column">
              <PlayerCard
                currentPlayer={auctionData.currentPlayer}
                currentBid={auctionData.currentBid}
                currentLeader={auctionData.currentLeader}
                placeBid={placeBid}
                isTeamSet={isTeamSet}
                isWinning={isWinning}
                timer={timer}
                isPaused={isPaused}
              />
              {isAdmin && (
                <section className="admin-panel surface-panel">
                  <div className="admin-heading">
                    <span className="admin-icon" aria-hidden="true">⌘</span>
                    <div><p className="eyebrow">HOST TOOLS</p><h3>Control the room</h3></div>
                  </div>
                  <AdminPanel
                    nextPlayer={nextPlayer}
                    socket={socket}
                    roomId={roomId}
                    isPaused={isPaused}
                    togglePause={togglePause}
                  />
                </section>
              )}
            </section>
            <aside className="auction-side-column">
              <SquadOverview teamsData={teamsData} />
            </aside>
          </div>
          <PlayerPool playersList={playersList} currentPlayer={auctionData.currentPlayer} />
        </>
      )}
      <footer className="app-footer"><span>IPL MOCK AUCTION</span><span>Good luck, managers.</span></footer>
    </main>
  );
}

function AccountControl({ user, onSignOut }) {
  return (
    <div className="account-control">
      {user.picture ? (
        <img className="account-avatar" src={user.picture} alt="" referrerPolicy="no-referrer" />
      ) : (
        <span className="account-avatar account-avatar-fallback" aria-hidden="true">{user.name?.slice(0, 1)?.toUpperCase()}</span>
      )}
      <span className="account-name">{user.name}</span>
      <button className="account-signout" type="button" onClick={onSignOut}>Sign out</button>
    </div>
  );
}

export default App;
