import React, { useCallback, useEffect, useRef, useState } from "react";
import "../styles/Drone.css";
import GameStart from "./GameStart";

const DRONE_SIZE = 65;
const MOVE_SPEED = 320; // Drone travel speed in pixels per second
const DROP_SPEED = 10; // Initial drop speed (pixels per frame)
const GRAVITY = 1; // Acceleration due to gravity (pixels per frame squared)

const Drone = ({ onLocationUpdate, onCardDrop, onCardSettled }) => {
  const canvasRef = useRef(null);
  const dronePositionRef = useRef({
    x: window.innerWidth / 2 - DRONE_SIZE / 2,
    y: window.innerHeight - 100,
  });
  const movementRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const lastUpdateTimeRef = useRef(0);
  const [activeCards, setActiveCards] = useState([]);
  const [droppedCards, setDroppedCards] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const audioRef = useRef(null);
  const droneImageRef = useRef(null);
  const cardImageRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  useEffect(() => {
    // Reset drone position to bottom when remounted
    dronePositionRef.current = {
      x: window.innerWidth / 2 - DRONE_SIZE / 2,
      y: window.innerHeight - 100,
    };
    movementRef.current = { up: false, down: false, left: false, right: false };
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
      dronePositionRef.current.x = Math.min(
        dronePositionRef.current.x,
        canvas.width - DRONE_SIZE
      );
      dronePositionRef.current.y = Math.min(
        dronePositionRef.current.y,
        canvas.height - DRONE_SIZE
      );
    };

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this effect runs only on mount and unmount

  const startAudio = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current
        .play()
        .catch((error) => console.error("Audio play failed:", error));
    }
  }, []);

  const handleDrop = useCallback(() => {
    if (onCardDrop()) {
      const newCard = {
        x: dronePositionRef.current.x + (DRONE_SIZE - 40) / 2,
        y: dronePositionRef.current.y + DRONE_SIZE,
        id: Date.now(),
        velocity: DROP_SPEED,
      };
      setActiveCards((prev) => [...prev, newCard]);
    }
  }, [onCardDrop]);

  const checkCollision = useCallback(
    (cardPosition) => {
      if (!cardPosition) return false;
      const locationTypes = [
        "city",
        "smallBusiness",
        "largeOffice",
        "village",
        "oilRig",
      ];
      for (const locationType of locationTypes) {
        const locationElement = document.querySelector(
          `.location.${locationType}`
        );
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
            locationElement.classList.add("success");
            return true;
          }
        }
      }
      return false;
    },
    [onLocationUpdate]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const gameLoop = (currentTime) => {
      if (!lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = currentTime;
      }

      const deltaTime = (currentTime - lastUpdateTimeRef.current) / 1000;
      lastUpdateTimeRef.current = currentTime;

      if (gameStarted) {
        const horizontal =
          (movementRef.current.right ? 1 : 0) -
          (movementRef.current.left ? 1 : 0);
        const vertical =
          (movementRef.current.down ? 1 : 0) - (movementRef.current.up ? 1 : 0);

        let moveX = horizontal;
        let moveY = vertical;

        if (moveX !== 0 && moveY !== 0) {
          const normalizer = Math.SQRT1_2; // Keep diagonal speed consistent
          moveX *= normalizer;
          moveY *= normalizer;
        }

        const moveDistance = MOVE_SPEED * deltaTime;
        const deltaX = moveX * moveDistance;
        const deltaY = moveY * moveDistance;

        dronePositionRef.current.x += deltaX;
        dronePositionRef.current.y += deltaY;

        dronePositionRef.current.x = Math.max(
          0,
          Math.min(canvas.width - DRONE_SIZE, dronePositionRef.current.x)
        );
        dronePositionRef.current.y = Math.max(
          0,
          Math.min(canvas.height - DRONE_SIZE, dronePositionRef.current.y)
        );
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw drone with highlight effect
      if (droneImageRef.current) {
        // Add highlight circle behind drone
        ctx.beginPath();
        ctx.arc(
          dronePositionRef.current.x + DRONE_SIZE / 2,
          dronePositionRef.current.y + DRONE_SIZE / 2,
          DRONE_SIZE * 0.75,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(255, 255, 0, 0.2)";
        ctx.fill();

        // Draw the drone
        ctx.drawImage(
          droneImageRef.current,
          dronePositionRef.current.x,
          dronePositionRef.current.y,
          DRONE_SIZE,
          DRONE_SIZE
        );
      }

      // Only update cards if game has started
      if (gameStarted) {
        // Update and draw cards
        const updatedCards = activeCards
          .map((card) => {
            const newY = card.y + card.velocity;
            const hasCollided = checkCollision({ ...card, y: newY });

            if (hasCollided) {
              setDroppedCards((prev) => [...prev, { ...card, y: newY }]);
              onCardSettled();
              return null;
            } else if (newY < canvas.height - 40) {
              const updatedCard = {
                ...card,
                y: newY,
                velocity: card.velocity + GRAVITY,
              };
              if (cardImageRef.current) {
                ctx.drawImage(
                  cardImageRef.current,
                  updatedCard.x,
                  updatedCard.y,
                  40,
                  40
                );
              }
              return updatedCard;
            } else {
              setDroppedCards((prev) => [
                ...prev,
                { ...card, y: canvas.height - 40 },
              ]);
              onCardSettled();
              return null;
            }
          })
          .filter(Boolean);

        setActiveCards(updatedCards);

        // Draw dropped cards
        droppedCards.forEach((card) => {
          if (cardImageRef.current) {
            ctx.drawImage(cardImageRef.current, card.x, card.y, 40, 40);
          }
        });
      }

      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    const mapKeyToDirection = (key) => {
      switch (key) {
        case "ArrowUp":
        case "w":
        case "W":
          return "up";
        case "ArrowDown":
        case "s":
        case "S":
          return "down";
        case "ArrowLeft":
        case "a":
        case "A":
          return "left";
        case "ArrowRight":
        case "d":
        case "D":
          return "right";
        default:
          return null;
      }
    };

    const handleKeyDown = (e) => {
      if (gameStarted) {
        const direction = mapKeyToDirection(e.key);
        if (direction) {
          e.preventDefault();
          movementRef.current[direction] = true;
          startAudio();
          if (audioRef.current) {
            audioRef.current.volume = 0.5;
          }
        } else if (e.key === " ") {
          e.preventDefault();
          handleDrop();
          if (audioRef.current) {
            audioRef.current.volume = 0.5;
          }
        }
      }
    };

    const handleKeyUp = (e) => {
      if (gameStarted) {
        const direction = mapKeyToDirection(e.key);
        if (direction) {
          e.preventDefault();
          movementRef.current[direction] = false;
        }
        if (audioRef.current) {
          audioRef.current.volume = 0.2;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [
    startAudio,
    handleDrop,
    checkCollision,
    activeCards,
    droppedCards,
    gameStarted,
    onCardSettled,
  ]);

  const handleGameStart = useCallback(() => {
    setGameStarted(true);
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 10,
        }}
      />
      {!gameStarted && <GameStart onGameStart={handleGameStart} />}
    </>
  );
};

export default Drone;
