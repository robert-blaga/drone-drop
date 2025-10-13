import React, { useState, useEffect } from 'react';
import '../styles/GameStart.css';

const GameStart = ({ onGameStart }) => {
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (isCountingDown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isCountingDown && countdown === 0) {
      onGameStart();
    }
  }, [isCountingDown, countdown, onGameStart]);

  const handleStartClick = () => {
    setIsCountingDown(true);
  };

  if (!isCountingDown) {
    return (
      <div className="game-start-overlay">
        <div className="game-instructions">
          <h2>How to Play</h2>
          <div className="instruction-list">
            <p>Use the <span className="key">Arrow Keys</span> to move the drone</p>
            <p><span className="key">SPACE</span> to drop credit cards</p>
            <p>Deliver cards to all customers to reveal the password</p>
          </div>
        </div>
        <button className="start-button" onClick={handleStartClick}>
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="game-start-overlay">
      <div className="countdown">{countdown}</div>
    </div>
  );
};

export default GameStart; 
