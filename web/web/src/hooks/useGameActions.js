import { useEffect } from 'react';
import { PLAYERS } from '../constants/gameConstants';
import { validPlay } from '../utils/gameUtils';

export const useGameActions = ({
  gameState,
  showMessage,
  handleRoundWin
}) => {
  const {
    gamePhase,
    hands,
    deck,
    discard,
    turn,
    direction,
    unoButtonPressed,
    playerNames,
    setDeck,
    setHands,
    setDiscard,
    setTurn,
    setDirection,
    setPendingWildCard,
    setShowColorPicker,
    setUnoButtonPressed,
    setCardsPlayed,
    setTurns
  } = gameState;

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
  }, [hands, turn, unoButtonPressed, gamePhase, playerNames, setUnoButtonPressed, showMessage]);

  // Handle wild card color selection
  const handleColorSelect = (color) => {
    if (gameState.pendingWildCard) {
      const { cardIndex, cardValue } = gameState.pendingWildCard;
      
      let newHands = hands.map(h => [...h]);
      // Remove the wild card from player's hand
      newHands[turn].splice(cardIndex, 1);
      
      // Add to discard with the selected color
      const newCard = { color, value: cardValue };
      let newDiscard = [...discard, newCard];
      let nextTurn = (turn + direction + PLAYERS) % PLAYERS;
      
      // Apply wild card effects
      if (cardValue === "Wild Draw Four") {
        newHands[nextTurn].push(deck.pop(), deck.pop(), deck.pop(), deck.pop());
        showMessage(`Player ${nextTurn + 1} draws 4 cards!`, "info");
      }
      
      // Apply game rules
      setHands(newHands);
      setDiscard(newDiscard);
      setTurn(nextTurn);
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

  return {
    playCard,
    drawCard,
    handleColorSelect,
    handleUnoButtonClick
  };
};