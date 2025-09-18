import React from 'react';

const Card = ({ card, onClick, disabled, playable }) => {
  const cardClass = `card ${card.color.toLowerCase()} ${playable ? 'playable' : ''}`;
  
  return (
    <button 
      className={cardClass}
      onClick={onClick}
      disabled={disabled}
    >
      <span>{card.value}</span>
    </button>
  );
};

export default Card;