import React from 'react';
import '../styles/PasswordDisplay.css';

const PasswordDisplay = ({ password }) => {
  return (
    <div className="password-display">
      <h2>Success!</h2>
      <p>The Password is "{password}"</p>
    </div>
  );
};

export default PasswordDisplay;