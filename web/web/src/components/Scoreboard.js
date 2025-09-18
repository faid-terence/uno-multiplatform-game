import React from 'react';

const Scoreboard = ({ playerNames, scores, targetScore }) => {
  const leader = scores[0] > scores[1] ? 0 : scores[1] > scores[0] ? 1 : -1;
  
  return (
    <div className="scoreboard">
      <h3>Scoreboard (First to {targetScore})</h3>
      <div className="score-display">
        <div className={`player-score ${leader === 0 ? 'leading' : ''}`}>
          <span className="player-name">{playerNames[0]}</span>
          <span className="score">{scores[0]}</span>
        </div>
        <div className="vs">VS</div>
        <div className={`player-score ${leader === 1 ? 'leading' : ''}`}>
          <span className="player-name">{playerNames[1]}</span>
          <span className="score">{scores[1]}</span>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;