import React from 'react';
import Card from './Card';

const PlayerHand = ({ 
  player, 
  hand, 
  playCard, 
  validPlay, 
  topCard, 
  currentTurn, 
  playerName, 
  score, 
  isOpponent 
}) => {
  const isCurrentPlayer = player === currentTurn;
  const playable = hand.map(card => validPlay(card, topCard));
  
  return (
    <div className={`player-hand ${isOpponent ? 'opponent-hand' : 'current-player-hand'}`}>
      <div className="player-info">
        <div className="hand-label">
          <span className="player-name">{playerName}</span>
          {isCurrentPlayer && <span className="turn-indicator">← Your Turn</span>}
        </div>
        <div className="player-stats">
          <span className="score">Score: {score}</span>
          <span className="cards-count">{hand.length} cards</span>
        </div>
      </div>
      <div className={`cards-container ${isOpponent ? 'opponent-cards' : ''}`}>
        {hand.length > 0 ? (
          isOpponent ? (
            // Show card backs for opponent
            hand.map((card, i) => (
              <div key={i} className="card opponent-card">
                <span>UNO</span>
              </div>
            ))
          ) : (
            // Show actual cards for current player
            hand.map((card, i) => (
              <Card
                key={i}
                card={card}
                onClick={() => isCurrentPlayer && playable[i] && playCard(i)}
                disabled={!isCurrentPlayer || !playable[i]}
                playable={isCurrentPlayer && playable[i]}
              />
            ))
          )
        ) : (
          <div className="no-cards">No cards left - Winner!</div>
        )}
      </div>
    </div>
  );
};

export default PlayerHand;