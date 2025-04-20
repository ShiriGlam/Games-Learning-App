import React from 'react';
import { updateGamePopularity } from '../Home/popularity';

const Runner = ({ gameId, gameUrl, words = [], onPlayed, onError }) => {
  const runGame = async () => {
    try {
      await updateGamePopularity(gameId);
  
      const gameWindow = window.open(gameUrl, '_blank');
      if (!gameWindow) throw new Error('Failed to open game window');
  
      const origin = new URL(gameUrl).origin;
  
      const listener = (event) => {
        if (event.origin !== origin) return;
        if (typeof event.data !== 'object' || !event.data.type) return;
  
        console.log("📩 received from game:", event.data);
  
        if (event.data.type === 'requestWords') {
          gameWindow.postMessage({
            type: 'injectWords',
            words,
          }, origin);
        }
  
        if (event.data.type === 'gameEvent') {
          const { event: result, details } = event.data;
          if (onPlayed) onPlayed(result, details);
          // window.removeEventListener('message', listener);
        }
      };
  
      window.addEventListener('message', listener, { once: false });
  
    } catch (error) {
      console.error('Error running game:', error);
      if (onError) onError(error.message);
    }
  };
  

  return <button onClick={runGame}>Play</button>;
};

export default Runner;
