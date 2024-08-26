import React from 'react';
import '../styles/GameDashboard.css';

const GameDashboard = ({ locationsCompleted, availableCards }) => {
  return (
    <div className="game-dashboard">
      <div className="dashboard-item">
        <span>Locations:</span> {locationsCompleted}/5
      </div>
      <div className="dashboard-item">
        <span>Available Cards:</span> {availableCards}
      </div>
    </div>
  );
};

export default GameDashboard;
