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

function validPlay(card, top) {
  return card.color === top.color || card.value === top.value || card.color === "Black";
}

function App() {
  const [deck, setDeck] = useState(makeDeck());
  const [hands, setHands] = useState([[], [], [], []].map(() => deck.splice(0, 7)));
  const [discard, setDiscard] = useState([deck.pop()]);
  const [turn, setTurn] = useState(0);
  const [direction, setDirection] = useState(1);
  const [message, setMessage] = useState("");

  const playCard = (idx) => {
    let newHands = hands.map(h => [...h]);
    let card = newHands[turn].splice(idx, 1)[0];
    let newDiscard = [...discard, card];
    let nextTurn = (turn + direction + 4) % 4;
    let newDirection = direction;

    if (card.value === "Skip") nextTurn = (nextTurn + direction + 4) % 4;
    if (card.value === "Reverse") newDirection = -direction;
    if (card.value === "Draw Two") newHands[nextTurn].push(deck.pop(), deck.pop());
    if (card.value === "Wild Draw Four") newHands[nextTurn].push(deck.pop(), deck.pop(), deck.pop(), deck.pop());

    setHands(newHands);
    setDiscard(newDiscard);
    setTurn(nextTurn);
    setDirection(newDirection);
    setMessage("");
  };

  const drawCard = () => {
    let newHands = hands.map(h => [...h]);
    newHands[turn].push(deck.pop());
    setHands(newHands);
    setMessage("No playable card, you drew a card.");
    setTurn((turn + direction + 4) % 4);
  };

  const topCard = discard[discard.length - 1];
  const hand = hands[turn];
  const playable = hand.map((c, i) => validPlay(c, topCard));

  return (
    <div style={{padding: 20}}>
      <h2>UNO - Player {turn + 1}'s turn</h2>
      <div>Top card: <b style={{color:topCard.color.toLowerCase()}}>{topCard.color} {topCard.value}</b></div>
      <div>Your hand:</div>
      <div style={{display: "flex", gap: 10}}>
        {hand.map((card, i) => (
          <button key={i}
            onClick={() => playable[i] && playCard(i)}
            disabled={!playable[i]}
            style={{background: playable[i] ? "#fff" : "#ddd", color: card.color.toLowerCase()}}>
            {card.color} {card.value}
          </button>
        ))}
      </div>
      <button onClick={drawCard} style={{marginTop: 10}}>Draw Card</button>
      <div style={{marginTop: 20, color: "red"}}>{message}</div>
      <div style={{marginTop: 20}}>
        {hands.some(h => h.length === 0) && <b>Player {hands.findIndex(h => h.length === 0) + 1} wins!</b>}
      </div>
    </div>
  );
}

export default App;