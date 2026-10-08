import React from "react";

function SoldOverlay({ auctionData }) {
  const { lastSoldTo, currentPlayer } = auctionData;
  const formatPrice = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return amount;
    if (num >= 100) return `${(num / 100).toFixed(2)} Cr`;
    return `${num} L`;
  };

  return (
    <div className="sold-overlay" role="status" aria-live="polite">
      <div className="sold-confetti sold-confetti-one" aria-hidden="true" />
      <div className="sold-confetti sold-confetti-two" aria-hidden="true" />
      <div className="sold-result-card">
        <div className="sold-result-icon" aria-hidden="true">✓</div>
        <p className="eyebrow">THE HAMMER FALLS</p>
        <h2>{currentPlayer.name}</h2>
        <div className="sold-divider"><span>SOLD TO</span></div>
        <strong className="sold-winner">{formatPrice(lastSoldTo)}</strong>
      </div>
    </div>
  );
}

export default SoldOverlay;
