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
  const fallbackPlayerImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentPlayer.name || "Cricket Player")}&size=600&background=20243d&color=fff&font-size=0.4`;
  const playerImage = currentPlayer.img || fallbackPlayerImage;

  const formatBid = (amountInLakhs) => {
    if (amountInLakhs >= 100) return `${(amountInLakhs / 100).toFixed(2)} Cr`;
    return `${amountInLakhs} L`;
  };
  const isButtonDisabled = isWinning || onCooldown || isPaused;

  return (
    <article className={`player-auction-card${isPaused ? " is-paused" : ""}`}>
      <div className="player-image-wrap">
        <img
          className="player-image"
          src={playerImage}
          alt={currentPlayer.name}
          onError={(event) => {
            if (event.currentTarget.src !== fallbackPlayerImage) event.currentTarget.src = fallbackPlayerImage;
          }}
        />
        <div className="player-image-shade" />
        <div className="player-category-tag">{currentPlayer.role || "PLAYER"}</div>
        <div className="player-image-caption">
          <p className="eyebrow">PLAYER ON THE BLOCK</p>
          <h2>{currentPlayer.name}</h2>
          <span>{currentPlayer.nationality || "Unknown"}</span>
          {currentPlayer.img && currentPlayer.imageCredit && currentPlayer.imageLicense && currentPlayer.imageSource && currentPlayer.imageLicenseUrl && (
            <div className="player-image-credit">
              <a href={currentPlayer.imageSource} target="_blank" rel="noreferrer" aria-label={`Photo source and credit: ${currentPlayer.imageCredit}`}>
                Photo: {currentPlayer.imageCredit}
              </a>
              <span aria-hidden="true"> · </span>
              <a href={currentPlayer.imageLicenseUrl} target="_blank" rel="noreferrer" aria-label={`Image license: ${currentPlayer.imageLicense}`}>
                {currentPlayer.imageLicense}
              </a>
            </div>
          )}
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
