"use client"; // Ensures this file is treated as a Client Component

import React, { useState, useEffect } from 'react';
import styles from './penguin.module.css'; // Import CSS module
import penguinImage from '/public/penguin/penguin.png';
import fishImage from '/public/penguin/fish.png';

const GRID_SIZE = 15; // Size of the grid (15x15)
const INITIAL_PENGUIN = [{ x: 7, y: 7 }]; // Initial penguin position
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};

export default function PenguinGame() {
  const [penguin, setPenguin] = useState(INITIAL_PENGUIN); // Penguin segments
  const [fish, setFish] = useState(generateFish()); // Fish position (the food)
  const [direction, setDirection] = useState(DIRECTIONS.ArrowRight); // Penguin's movement direction
  const [score, setScore] = useState(0); // Player's score
  const [gameOver, setGameOver] = useState(false); // Game-over flag
  const [gameStarted, setGameStarted] = useState(false); // Track if game is active

  // Generate a new fish position
  function generateFish() {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  }

  // Handle keyboard input to set direction
  const handleKeyDown = (e) => {
    const newDirection = DIRECTIONS[e.key];
    if (newDirection && (newDirection.x !== -direction.x || newDirection.y !== -direction.y)) {
      setDirection(newDirection); // Prevent reversing direction
    }
  };

  // Game loop: update penguin position
  useEffect(() => {
    if (!gameStarted || gameOver) return; // Stop if game isn't active or is over

    const movePenguin = setInterval(() => {
      setPenguin((prevPenguin) => {
        const newHead = {
          x: prevPenguin[0].x + direction.x,
          y: prevPenguin[0].y + direction.y
        };

        // Check for edge collision
        if (
          newHead.x < 0 || 
          newHead.x >= GRID_SIZE || 
          newHead.y < 0 || 
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true); // Game over if penguin hits an edge
          return prevPenguin;
        }

        // Check for self-collision
        if (prevPenguin.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevPenguin;
        }

        const newPenguin = [newHead, ...prevPenguin];

        // Check if penguin has eaten the fish
        if (newHead.x === fish.x && newHead.y === fish.y) {
          setFish(generateFish()); // Generate new fish
          setScore((score) => score + 1); // Increase score
        } else {
          newPenguin.pop(); // Remove tail if no fish eaten
        }

        return newPenguin;
      });
    }, 200);

    // Cleanup interval
    return () => clearInterval(movePenguin);
  }, [gameStarted, direction, fish, gameOver]);

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction]);

  // Start or restart the game
  const startGame = () => {
    setPenguin(INITIAL_PENGUIN);
    setFish(generateFish());
    setDirection(DIRECTIONS.ArrowRight);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <div className={styles.gameContainer}>
      <h2>Penguin Game</h2>
      <div className={styles.score}>Score: {score}</div>
      <button onClick={startGame} className={styles.startButton}>
        {gameStarted ? "Restart" : "Start"}
      </button>
      <div className={styles.grid}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isPenguin = penguin.some(segment => segment.x === x && segment.y === y);
          const isFish = fish.x === x && fish.y === y;
          return (
            <div key={i} className={styles.cell}>
              {isPenguin && <img src={penguinImage.src} alt="Penguin" className={styles.penguin} />}
              {isFish && <img src={fishImage.src} alt="Fish" className={styles.fish} />}
            </div>
          );
        })}
      </div>
      {gameOver && <div className={styles.gameOver}>Game Over</div>}
    </div>
  );
}
