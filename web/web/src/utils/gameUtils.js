import { COLORS, VALUES, SPECIALS, CARD_POINTS } from '../constants/gameConstants';

// Create and shuffle a new deck
export function makeDeck() {
  let deck = [];
  
  // Add number and action cards
  for (let color of COLORS) {
    for (let value of VALUES) {
      deck.push({ color, value });
      if (value !== "0") deck.push({ color, value }); // Two of each except 0
    }
  }
  
  // Add special cards
  for (let special of SPECIALS) {
    for (let i = 0; i < 4; i++) {
      deck.push({ color: "Black", value: special });
    }
  }
  
  // Shuffle the deck thoroughly
  for (let i = 0; i < 3; i++) {
    deck = deck.sort(() => Math.random() - 0.5);
  }
  
  return deck;
}

// Check if a card can be played on top of another card
export function validPlay(card, topCard) {
  if (!topCard) return false;
  return card.color === topCard.color || 
         card.value === topCard.value || 
         card.color === "Black";
}

// Format time in MM:SS format
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Calculate points from remaining cards in hand
export function calculateHandPoints(hand) {
  return hand.reduce((total, card) => {
    return total + (CARD_POINTS[card.value] || 0);
  }, 0);
}

// AI utility function to select best color for wild cards
export function selectBestColor(hand) {
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