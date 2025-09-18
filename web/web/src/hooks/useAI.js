import { useEffect, useCallback } from 'react';
import { validPlay, selectBestColor } from '../utils/gameUtils';

export const useAI = ({
  gamePhase,
  turn,
  hands,
  topCard,
  onPlayCard,
  onPlayWildCard,
  onDrawCard,
  showMessage,
  playerNames
}) => {
  // AI Move Logic
  const makeAIMove = useCallback(() => {
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
        onPlayWildCard(selectedPlay.index, selectedPlay.card.value, bestColor);
      } else {
        // Play regular card
        onPlayCard(selectedPlay.index);
      }
    } else {
      // No playable cards, draw a card
      onDrawCard();
    }
  }, [topCard, hands, turn, onPlayCard, onPlayWildCard, onDrawCard]);

  // AI Player Logic trigger
  useEffect(() => {
    if (gamePhase === 'playing' && turn === 1 && hands.length > 0 && topCard) {
      // Delay AI move to make it feel more natural
      const aiTimer = setTimeout(() => {
        makeAIMove();
      }, 1000 + Math.random() * 1000); // 1-2 second delay
      
      return () => clearTimeout(aiTimer);
    }
  }, [turn, gamePhase, hands, topCard, makeAIMove]);

  return { makeAIMove };
};