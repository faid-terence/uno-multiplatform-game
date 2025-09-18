import React, { useState } from 'react';
import { TARGET_SCORE } from '../constants/gameConstants';

const PlayerSetupScreen = ({ onStartGame }) => {
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  
  const handleStartGame = () => {
    if (player1Name.trim() && player2Name.trim()) {
      onStartGame({
        player1: player1Name.trim(),
        player2: player2Name.trim()
      });
    }
  };
  
  return (
    <div className="setup-screen">
      <div className="setup-content">
        <h1 className="setup-title">UNO Game Setup</h1>
        <div className="setup-form">
          <div className="player-input">
            <label>Player 1 Name:</label>
            <input 
              type="text" 
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Enter Player 1 name"
              maxLength={15}
            />
          </div>
          <div className="player-input">
            <label>Player 2 Name:</label>
            <input 
              type="text" 
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              placeholder="Enter Player 2 name"
              maxLength={15}
            />
          </div>
          <button 
            className="start-game-btn" 
            onClick={handleStartGame}
            disabled={!player1Name.trim() || !player2Name.trim()}
          >
            Start Game
          </button>
        </div>
        <div className="game-rules">
          <h3>Game Rules:</h3>
          <ul>
            <li>First player to reach {TARGET_SCORE} points wins the entire game!</li>
            <li>Points are scored based on cards remaining in opponent's hand</li>
            <li>Number cards = face value, Action cards = 20 points, Wild cards = 50 points</li>
            <li>Don't forget to call UNO when you have one card left!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlayerSetupScreen;