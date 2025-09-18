import React from 'react';

const TopCard = ({ card }) => {
  return (
    <div className="top-card-container">
      <div className={`top-card ${card.color.toLowerCase()}`}>
        <span>{card.value}</span>
      </div>
    </div>
  );
};

export default TopCard;