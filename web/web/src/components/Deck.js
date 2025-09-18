import React from 'react';

const Deck = ({ drawCard, remainingCards }) => {
  return (
    <div className="deck-pile">
      <div className="deck-card" onClick={drawCard}>
        <span>UNO</span>
      </div>
      <div className="cards-remaining">{remainingCards} cards left</div>
    </div>
  );
};

export default Deck;