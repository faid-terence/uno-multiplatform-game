// Game configuration constants
export const COLORS = ["Red", "Green", "Blue", "Yellow"];

export const VALUES = [
  ...Array(10).keys()
].map(String).concat(["Skip", "Reverse", "Draw Two"]);

export const SPECIALS = ["Wild", "Wild Draw Four"];

export const PLAYERS = 2;
export const STARTING_CARDS = 7;
export const TARGET_SCORE = 500; // First to 500 points wins the game

// Card point values for scoring
export const CARD_POINTS = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'Skip': 20, 'Reverse': 20, 'Draw Two': 20,
  'Wild': 50, 'Wild Draw Four': 50
};