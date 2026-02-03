import React from "react";

function Login({ myTeamName, setMyTeamName, handleSetTeam }) {
  return (
    <div>
      <input
        type="text"
        placeholder="enter your team name:"
        value={myTeamName}
        onChange={(e) => setMyTeamName(e.target.value)}
        style={{ padding: "10px", fontSize: "1rem", marginRight: "10px" }}
      />
      <button
        onClick={handleSetTeam}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Join Auction
      </button>
    </div>
  );
}

export default Login;
