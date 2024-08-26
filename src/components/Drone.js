import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/Drone.css';

const DRONE_SIZE = 50;
const MOVE_SPEED = 500; // pixels per second
const ACCELERATION = 300; // pixels per second squared
const DECELERATION = 200; // pixels per second squared
const DROP_SPEED = 10; // Initial drop speed (pixels per frame)
const GRAVITY = 1; // Acceleration due to gravity (pixels per frame squared)

const Drone = ({ onLocationUpdate, onCardDrop }) => {
  const canvasRef = useRef(null);
  const dronePositionRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight - 100 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const movementRef = useRef({ w: false, a: false, s: false, d: false });
  const lastUpdateTimeRef = useRef(0);
  const [activeCards, setActiveCards] = useState([]);
  const [droppedCards, setDroppedCards] = useState([]);
  const audioRef = useRef(null);
  const droneImageRef = useRef(null);
  const cardImageRef = useRef(null);

  useEffect(() => {
    // Reset drone position and other states when component is re-mounted
    dronePositionRef.current = { x: window.innerWidth / 2, y: window.innerHeight - 100 };
    velocityRef.current = { x: 0, y: 0 };
    movementRef.current = { w: false, a: false, s: false, d: false };
    lastUpdateTimeRef.current = 0;
    setActiveCards([]);
    setDroppedCards([]);

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    audioRef.current = new Audio(`${process.env.PUBLIC_URL}/assets/drone.mp3`);
    audioRef.current.loop = true;

    droneImageRef.current = new Image();
    droneImageRef.current.src = `${process.env.PUBLIC_URL}/assets/drone.png`;

    cardImageRef.current = new Image();
    cardImageRef.current.src = `${process.env.PUBLIC_URL}/assets/creditCard.png`;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      dronePositionRef.current.x = Math.min(dronePositionRef.current.x, canvas.width - DRONE_SIZE);
      dronePositionRef.current.y = Math.min(dronePositionRef.current.y, canvas.height - DRONE_SIZE);
    };

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this effect runs only on mount and unmount

  const startAudio = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(error => console.error("Audio play failed:", error));
    }
  }, []);

  const handleDrop = useCallback(() => {
    if (onCardDrop()) {
      const newCard = {
        x: dronePositionRef.current.x + (DRONE_SIZE - 40) / 2,
        y: dronePositionRef.current.y + DRONE_SIZE,
        id: Date.now(),
        velocity: DROP_SPEED
      };
      setActiveCards(prev => [...prev, newCard]);
    }
  }, [onCardDrop]);

  const updateVelocity = (axis, positive, negative, deltaTime) => {
    const direction = positive ? 1 : negative ? -1 : 0;
    if (direction !== 0) {
      velocityRef.current[axis] += direction * ACCELERATION * deltaTime;
      velocityRef.current[axis] = Math.min(Math.max(velocityRef.current[axis], -MOVE_SPEED), MOVE_SPEED);
    } else {
      const deceleration = DECELERATION * deltaTime;
      if (Math.abs(velocityRef.current[axis]) <= deceleration) {
        velocityRef.current[axis] = 0;
      } else {
        velocityRef.current[axis] -= Math.sign(velocityRef.current[axis]) * deceleration;
      }
    }
  };

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
          onLocationUpdate(locationType, true);
          locationElement.classList.add('success');
          return true;
        }
      }
    }
    return false;
  }, [onLocationUpdate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const gameLoop = (currentTime) => {
      if (!lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = currentTime;
      }

      const deltaTime = (currentTime - lastUpdateTimeRef.current) / 1000;
      lastUpdateTimeRef.current = currentTime;

      updateVelocity('x', movementRef.current.d, movementRef.current.a, deltaTime);
      updateVelocity('y', movementRef.current.s, movementRef.current.w, deltaTime);

      dronePositionRef.current.x += velocityRef.current.x * deltaTime;
      dronePositionRef.current.y += velocityRef.current.y * deltaTime;

      dronePositionRef.current.x = Math.max(0, Math.min(canvas.width - DRONE_SIZE, dronePositionRef.current.x));
      dronePositionRef.current.y = Math.max(0, Math.min(canvas.height - DRONE_SIZE, dronePositionRef.current.y));

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw drone
      if (droneImageRef.current) {
        ctx.drawImage(droneImageRef.current, dronePositionRef.current.x, dronePositionRef.current.y, DRONE_SIZE, DRONE_SIZE);
      }

      // Update and draw cards
      const updatedCards = activeCards.map(card => {
        const newY = card.y + card.velocity;
        const hasCollided = checkCollision({ ...card, y: newY });
        
        if (hasCollided) {
          setDroppedCards(prev => [...prev, { ...card, y: newY }]);
          return null;
        } else if (newY < canvas.height - 40) {
          const updatedCard = { 
            ...card, 
            y: newY, 
            velocity: card.velocity + GRAVITY
          };
          if (cardImageRef.current) {
            ctx.drawImage(cardImageRef.current, updatedCard.x, updatedCard.y, 40, 40);
          }
          return updatedCard;
        } else {
          setDroppedCards(prev => [...prev, { ...card, y: canvas.height - 40 }]);
          return null;
        }
      }).filter(Boolean);

      setActiveCards(updatedCards);

      // Draw dropped cards
      droppedCards.forEach(card => {
        if (cardImageRef.current) {
          ctx.drawImage(cardImageRef.current, card.x, card.y, 40, 40);
        }
      });

      requestAnimationFrame(gameLoop);
    };

    const handleKeyDown = (e) => {
      startAudio();
      movementRef.current[e.key.toLowerCase()] = true;
      if (e.key === ' ') {
        handleDrop();
      }
      if (audioRef.current) {
        audioRef.current.volume = 1;
      }
    };

    const handleKeyUp = (e) => {
      movementRef.current[e.key.toLowerCase()] = false;
      if (audioRef.current) {
        audioRef.current.volume = 0.5;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [startAudio, handleDrop, checkCollision, activeCards, droppedCards]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
      }}
    />
  );
};

export default Drone;