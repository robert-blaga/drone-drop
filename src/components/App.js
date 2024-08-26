import React, { useCallback, useState, useEffect } from 'react';
import Drone from './Drone';
import Map from './Map';
import PasswordDisplay from './PasswordDisplay';
import GameDashboard from './GameDashboard';
import '../styles/App.css';

const INITIAL_CARDS = 5;

const App = () => {
  const [locations, setLocations] = useState({
    city: false,
    smallBusiness: false,
    largeOffice: false,
    village: false,
    oilRig: false,
  });
  const [availableCards, setAvailableCards] = useState(INITIAL_CARDS);
  const [gameOver, setGameOver] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  const handleLocationUpdate = useCallback((locationType, value) => {
    setLocations(prev => ({ ...prev, [locationType]: value }));
  }, []);

  const handleCardDrop = useCallback(() => {
    if (availableCards > 0) {
      setAvailableCards(prev => prev - 1);
      return true;
    }
    return false;
  }, [availableCards]);

  const resetGame = useCallback(() => {
    setLocations({
      city: false,
      smallBusiness: false,
      largeOffice: false,
      village: false,
      oilRig: false,
    });
    setAvailableCards(INITIAL_CARDS);
    setGameOver(false);
    setRestartKey(prev => prev + 1);
  }, []);

  const locationsCompleted = Object.values(locations).filter(Boolean).length;
  const allLocationsCovered = locationsCompleted === 5;

  useEffect(() => {
    if (availableCards === 0 && !allLocationsCovered) {
      setGameOver(true);
    } else if (allLocationsCovered) {
      setGameOver(false);
    }
  }, [availableCards, allLocationsCovered]);

  return (
    <div className="App" style={{ position: 'relative', overflow: 'hidden' }}>
      <Map locations={locations}>
        <Drone 
          key={restartKey}
          onLocationUpdate={handleLocationUpdate} 
          onCardDrop={handleCardDrop} 
        />
      </Map>
      <GameDashboard locationsCompleted={locationsCompleted} availableCards={availableCards} />
      {allLocationsCovered && <PasswordDisplay password="RISE" />}
      {gameOver && !allLocationsCovered && (
        <div className="game-over">
          <h2>You've lost some customers... try again</h2>
          <button onClick={resetGame}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default App;