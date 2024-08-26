import React, { useCallback, useEffect, useState, useRef } from 'react';
import Drone from './Drone';
import Map from './Map';
import PasswordDisplay from './PasswordDisplay';
import '../styles/App.css';
import '../styles/Map.css';
const DROP_SPEED = 2;

const App = () => {
  const [locations, setLocations] = useState({
    city: false,
    smallBusiness: false,
    largeOffice: false,
    village: false,
    oilRig: false,
  });

  const [dronePosition, setDronePosition] = useState({ x: 50, y: window.innerHeight - 100 });
  const [droppedCards, setDroppedCards] = useState([]);
  const [activeCards, setActiveCards] = useState([]);
  const [droneVelocity, setDroneVelocity] = useState({ x: 0, y: 0 });

  const [volume, setVolume] = useState(0.5);
  const [defaultVolume] = useState(0.5);
  const audioRef = useRef(null);

  const startAudio = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(error => console.error("Audio play failed:", error));
    }
  }, []);

  useEffect(() => {
    audioRef.current = new Audio(`${process.env.PUBLIC_URL}/assets/drone.mp3`);
    audioRef.current.loop = true;

    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleDrop = useCallback(() => {
    const droneSize = 50;
    const cardSize = 40;
    const newCard = {
      x: dronePosition.x + (droneSize - cardSize) / 2,
      y: dronePosition.y + droneSize,
      id: Date.now(),
      velocity: DROP_SPEED
    };
    setActiveCards(prev => [...prev, newCard]);
  }, [dronePosition]);

  const handleKeyPress = useCallback((e) => {
    startAudio();
    const acceleration = 2;
    switch (e.key) {
      case 'ArrowUp':
        setDroneVelocity(prev => ({ ...prev, y: Math.max(prev.y - acceleration, -10) }));
        break;
      case 'ArrowDown':
        setDroneVelocity(prev => ({ ...prev, y: Math.min(prev.y + acceleration, 10) }));
        break;
      case 'ArrowLeft':
        setDroneVelocity(prev => ({ ...prev, x: Math.max(prev.x - acceleration, -10) }));
        break;
      case 'ArrowRight':
        setDroneVelocity(prev => ({ ...prev, x: Math.min(prev.x + acceleration, 10) }));
        break;
      case ' ':
        handleDrop();
        break;
      default:
        break;
    }
    setVolume(1);
  }, [handleDrop, startAudio]);

  const handleKeyRelease = useCallback((e) => {
    const deceleration = 1;
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        setDroneVelocity(prev => ({ ...prev, y: prev.y > 0 ? Math.max(prev.y - deceleration, 0) : Math.min(prev.y + deceleration, 0) }));
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        setDroneVelocity(prev => ({ ...prev, x: prev.x > 0 ? Math.max(prev.x - deceleration, 0) : Math.min(prev.x + deceleration, 0) }));
        break;
      default:
        break;
    }
    setVolume(defaultVolume);
  }, [defaultVolume]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyRelease);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyRelease);
    };
  }, [handleKeyPress, handleKeyRelease]);

  const checkCollision = useCallback((cardPosition) => {
    if (!cardPosition) return false;
    const locationTypes = ['city', 'smallBusiness', 'largeOffice', 'village', 'oilRig'];
    for (const locationType of locationTypes) {
      const locationElement = document.querySelector(`.location.${locationType}`);
      if (locationElement) {
        const rect = locationElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const radius = rect.width / 2;
        
        const dx = cardPosition.x - centerX;
        const dy = cardPosition.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= radius) {
          setLocations(prev => ({ ...prev, [locationType]: true }));
          return true;
        }
      }
    }
    return false;
  }, []);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setDronePosition(prev => ({
        x: Math.max(0, Math.min(window.innerWidth - 50, prev.x + droneVelocity.x)),
        y: Math.max(0, Math.min(window.innerHeight - 50, prev.y + droneVelocity.y))
      }));
    }, 16); // ~60 fps

    return () => clearInterval(moveInterval);
  }, [droneVelocity]);

  useEffect(() => {
    let animationFrameId;

    const moveCards = () => {
      setActiveCards(prevCards => {
        if (!Array.isArray(prevCards)) return [];
        return prevCards.reduce((acc, card) => {
          const newY = card.y + card.velocity;
          const hasCollided = checkCollision({ ...card, y: newY });
          if (hasCollided) {
            setDroppedCards(prev => [...prev, card]);
          } else if (newY < window.innerHeight) {
            acc.push({ ...card, y: newY });
          }
          return acc;
        }, []);
      });

      animationFrameId = requestAnimationFrame(moveCards);
    };

    animationFrameId = requestAnimationFrame(moveCards);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [checkCollision]);

  const allLocationsCovered = Object.values(locations).every(Boolean);

  return (
    <div className="App">
      <Map 
        locations={locations}
        activeCards={activeCards}
        droppedCards={droppedCards}
      >
        <Drone position={dronePosition} />
      </Map>
      {allLocationsCovered && <PasswordDisplay password="RISE" />}
    </div>
  );
};

export default App;