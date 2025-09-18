import React, { useState, useEffect, useRef, useCallback } from "react";
import './App.css';

// Constants for game configuration
const COLORS = ["Red", "Green", "Blue", "Yellow"];
const VALUES = [
  ...Array(10).keys()
].map(String).concat(["Skip", "Reverse", "Draw Two"]);
const SPECIALS = ["Wild", "Wild Draw Four"];
const PLAYERS = 2;
const STARTING_CARDS = 7;
const TARGET_SCORE = 500; // First to 500 points wins the game

// Card point values for scoring
const CARD_POINTS = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'Skip': 20, 'Reverse': 20, 'Draw Two': 20,
  'Wild': 50, 'Wild Draw Four': 50
};

// Player Setup Screen Component
const PlayerSetupScreen = ({ onStartGame }) => {
  const [player1Name, setPlayer1Name] = React.useState('');
  const [player2Name, setPlayer2Name] = React.useState('');
  
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

// Card component
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

// Player Hand component
const PlayerHand = ({ player, hand, playCard, validPlay, topCard, currentTurn, playerName, score, isOpponent }) => {
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

// Top Card Component
const TopCard = ({ card }) => {
  return (
    <div className="top-card-container">
      <div className={`top-card ${card.color.toLowerCase()}`}>
        <span>{card.value}</span>
      </div>
    </div>
  );
};

// Deck Component
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

// Color Picker Component
const ColorPicker = ({ onSelectColor, onClose }) => {
  return (
    <>
      <div className="overlay" onClick={onClose}></div>
      <div className="color-picker">
        <h3>Choose a color</h3>
        <div className="color-options">
          {COLORS.map(color => (
            <div
              key={color}
              className={`color-option ${color.toLowerCase()}`}
              onClick={() => onSelectColor(color)}
              style={{ background: color.toLowerCase() }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

// Scoreboard Component
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

// Round Win Screen Component
const RoundWinScreen = ({ roundWinner, pointsEarned, playerNames, totalScores, gameWinner, onNextRound, onNewGame }) => {
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
            <button className="play-again-btn" onClick={onNextRound}>Next Round</button>
          </>
        )}
      </div>
    </div>
  );
};

// Game Stats Component
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

// Game utility functions
function makeDeck() {
  let deck = [];
  for (let color of COLORS) {
    for (let value of VALUES) {
      deck.push({ color, value });
      if (value !== "0") deck.push({ color, value });
    }
  }
  for (let s of SPECIALS) {
    for (let i = 0; i < 4; i++) {
      deck.push({ color: "Black", value: s });
    }
  }
  // Shuffle the deck thoroughly
  for (let i = 0; i < 3; i++) {
    deck = deck.sort(() => Math.random() - 0.5);
  }
  return deck;
}

function validPlay(card, top) {
  return card.color === top.color || 
         card.value === top.value || 
         card.color === "Black";
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Calculate points from remaining cards in hand
function calculateHandPoints(hand) {
  return hand.reduce((total, card) => {
    return total + (CARD_POINTS[card.value] || 0);
  }, 0);
}

// AI utility function to select best color for wild cards
function selectBestColor(hand) {
  const colorCounts = {};
  COLORS.forEach(color => colorCounts[color] = 0);
  
  hand.forEach(card => {
    if (card.color !== 'Black') {
      colorCounts[card.color]++;
    }
  });
  
  // Return the color with the most cards
  return Object.keys(colorCounts).reduce((a, b) => 
    colorCounts[a] > colorCounts[b] ? a : b
  );
}

// Main App Component
function App() {
  // Game setup state
  const [gamePhase, setGamePhase] = useState('setup'); // 'setup', 'playing', 'round-end'
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [totalScores, setTotalScores] = useState([0, 0]);
  
  // Game state
  const [deck, setDeck] = useState([]);
  const [hands, setHands] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [turn, setTurn] = useState(0);
  const [direction, setDirection] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState(null);
  const [roundWinner, setRoundWinner] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [gameWinner, setGameWinner] = useState(null);
  const [unoButtonPressed, setUnoButtonPressed] = useState([false, false]);
  
  // Game statistics
  const [turns, setTurns] = useState(0);
  const [cardsPlayed, setCardsPlayed] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);
  
  // Timer effect
  useEffect(() => {
    if (gamePhase === 'playing' && roundWinner === null) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gamePhase, roundWinner]);
  
  // Check for UNO call
  useEffect(() => {
    if (gamePhase === 'playing' && hands.length > 0) {
      hands.forEach((hand, playerIndex) => {
        if (hand.length === 1 && !unoButtonPressed[playerIndex] && playerIndex === turn) {
          // AI player (player 1) automatically calls UNO
          if (playerIndex === 1) {
            const newUnoState = [...unoButtonPressed];
            newUnoState[playerIndex] = true;
            setUnoButtonPressed(newUnoState);
            showMessage(`${playerNames[playerIndex]} says UNO!`, "info");
          }
        }
      });
    }
  }, [hands, turn, unoButtonPressed, gamePhase, playerNames]);
  
  // Get the top card of the discard pile
  const topCard = discard.length > 0 ? discard[discard.length - 1] : null;
  
  
  // Handle player setup
  const handlePlayerSetup = (names) => {
    setPlayerNames([names.player1, names.player2]);
    setGamePhase('playing');
    startNewRound();
  };
  
  // Start a new round
  const startNewRound = () => {
    const newDeck = makeDeck();
    const newHands = Array(PLAYERS).fill().map(() => []);
    
    // Deal cards to each player
    for (let i = 0; i < STARTING_CARDS; i++) {
      for (let p = 0; p < PLAYERS; p++) {
        newHands[p].push(newDeck.pop());
      }
    }
    
    // Set initial discard pile
    let initialCard = newDeck.pop();
    // Make sure the first card isn't a wild card
    while (initialCard.color === "Black") {
      newDeck.push(initialCard);
      initialCard = newDeck.pop();
    }
    
    setDeck(newDeck);
    setHands(newHands);
    setDiscard([initialCard]);
    setTurn(0);
    setDirection(1);
    setMessage(`${playerNames[0]}'s turn to start!`);
    setMessageType("info");
    setShowColorPicker(false);
    setPendingWildCard(null);
    setRoundWinner(null);
    setPointsEarned(0);
    setUnoButtonPressed([false, false]);
    
    // Reset statistics
    setTurns(0);
    setCardsPlayed(0);
    setSeconds(0);
  };
  
  // Handle round completion
  const handleRoundWin = (winnerIndex) => {
    const loserIndex = winnerIndex === 0 ? 1 : 0;
    const pointsFromOpponent = calculateHandPoints(hands[loserIndex]);
    
    // Update scores
    const newScores = [...totalScores];
    newScores[winnerIndex] += pointsFromOpponent;
    
    setTotalScores(newScores);
    setRoundWinner(winnerIndex);
    setPointsEarned(pointsFromOpponent);
    setGamePhase('round-end');
    
    // Check if game is won
    if (newScores[winnerIndex] >= TARGET_SCORE) {
      setGameWinner(winnerIndex);
    }
    
    showMessage(`${playerNames[winnerIndex]} wins the round and gets ${pointsFromOpponent} points!`, "success");
  };
  
  // Start next round
  const handleNextRound = () => {
    setGamePhase('playing');
    startNewRound();
  };
  
  // Start completely new game
  const handleNewGame = () => {
    setGamePhase('setup');
    setTotalScores([0, 0]);
    setGameWinner(null);
    setPlayerNames(['', '']);
  };
  
  // AI Move Logic
  const makeAIMove = () => {
    if (turn !== 1 || !hands[1] || hands[1].length === 0) return;
    
    const aiHand = hands[1];
    const playableCards = [];
    
    // Find all playable cards
    aiHand.forEach((card, index) => {
      if (validPlay(card, topCard)) {
        playableCards.push({ card, index });
      }
    });
    
    if (playableCards.length > 0) {
      // AI strategy: prioritize action cards, then wild cards, then regular cards
      let selectedPlay = playableCards[0];
      
      // Look for action cards first
      const actionCards = playableCards.filter(p => 
        ['Skip', 'Reverse', 'Draw Two'].includes(p.card.value)
      );
      if (actionCards.length > 0) {
        selectedPlay = actionCards[0];
      } else {
        // Look for wild cards if no action cards
        const wildCards = playableCards.filter(p => p.card.color === 'Black');
        if (wildCards.length > 0) {
          selectedPlay = wildCards[0];
        }
      }
      
      // Play the selected card
      if (selectedPlay.card.color === 'Black') {
        // Handle wild card
        const bestColor = selectBestColor(aiHand);
        handleAIWildCard(selectedPlay.index, selectedPlay.card.value, bestColor);
      } else {
        // Play regular card
        playAICard(selectedPlay.index);
      }
    } else {
      // No playable cards, draw a card
      aiDrawCard();
    }
  };

  // AI Player Logic trigger
  useEffect(() => {
    if (gamePhase === 'playing' && turn === 1 && hands.length > 0 && topCard) {
      // Delay AI move to make it feel more natural
      const aiTimer = setTimeout(() => {
        makeAIMove();
      }, 1000 + Math.random() * 1000); // 1-2 second delay
      
      return () => clearTimeout(aiTimer);
    }
  }, [turn, gamePhase, hands, topCard]);
  
  // AI draws a card
  const aiDrawCard = () => {
    if (deck.length === 0) {
      // Reshuffle if deck is empty
      const topCard = discard[discard.length - 1];
      const newDiscard = [topCard];
      let newDeck = discard.slice(0, -1).sort(() => Math.random() - 0.5);
      setDeck(newDeck);
      setDiscard(newDiscard);
      return;
    }
    
    let newHands = hands.map(h => [...h]);
    const drawnCard = deck.pop();
    newHands[1].push(drawnCard);
    
    setHands(newHands);
    
    // Check if the drawn card is playable
    if (validPlay(drawnCard, topCard)) {
      showMessage(`${playerNames[1]} drew a card and can play it.`, "info");
      // AI will play it immediately if it's a good move
      setTimeout(() => {
        if (Math.random() > 0.3) { // 70% chance to play immediately
          const cardIndex = newHands[1].length - 1;
          if (drawnCard.color === 'Black') {
            const bestColor = selectBestColor(newHands[1]);
            handleAIWildCard(cardIndex, drawnCard.value, bestColor);
          } else {
            playAICard(cardIndex);
          }
        } else {
          // End turn
          setTurn(0);
          setTurns(prev => prev + 1);
        }
      }, 500);
    } else {
      showMessage(`${playerNames[1]} drew a card.`, "info");
      setTurn(0);
      setTurns(prev => prev + 1);
    }
  };
  
  // AI plays a wild card
  const handleAIWildCard = (cardIndex, cardValue, selectedColor) => {
    let newHands = hands.map(h => [...h]);
    newHands[1].splice(cardIndex, 1);
    
    const newCard = { color: selectedColor, value: cardValue };
    let newDiscard = [...discard, newCard];
    let nextTurn = 0; // Next turn goes to human player
    
    // Apply wild card effects
    if (cardValue === "Wild Draw Four") {
      if (deck.length >= 4) {
        newHands[0].push(deck.pop(), deck.pop(), deck.pop(), deck.pop());
        showMessage(`${playerNames[1]} played Wild Draw Four! You draw 4 cards and are skipped.`, "info");
      }
    } else {
      showMessage(`${playerNames[1]} played a Wild card and chose ${selectedColor}.`, "info");
    }
    
    setHands(newHands);
    setDiscard(newDiscard);
    setTurn(nextTurn);
    setCardsPlayed(prev => prev + 1);
    setTurns(prev => prev + 1);
    
    // Check for AI win
    if (newHands[1].length === 0) {
      handleRoundWin(1);
    }
  };
  
  // AI plays a regular card
  const playAICard = (cardIndex) => {
    // Safety checks
    if (!hands[1] || cardIndex >= hands[1].length || cardIndex < 0) {
      console.error('Invalid card index or hands state', { cardIndex, handsLength: hands[1]?.length });
      return;
    }
    
    let newHands = hands.map(h => [...h]);
    let playedCard = newHands[1].splice(cardIndex, 1)[0];
    
    // Additional safety check
    if (!playedCard) {
      console.error('No card found at index', cardIndex);
      return;
    }
    let newDiscard = [...discard, playedCard];
    let nextTurn = 0; // Next turn to human player
    let newDirection = direction;
    
    // Apply card effects
    if (playedCard.value === "Skip") {
      nextTurn = 1; // Skip human, AI plays again
      showMessage(`${playerNames[1]} played Skip! You are skipped.`, "info");
    }
    if (playedCard.value === "Reverse") {
      newDirection = -direction;
      showMessage(`${playerNames[1]} played Reverse! Direction reversed.`, "info");
      if (PLAYERS === 2) {
        nextTurn = 1; // In two players, reverse acts as skip
      }
    }
    if (playedCard.value === "Draw Two") {
      if (deck.length >= 2) {
        newHands[0].push(deck.pop(), deck.pop());
        showMessage(`${playerNames[1]} played Draw Two! You draw 2 cards and are skipped.`, "info");
      }
      nextTurn = 1; // Skip human player
    }
    
    if (!['Skip', 'Reverse', 'Draw Two'].includes(playedCard.value)) {
      showMessage(`${playerNames[1]} played ${playedCard.color} ${playedCard.value}.`, "info");
    }
    
    setHands(newHands);
    setDiscard(newDiscard);
    setDirection(newDirection);
    setTurn(nextTurn);
    setCardsPlayed(prev => prev + 1);
    setTurns(prev => prev + 1);
    
    // Check for AI win
    if (newHands[1].length === 0) {
      handleRoundWin(1);
    }
  };
  
  // Handle UNO button press
  const handleUnoButtonClick = () => {
    if (hands[0] && hands[0].length === 1 && turn === 0) {
      const newUnoState = [...unoButtonPressed];
      newUnoState[0] = true;
      setUnoButtonPressed(newUnoState);
      showMessage("You called UNO!", "success");
    } else if (hands[1] && hands[1].length === 1 && !unoButtonPressed[1]) {
      // Player caught opponent not saying UNO
      let newHands = hands.map(h => [...h]);
      // Add two penalty cards to opponent
      if (deck.length >= 2) {
        newHands[1].push(deck.pop(), deck.pop());
        setHands(newHands);
        showMessage(`Caught ${playerNames[1]} not saying UNO! +2 cards penalty.`, "success");
      }
    } else {
      showMessage("You can only call UNO when you have exactly one card left!", "error");
    }
  };
  
  // Display a message with the specified type
  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };
  
  // Handle wild card color selection
  const handleColorSelect = (color) => {
    if (pendingWildCard) {
      const { cardIndex, cardValue } = pendingWildCard;
      
      let newHands = hands.map(h => [...h]);
      // Remove the wild card from player's hand
      newHands[turn].splice(cardIndex, 1);
      
      // Add to discard with the selected color
      const newCard = { color, value: cardValue };
      let newDiscard = [...discard, newCard];
      let nextTurn = (turn + direction + PLAYERS) % PLAYERS;
      let newDirection = direction;
      
      // Apply wild card effects
      if (cardValue === "Wild Draw Four") {
        newHands[nextTurn].push(deck.pop(), deck.pop(), deck.pop(), deck.pop());
        showMessage(`Player ${nextTurn + 1} draws 4 cards!`, "info");
      }
      
      // Apply game rules
      setHands(newHands);
      setDiscard(newDiscard);
      setTurn(nextTurn);
      setDirection(newDirection);
      setPendingWildCard(null);
      setShowColorPicker(false);
      
      // Update statistics
      setCardsPlayed(prev => prev + 1);
      setTurns(prev => prev + 1);
      
      // Check for round winner
      if (newHands[turn].length === 0) {
        handleRoundWin(turn);
        return;
      }
      
      // Reset UNO state if player has more than 1 card
      if (newHands[turn].length !== 1) {
        const newUnoState = [...unoButtonPressed];
        newUnoState[turn] = false;
        setUnoButtonPressed(newUnoState);
      }
    }
  };
  
  // Play a card from the player's hand
  const playCard = (idx) => {
    const card = hands[turn][idx];
    
    // Handle wild cards
    if (card.color === "Black") {
      setPendingWildCard({ cardIndex: idx, cardValue: card.value });
      setShowColorPicker(true);
      return;
    }
    
    let newHands = hands.map(h => [...h]);
    let playedCard = newHands[turn].splice(idx, 1)[0];
    let newDiscard = [...discard, playedCard];
    let nextTurn = (turn + direction + PLAYERS) % PLAYERS;
    let newDirection = direction;
    
    // Apply card effects
    if (playedCard.value === "Skip") {
      nextTurn = (nextTurn + direction + PLAYERS) % PLAYERS;
      showMessage(`Player ${(turn + direction + PLAYERS) % PLAYERS + 1} is skipped!`, "info");
    }
    if (playedCard.value === "Reverse") {
      newDirection = -direction;
      showMessage("Direction reversed!", "info");
      if (PLAYERS === 2) {
        // In two player game, reverse acts as skip
        nextTurn = (nextTurn + newDirection + PLAYERS) % PLAYERS;
      }
    }
    if (playedCard.value === "Draw Two") {
      newHands[nextTurn].push(deck.pop(), deck.pop());
      showMessage(`Player ${nextTurn + 1} draws 2 cards!`, "info");
    }
    
    // Update game state
    setHands(newHands);
    setDiscard(newDiscard);
    setDirection(newDirection);
    setTurn(nextTurn);
    
    // Update statistics
    setCardsPlayed(prev => prev + 1);
    setTurns(prev => prev + 1);
    
      // Check for round winner
      if (newHands[turn].length === 0) {
        handleRoundWin(turn);
        return;
      }
      
      // Reset UNO state if player has more than 1 card
      if (newHands[turn].length !== 1) {
        const newUnoState = [...unoButtonPressed];
        newUnoState[turn] = false;
        setUnoButtonPressed(newUnoState);
      }
  };
  
  // Draw a card from the deck
  const drawCard = () => {
    // Reshuffle if deck is empty
    if (deck.length === 0) {
      showMessage("Reshuffling discard pile into the deck", "info");
      
      // Keep the top card of discard pile
      const topCard = discard[discard.length - 1];
      const newDiscard = [topCard];
      
      // Rest of discard pile becomes the new deck (shuffled)
      let newDeck = discard.slice(0, -1).sort(() => Math.random() - 0.5);
      
      setDeck(newDeck);
      setDiscard(newDiscard);
      return;
    }
    
    let newHands = hands.map(h => [...h]);
    const drawnCard = deck.pop();
    newHands[turn].push(drawnCard);
    
    // Check if drawn card is playable
    const topCard = discard[discard.length - 1];
    const isPlayable = validPlay(drawnCard, topCard);
    
    setHands(newHands);
    
    if (isPlayable) {
      showMessage(`You drew a ${drawnCard.color} ${drawnCard.value}. You can play it if you want.`, "info");
    } else {
      showMessage(`You drew a ${drawnCard.color} ${drawnCard.value}. Your turn is over.`, "info");
      setTurn((turn + direction + PLAYERS) % PLAYERS);
      setTurns(prev => prev + 1);
    }
    
    // Reset UNO button state
    const newUnoState = [...unoButtonPressed];
    newUnoState[turn] = false;
    setUnoButtonPressed(newUnoState);
  };
  
  
  // Handle different game phases
  if (gamePhase === 'setup') {
    return <PlayerSetupScreen onStartGame={handlePlayerSetup} />;
  }
  
  if (gamePhase === 'round-end') {
    return (
      <RoundWinScreen 
        roundWinner={roundWinner} 
        pointsEarned={pointsEarned} 
        playerNames={playerNames} 
        totalScores={totalScores} 
        gameWinner={gameWinner} 
        onNextRound={handleNextRound} 
        onNewGame={handleNewGame} 
      />
    );
  }

  // Main game render
  return (
    <div className="game-container">
      <div className="game-header">
        <h1 className="game-title">UNO Game</h1>
        <Scoreboard 
          playerNames={playerNames} 
          scores={totalScores} 
          targetScore={TARGET_SCORE} 
        />
        <div className="turn-indicator">
          {playerNames[turn]}'s Turn
          {direction === 1 ? " (Clockwise)" : " (Counter-Clockwise)"}
        </div>
      </div>
      
      <div className="game-board">
        <GameStats 
          turns={turns} 
          cardsPlayed={cardsPlayed} 
          timeElapsed={formatTime(seconds)} 
        />
        
        {/* Opponent Hand (Player 2) */}
        <PlayerHand 
          player={1} 
          hand={hands[1] || []} 
          playCard={() => {}} 
          validPlay={() => false} 
          topCard={topCard} 
          currentTurn={turn} 
          playerName={playerNames[1]} 
          score={totalScores[1]} 
          isOpponent={true} 
        />
        
        <div className="center-pile">
          <Deck drawCard={turn === 0 ? drawCard : () => {}} remainingCards={deck.length} />
          {topCard && <TopCard card={topCard} />}
        </div>
        
        {/* Current Player Hand (Player 1) */}
        <PlayerHand 
          player={0} 
          hand={hands[0] || []} 
          playCard={playCard} 
          validPlay={validPlay} 
          topCard={topCard} 
          currentTurn={turn} 
          playerName={playerNames[0]} 
          score={totalScores[0]} 
          isOpponent={false} 
        />
        
        <div className={`message ${messageType}`}>
          {message}
        </div>
        
        {turn === 0 && (
          <button className="draw-card-btn" onClick={drawCard}>Draw Card</button>
        )}
        
        {hands[0]?.length === 1 && turn === 0 && !unoButtonPressed[0] && (
          <button className="uno-button" onClick={handleUnoButtonClick}>UNO!</button>
        )}
      </div>
      
      {showColorPicker && (
        <ColorPicker 
          onSelectColor={handleColorSelect} 
          onClose={() => setShowColorPicker(false)} 
        />
      )}
    </div>
  );
}

export default App;
