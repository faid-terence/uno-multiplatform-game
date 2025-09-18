import React from "react";
import './App.css';

// Components
import PlayerSetupScreen from './components/PlayerSetupScreen';
import RoundWinScreen from './components/RoundWinScreen';
import PlayerHand from './components/PlayerHand';
import TopCard from './components/TopCard';
import Deck from './components/Deck';
import ColorPicker from './components/ColorPicker';
import Scoreboard from './components/Scoreboard';
import GameStats from './components/GameStats';

// Hooks
import { useGameState } from './hooks/useGameState';
import { useGameActions } from './hooks/useGameActions';
import { useAI } from './hooks/useAI';

// Utils
import { formatTime, validPlay, selectBestColor } from './utils/gameUtils';
import { TARGET_SCORE } from './constants/gameConstants';

// Main App Component
function App() {
  // Initialize game state
  const gameState = useGameState();
  
  // Initialize game actions
  const gameActions = useGameActions({
    gameState,
    showMessage: gameState.showMessage,
    handleRoundWin: gameState.handleRoundWin
  });
  
  // AI logic for playing cards
  const playAICard = (cardIndex) => {
    // Safety checks
    if (!gameState.hands[1] || cardIndex >= gameState.hands[1].length || cardIndex < 0) {
      console.error('Invalid card index or hands state', { cardIndex, handsLength: gameState.hands[1]?.length });
      return;
    }
    
    let newHands = gameState.hands.map(h => [...h]);
    let playedCard = newHands[1].splice(cardIndex, 1)[0];
    
    // Additional safety check
    if (!playedCard) {
      console.error('No card found at index', cardIndex);
      return;
    }
    
    let newDiscard = [...gameState.discard, playedCard];
    let nextTurn = 0; // Next turn to human player
    let newDirection = gameState.direction;
    
    // Apply card effects
    if (playedCard.value === "Skip") {
      nextTurn = 1; // Skip human, AI plays again
      gameState.showMessage(`${gameState.playerNames[1]} played Skip! You are skipped.`, "info");
    }
    if (playedCard.value === "Reverse") {
      newDirection = -gameState.direction;
      gameState.showMessage(`${gameState.playerNames[1]} played Reverse! Direction reversed.`, "info");
      if (2 === 2) { // PLAYERS constant
        nextTurn = 1; // In two players, reverse acts as skip
      }
    }
    if (playedCard.value === "Draw Two") {
      if (gameState.deck.length >= 2) {
        newHands[0].push(gameState.deck.pop(), gameState.deck.pop());
        gameState.showMessage(`${gameState.playerNames[1]} played Draw Two! You draw 2 cards and are skipped.`, "info");
      }
      nextTurn = 1; // Skip human player
    }
    
    if (!['Skip', 'Reverse', 'Draw Two'].includes(playedCard.value)) {
      gameState.showMessage(`${gameState.playerNames[1]} played ${playedCard.color} ${playedCard.value}.`, "info");
    }
    
    gameState.setHands(newHands);
    gameState.setDiscard(newDiscard);
    gameState.setDirection(newDirection);
    gameState.setTurn(nextTurn);
    gameState.setCardsPlayed(prev => prev + 1);
    gameState.setTurns(prev => prev + 1);
    
    // Check for AI win
    if (newHands[1].length === 0) {
      gameState.handleRoundWin(1);
    }
  };
  
  // AI plays a wild card
  const playAIWildCard = (cardIndex, cardValue, selectedColor) => {
    let newHands = gameState.hands.map(h => [...h]);
    newHands[1].splice(cardIndex, 1);
    
    const newCard = { color: selectedColor, value: cardValue };
    let newDiscard = [...gameState.discard, newCard];
    let nextTurn = 0; // Next turn goes to human player
    
    // Apply wild card effects
    if (cardValue === "Wild Draw Four") {
      if (gameState.deck.length >= 4) {
        newHands[0].push(gameState.deck.pop(), gameState.deck.pop(), gameState.deck.pop(), gameState.deck.pop());
        gameState.showMessage(`${gameState.playerNames[1]} played Wild Draw Four! You draw 4 cards and are skipped.`, "info");
      }
    } else {
      gameState.showMessage(`${gameState.playerNames[1]} played a Wild card and chose ${selectedColor}.`, "info");
    }
    
    gameState.setHands(newHands);
    gameState.setDiscard(newDiscard);
    gameState.setTurn(nextTurn);
    gameState.setCardsPlayed(prev => prev + 1);
    gameState.setTurns(prev => prev + 1);
    
    // Check for AI win
    if (newHands[1].length === 0) {
      gameState.handleRoundWin(1);
    }
  };
  
  // AI draws a card
  const aiDrawCard = () => {
    if (gameState.deck.length === 0) {
      // Reshuffle if deck is empty
      const topCard = gameState.discard[gameState.discard.length - 1];
      const newDiscard = [topCard];
      let newDeck = gameState.discard.slice(0, -1).sort(() => Math.random() - 0.5);
      gameState.setDeck(newDeck);
      gameState.setDiscard(newDiscard);
      return;
    }
    
    let newHands = gameState.hands.map(h => [...h]);
    const drawnCard = gameState.deck.pop();
    newHands[1].push(drawnCard);
    
    gameState.setHands(newHands);
    
    // Check if the drawn card is playable
    if (validPlay(drawnCard, gameState.topCard)) {
      gameState.showMessage(`${gameState.playerNames[1]} drew a card and can play it.`, "info");
      // AI will play it immediately if it's a good move
      setTimeout(() => {
        if (Math.random() > 0.3) { // 70% chance to play immediately
          const cardIndex = newHands[1].length - 1;
          if (drawnCard.color === 'Black') {
            const bestColor = selectBestColor(newHands[1]);
            playAIWildCard(cardIndex, drawnCard.value, bestColor);
          } else {
            playAICard(cardIndex);
          }
        } else {
          // End turn
          gameState.setTurn(0);
          gameState.setTurns(prev => prev + 1);
        }
      }, 500);
    } else {
      gameState.showMessage(`${gameState.playerNames[1]} drew a card.`, "info");
      gameState.setTurn(0);
      gameState.setTurns(prev => prev + 1);
    }
  };
  
  // Initialize AI
  useAI({
    gamePhase: gameState.gamePhase,
    turn: gameState.turn,
    hands: gameState.hands,
    topCard: gameState.topCard,
    onPlayCard: playAICard,
    onPlayWildCard: playAIWildCard,
    onDrawCard: aiDrawCard,
    showMessage: gameState.showMessage,
    playerNames: gameState.playerNames
  });
  
  // Handle different game phases
  if (gameState.gamePhase === 'setup') {
    return <PlayerSetupScreen onStartGame={gameState.handlePlayerSetup} />;
  }
  
  if (gameState.gamePhase === 'round-end') {
    return (
      <RoundWinScreen 
        roundWinner={gameState.roundWinner} 
        pointsEarned={gameState.pointsEarned} 
        playerNames={gameState.playerNames} 
        totalScores={gameState.totalScores} 
        gameWinner={gameState.gameWinner} 
        onNextRound={gameState.handleNextRound} 
        onNewGame={gameState.handleNewGame} 
        finalHands={gameState.finalHands}
      />
    );
  }

  // Main game render
  return (
    <div className="game-container">
      <div className="game-header">
        <h1 className="game-title">UNO Game</h1>
        <Scoreboard 
          playerNames={gameState.playerNames} 
          scores={gameState.totalScores} 
          targetScore={TARGET_SCORE} 
        />
        <div className="turn-indicator">
          {gameState.playerNames[gameState.turn]}'s Turn
          {gameState.direction === 1 ? " (Clockwise)" : " (Counter-Clockwise)"}
        </div>
      </div>
      
      <div className="game-board">
        <GameStats 
          turns={gameState.turns} 
          cardsPlayed={gameState.cardsPlayed} 
          timeElapsed={formatTime(gameState.seconds)} 
        />
        
        {/* Opponent Hand (Player 2) */}
        <PlayerHand 
          player={1} 
          hand={gameState.hands[1] || []} 
          playCard={() => {}} 
          validPlay={() => false} 
          topCard={gameState.topCard} 
          currentTurn={gameState.turn} 
          playerName={gameState.playerNames[1]} 
          score={gameState.totalScores[1]} 
          isOpponent={true} 
        />
        
        <div className="center-pile">
          <Deck 
            drawCard={gameState.turn === 0 ? gameActions.drawCard : () => {}} 
            remainingCards={gameState.deck.length} 
          />
          {gameState.topCard && <TopCard card={gameState.topCard} />}
        </div>
        
        {/* Current Player Hand (Player 1) */}
        <PlayerHand 
          player={0} 
          hand={gameState.hands[0] || []} 
          playCard={gameActions.playCard} 
          validPlay={validPlay} 
          topCard={gameState.topCard} 
          currentTurn={gameState.turn} 
          playerName={gameState.playerNames[0]} 
          score={gameState.totalScores[0]} 
          isOpponent={false} 
        />
        
        <div className={`message ${gameState.messageType}`}>
          {gameState.message}
        </div>
        
        {gameState.turn === 0 && (
          <button className="draw-card-btn" onClick={gameActions.drawCard}>Draw Card</button>
        )}
        
        {gameState.hands[0]?.length === 1 && gameState.turn === 0 && !gameState.unoButtonPressed[0] && (
          <button className="uno-button" onClick={gameActions.handleUnoButtonClick}>UNO!</button>
        )}
      </div>
      
      {gameState.showColorPicker && (
        <ColorPicker 
          onSelectColor={gameActions.handleColorSelect} 
          onClose={() => gameState.setShowColorPicker(false)} 
        />
      )}
    </div>
  );
}

export default App;

