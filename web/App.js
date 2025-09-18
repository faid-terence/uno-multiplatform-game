import React, { useState } from "react";
const COLORS = ["Red", "Green", "Blue", "Yellow"];
const VALUES = [
  ...Array(10).keys()
].map(String).concat(["Skip", "Reverse", "Draw Two"]);
const SPECIALS = ["Wild", "Wild Draw Four"];

function makeDeck() {
  let deck = [];
  for (let color of COLORS) {
    for (let value of VALUES) {
      deck.push({ color, value });
      if (value !== "0") deck.push({ color, value });
    }
  }
  for (let s of SPECIALS) deck.push({ color: "Black", value: s }, { color: "Black", value: s }, { color: "Black", value: s }, { color: "Black", value: s });
  deck = deck.sort(() => Math.random() - 0.5);
  return deck;
}

function validPlay(card, top, wildColor = null) {
  if (card.color === "Black") return true;
  
  const topColor = top.color === "Black" ? wildColor : top.color;
  return card.color === topColor || card.value === top.value;
}

function App() {
  const [gameState, setGameState] = useState(() => {
    const deck = makeDeck();
    const hands = [[], [], [], []];
    
    // Deal 7 cards to each player
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 7; j++) {
        hands[i].push(deck.pop());
      }
    }
    
    const discard = [deck.pop()];
    
    return {
      deck,
      hands,
      discard,
      turn: 0,
      direction: 1,
      message: "",
      winner: null,
      wildColor: null
    };
  });

  const { deck, hands, discard, turn, direction, message, winner, wildColor } = gameState;

  const playCard = (idx, selectedColor = null) => {
    if (winner) return;
    
    const newGameState = { ...gameState };
    const newHands = hands.map(h => [...h]);
    const card = newHands[turn].splice(idx, 1)[0];
    const newDiscard = [...discard, card];
    
    let nextTurn = (turn + direction + 4) % 4;
    let newDirection = direction;
    let newMessage = "";
    let newWildColor = null;
    
    // Handle special cards
    if (card.value === "Skip") {
      nextTurn = (nextTurn + direction + 4) % 4;
      newMessage = `Player ${nextTurn + 1} was skipped!`;
    } else if (card.value === "Reverse") {
      newDirection = -direction;
      nextTurn = (turn + newDirection + 4) % 4;
      newMessage = "Direction reversed!";
    } else if (card.value === "Draw Two") {
      for (let i = 0; i < 2; i++) {
        if (newGameState.deck.length > 0) {
          newHands[nextTurn].push(newGameState.deck.pop());
        }
      }
      nextTurn = (nextTurn + newDirection + 4) % 4;
      newMessage = `Player ${nextTurn - newDirection + 4} draws 2 cards and is skipped!`;
    } else if (card.value === "Wild") {
      newWildColor = selectedColor || "Red";
      newMessage = `Wild card played! Color changed to ${newWildColor}`;
    } else if (card.value === "Wild Draw Four") {
      for (let i = 0; i < 4; i++) {
        if (newGameState.deck.length > 0) {
          newHands[nextTurn].push(newGameState.deck.pop());
        }
      }
      newWildColor = selectedColor || "Red";
      nextTurn = (nextTurn + newDirection + 4) % 4;
      newMessage = `Player ${nextTurn - newDirection + 4} draws 4 cards and is skipped! Color changed to ${newWildColor}`;
    }
    
    // Check for winner
    let newWinner = null;
    if (newHands[turn].length === 0) {
      newWinner = turn + 1;
      newMessage = `Player ${newWinner} wins!`;
    }
    
    setGameState({
      ...newGameState,
      hands: newHands,
      discard: newDiscard,
      turn: newWinner ? turn : nextTurn,
      direction: newDirection,
      message: newMessage,
      winner: newWinner,
      wildColor: newWildColor
    });
  };

  const drawCard = () => {
    if (winner || gameState.deck.length === 0) return;
    
    const newHands = hands.map(h => [...h]);
    newHands[turn].push(gameState.deck.pop());
    
    setGameState({
      ...gameState,
      hands: newHands,
      turn: (turn + direction + 4) % 4,
      message: "No playable card, you drew a card and turn passed."
    });
  };

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState(null);
  
  const topCard = discard[discard.length - 1];
  const hand = hands[turn];
  const playable = hand.map((c, i) => validPlay(c, topCard, wildColor));
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState(null);
  
  const handleCardClick = (idx) => {
    const card = hand[idx];
    if (!playable[idx] || winner) return;
    
    if (card.color === "Black") {
      setPendingWildCard(idx);
      setShowColorPicker(true);
    } else {
      playCard(idx);
    }
  };
  
  const handleColorSelection = (color) => {
    if (pendingWildCard !== null) {
      playCard(pendingWildCard, color);
      setPendingWildCard(null);
    }
    setShowColorPicker(false);
  };
  
  const getCardStyle = (card, isPlayable, isCurrentPlayer) => {
    const baseStyle = {
      padding: "8px 12px",
      margin: "2px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize: "12px",
      minWidth: "60px",
      cursor: isCurrentPlayer && isPlayable ? "pointer" : "default"
    };
    
    if (card.color === "Black") {
      return { ...baseStyle, backgroundColor: isPlayable ? "#333" : "#888", color: "white" };
    }
    
    const colorMap = {
      "Red": "#ff4444",
      "Green": "#44ff44", 
      "Blue": "#4444ff",
      "Yellow": "#ffff44"
    };
    
    return {
      ...baseStyle,
      backgroundColor: isPlayable ? colorMap[card.color] || "#fff" : "#ddd",
      color: card.color === "Yellow" ? "#000" : "#fff"
    };
  };

  return (
    <div style={{padding: 20, fontFamily: "Arial, sans-serif"}}>
      <h1>UNO Game</h1>
      
      {winner ? (
        <div style={{fontSize: "24px", color: "green", textAlign: "center", marginBottom: "20px"}}>
          🎉 Player {winner} Wins! 🎉
          <br />
          <button 
            onClick={() => window.location.reload()} 
            style={{marginTop: "10px", padding: "10px 20px", fontSize: "16px"}}
          >
            New Game
          </button>
        </div>
      ) : (
        <div style={{textAlign: "center", marginBottom: "20px"}}>
          <h2>Player {turn + 1}'s Turn</h2>
          <div style={{fontSize: "18px", marginBottom: "10px"}}>
            Top Card: 
            <span style={{
              padding: "4px 8px", 
              marginLeft: "10px",
              borderRadius: "4px",
              backgroundColor: topCard.color === "Black" ? "#333" : (
                topCard.color === "Red" ? "#ff4444" :
                topCard.color === "Green" ? "#44ff44" :
                topCard.color === "Blue" ? "#4444ff" :
                topCard.color === "Yellow" ? "#ffff44" : "#fff"
              ),
              color: topCard.color === "Yellow" ? "#000" : "#fff"
            }}>
              {topCard.color === "Black" && wildColor ? `${wildColor} (${topCard.value})` : `${topCard.color} ${topCard.value}`}
            </span>
          </div>
          {message && <div style={{color: "#666", marginBottom: "10px"}}>{message}</div>}
        </div>
      )}
      
      {/* All Players Display */}
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px"}}>
        {hands.map((playerHand, playerIndex) => (
          <div key={playerIndex} style={{
            border: playerIndex === turn ? "3px solid #007bff" : "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            backgroundColor: playerIndex === turn ? "#f0f8ff" : "#f9f9f9"
          }}>
            <h3>Player {playerIndex + 1} ({playerHand.length} cards)</h3>
            <div style={{display: "flex", flexWrap: "wrap", gap: "4px"}}>
              {playerIndex === turn ? (
                // Show actual cards for current player
                playerHand.map((card, cardIndex) => (
                  <button
                    key={cardIndex}
                    onClick={() => handleCardClick(cardIndex)}
                    disabled={!playable[cardIndex] || winner}
                    style={getCardStyle(card, playable[cardIndex], true)}
                  >
                    {card.color === "Black" ? card.value : `${card.color[0]}${card.value}`}
                  </button>
                ))
              ) : (
                // Show card backs for other players
                playerHand.map((_, cardIndex) => (
                  <div
                    key={cardIndex}
                    style={{
                      width: "60px",
                      height: "32px",
                      backgroundColor: "#8B4513",
                      border: "1px solid #654321",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "10px",
                      margin: "2px"
                    }}
                  >
                    UNO
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Current Player Controls */}
      {!winner && (
        <div style={{textAlign: "center", marginTop: "20px"}}>
          <button 
            onClick={drawCard} 
            disabled={gameState.deck.length === 0}
            style={{
              padding: "10px 20px", 
              fontSize: "16px", 
              backgroundColor: "#28a745", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: gameState.deck.length === 0 ? "not-allowed" : "pointer"
            }}
          >
            Draw Card ({gameState.deck.length} left)
          </button>
        </div>
      )}
      
      {/* Color Picker Modal */}
      {showColorPicker && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <h3>Choose a color:</h3>
            <div style={{display: "flex", gap: "10px", justifyContent: "center"}}>
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => handleColorSelection(color)}
                  style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: color === "Red" ? "#ff4444" :
                                   color === "Green" ? "#44ff44" :
                                   color === "Blue" ? "#4444ff" : "#ffff44",
                    border: "2px solid #333",
                    borderRadius: "8px",
                    color: color === "Yellow" ? "#000" : "#fff",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;