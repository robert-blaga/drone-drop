import React from 'react';
import '../styles/PasswordDisplay.css';

const PasswordDisplay = ({ password }) => {
  return (
    <div className="password-overlay">
      <div className="password-modal">
        <div className="success-icon">🎉</div>
        <h2>Success!</h2>
        <p>Congratulations! You've delivered all the cards!</p>
        <div className="password-box">
          <p>Your password is:</p>
          <div className="password-value">{password}</div>
        </div>
      </div>
    </div>
  );
};

export default PasswordDisplay;