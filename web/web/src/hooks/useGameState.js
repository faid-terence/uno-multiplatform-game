import { useState, useEffect, useRef } from 'react';
import { PLAYERS, STARTING_CARDS, TARGET_SCORE } from '../constants/gameConstants';
import { makeDeck, calculateHandPoints } from '../utils/gameUtils';

export const useGameState = () => {
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
  const [finalHands, setFinalHands] = useState([]);
  
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

  // Get the top card of the discard pile
  const topCard = discard.length > 0 ? discard[discard.length - 1] : null;

  // Display a message with the specified type
  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

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
    setFinalHands([]);
    
    // Reset statistics
    setTurns(0);
    setCardsPlayed(0);
    setSeconds(0);
  };

  // Handle round completion
  const handleRoundWin = (winnerIndex) => {
    const loserIndex = winnerIndex === 0 ? 1 : 0;
    const pointsFromOpponent = calculateHandPoints(hands[loserIndex]);
    
    // Store final hands for display in round end screen
    setFinalHands([...hands]);
    
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
    setFinalHands([]);
  };

  return {
    // State
    gamePhase,
    playerNames,
    totalScores,
    deck,
    hands,
    discard,
    turn,
    direction,
    message,
    messageType,
    showColorPicker,
    pendingWildCard,
    roundWinner,
    pointsEarned,
    gameWinner,
    unoButtonPressed,
    finalHands,
    turns,
    cardsPlayed,
    seconds,
    topCard,

    // Setters
    setDeck,
    setHands,
    setDiscard,
    setTurn,
    setDirection,
    setShowColorPicker,
    setPendingWildCard,
    setUnoButtonPressed,
    setCardsPlayed,
    setTurns,

    // Actions
    showMessage,
    handlePlayerSetup,
    startNewRound,
    handleRoundWin,
    handleNextRound,
    handleNewGame
  };
};