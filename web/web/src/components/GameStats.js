import React from 'react';

const GameStats = ({ turns, cardsPlayed, timeElapsed }) => {
  return (
    <div className="game-stats">
      <div className="stat-item">
        <div className="stat-label">Turns</div>
        <div className="stat-value">{turns}</div>
      </div>
      <div className="stat-item">
        <div className="stat-label">Cards Played</div>
        <div className="stat-value">{cardsPlayed}</div>
      </div>
      <div className="stat-item">
        <div className="stat-label">Time</div>
        <div className="stat-value">{timeElapsed}</div>
      </div>
    </div>
  );
};

export default GameStats;