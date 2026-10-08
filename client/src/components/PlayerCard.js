import React, { useState } from "react";

function PlayerCard({
  currentPlayer,
  currentBid,
  currentLeader,
  placeBid,
  isTeamSet,
  isWinning,
  timer,
  isPaused,
}) {
  const [onCooldown, setOnCooldown] = useState(false);
  const handleBidClick = () => {
    if (onCooldown || isWinning || isPaused) return;
    setOnCooldown(true);
    placeBid();
    setTimeout(() => setOnCooldown(false), 500);
  };
  const playerImage = currentPlayer.img
    ? currentPlayer.img
    : `https://ui-avatars.com/api/?name=${currentPlayer.name.replace(" ", "+")}&size=600&background=random&color=fff&font-size=0.4`;

  const formatBid = (amountInLakhs) => {
    if (amountInLakhs >= 100) return `${(amountInLakhs / 100).toFixed(2)} Cr`;
    return `${amountInLakhs} L`;
  };
  const isButtonDisabled = isWinning || onCooldown || isPaused;

  return (
    <article className={`player-auction-card${isPaused ? " is-paused" : ""}`}>
      <div className="player-image-wrap">
        <img className="player-image" src={playerImage} alt={currentPlayer.name} />
        <div className="player-image-shade" />
        <div className="player-category-tag">{currentPlayer.role || "PLAYER"}</div>
        <div className="player-image-caption">
          <p className="eyebrow">PLAYER ON THE BLOCK</p>
          <h2>{currentPlayer.name}</h2>
          <span>{currentPlayer.nationality || "Unknown"}</span>
        </div>
        <div className={`auction-timer${timer <= 3 ? " is-urgent" : ""}${isPaused ? " is-paused" : ""}`} aria-label={isPaused ? "Auction paused" : `${timer} seconds remaining`}>
          <span>{isPaused ? "Ⅱ" : timer}</span>
          <small>{isPaused ? "PAUSED" : "SECONDS"}</small>
        </div>
      </div>
      <div className="bid-panel">
        <div className="bid-information">
          <div>
            <span className="eyebrow">CURRENT BID</span>
            <strong className="current-bid">₹ {formatBid(currentBid)}</strong>
          </div>
          <div className="bid-leader">
            <span className="eyebrow">HIGH BIDDER</span>
            <strong>{currentLeader === "No one yet" ? "Open for bidding" : currentLeader}</strong>
          </div>
        </div>
        {isTeamSet && (
          <button
            className={`button bid-button${isButtonDisabled ? " is-disabled" : ""}${onCooldown && !isWinning ? " is-cooldown" : ""}`}
            onClick={handleBidClick}
            disabled={isButtonDisabled}
          >
            <span>{isPaused ? "Auction paused" : isWinning ? `You’re leading · ${formatBid(currentBid)}` : onCooldown ? "Placing bid…" : `Bid ₹${formatBid(currentBid)}`}</span>
            {!isButtonDisabled && <span className="bid-button-arrow" aria-hidden="true">↗</span>}
          </button>
        )}
        <p className="bid-step-note">Bids increase in increments of ₹50L</p>
      </div>
    </article>
  );
}
export default PlayerCard;
