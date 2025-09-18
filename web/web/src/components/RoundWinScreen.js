import React from 'react';

const RoundWinScreen = ({ 
  roundWinner, 
  pointsEarned, 
  playerNames, 
  totalScores, 
  gameWinner, 
  onNextRound, 
  onNewGame, 
  finalHands 
}) => {
  const isGameOver = gameWinner !== null;
  
  return (
    <div className="win-screen">
      <div className="win-content">
        {isGameOver ? (
          <>
            <h2>🎉 Game Winner! 🎉</h2>
            <h3>{playerNames[gameWinner]} Wins the Game!</h3>
            <div className="final-scores">
              <p>{playerNames[0]}: {totalScores[0]} points</p>
              <p>{playerNames[1]}: {totalScores[1]} points</p>
            </div>
            
            {/* Show final cards */}
            {finalHands.length > 0 && (
              <div className="final-cards-reveal">
                <h4>Final Cards in Hand:</h4>
                <div className="players-final-cards">
                  {finalHands.map((hand, playerIndex) => (
                    <div key={playerIndex} className="player-final-cards">
                      <div className="player-label">{playerNames[playerIndex]}</div>
                      <div className="final-hand">
                        {hand.length > 0 ? (
                          hand.map((card, cardIndex) => (
                            <div key={cardIndex} className={`final-card ${card.color.toLowerCase()}`}>
                              <span>{card.value}</span>
                            </div>
                          ))
                        ) : (
                          <div className="no-cards-final">No cards - Winner!</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button className="play-again-btn" onClick={onNewGame}>New Game</button>
          </>
        ) : (
          <>
            <h2>Round Winner!</h2>
            <h3>{playerNames[roundWinner]} wins this round!</h3>
            <p className="points-earned">+{pointsEarned} points</p>
            <div className="current-scores">
              <p>{playerNames[0]}: {totalScores[0]} points</p>
              <p>{playerNames[1]}: {totalScores[1]} points</p>
            </div>
            
            {/* Show final cards */}
            {finalHands.length > 0 && (
              <div className="final-cards-reveal">
                <h4>Final Cards in Hand:</h4>
                <div className="players-final-cards">
                  {finalHands.map((hand, playerIndex) => (
                    <div key={playerIndex} className="player-final-cards">
                      <div className="player-label">{playerNames[playerIndex]}</div>
                      <div className="final-hand">
                        {hand.length > 0 ? (
                          hand.map((card, cardIndex) => (
                            <div key={cardIndex} className={`final-card ${card.color.toLowerCase()}`}>
                              <span>{card.value}</span>
                            </div>
                          ))
                        ) : (
                          <div className="no-cards-final">No cards - Winner!</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button className="play-again-btn" onClick={onNextRound}>Next Round</button>
          </>
        )}
      </div>
    </div>
  );
};

export default RoundWinScreen;