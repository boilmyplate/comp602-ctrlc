"use client"; // Ensures this file is treated as a Client Component

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import styles from './penguin.module.css'; // Import CSS module
import { db } from '../Firebase/firebase'; // Import Firebase Firestore configuration
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Firestore functions for saving and retrieving data
import penguinImage from '/public/penguin/penguin.png';
import fishImage from '/public/penguin/fish.png';
import backgroundImage from '/public/penguin/background.png';

const GRID_SIZE = 15;
const INITIAL_PENGUIN = [{ x: 7, y: 7 }];
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};

export default function PenguinGame() {
  const [penguin, setPenguin] = useState(INITIAL_PENGUIN);
  const [fish, setFish] = useState(generateFish());
  const [direction, setDirection] = useState(DIRECTIONS.ArrowRight);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0); // To store the best score
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Paused state

  const router = useRouter(); // Initialize router for navigation

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
      setDirection(newDirection);
    }
  };

  // Game loop: update penguin position
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const movePenguin = setInterval(() => {
      setPenguin((prevPenguin) => {
        const newHead = {
          x: prevPenguin[0].x + direction.x,
          y: prevPenguin[0].y + direction.y
        };

        // Check for edge collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          endGame();
          return prevPenguin;
        }

        // Check for self-collision
        if (prevPenguin.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          endGame();
          return prevPenguin;
        }

        const newPenguin = [newHead, ...prevPenguin];

        // Check if penguin has eaten the fish
        if (newHead.x === fish.x && newHead.y === fish.y) {
          setFish(generateFish());
          setScore((score) => score + 1);
        } else {
          newPenguin.pop();
        }

        return newPenguin;
      });
    }, 200); // Set back to normal speed (200ms)

    return () => clearInterval(movePenguin);
  }, [gameStarted, direction, fish, gameOver, isPaused]);

  // Fetch the best score from Firebase when the game loads
  useEffect(() => {
    const fetchBestScore = async () => {
      const docRef = doc(db, "scores", "penguin_score");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBestScore(docSnap.data().score);
      }
    };
    fetchBestScore();
  }, []);

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
    setIsPaused(false); // Ensure game is not paused
  };

  // End the game and save score to Firebase if it's a new best
  const endGame = async () => {
    setGameOver(true);
    if (score > bestScore) {
      setBestScore(score);
      const docRef = doc(db, "scores", "penguin_score");
      await setDoc(docRef, { score }); // Save the new best score
    }
  };

  // Exit the game and go to the home page
  const exitGame = () => {
    router.push('/'); // Navigate to the home page
  };

  // Toggle pause and resume
  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <div className={styles.bodyWrapper} style={{ backgroundImage: `url(${backgroundImage.src})` }}>
      <h2>Penguin Game</h2>
      <div className={styles.score}>Score: {score}</div>
      <div className={styles.bestScore}>Best Score: {bestScore}</div> {/* Display best score */}

      {/* Buttons shown based on game state */}
      {!gameStarted ? (
        <>
          <button onClick={startGame} className={styles.startButton}>
            Start
          </button>
          <button onClick={exitGame} className={styles.startButton}>
            Exit Game
          </button>
        </>
      ) : (
        <>
          {!gameOver && !isPaused && (
            <button onClick={togglePause} className={styles.startButton}>
              Pause
            </button>
          )}
          {!gameOver && isPaused && (
            <button onClick={togglePause} className={styles.startButton}>
              Resume
            </button>
          )}
          {gameOver && (
            <>
              <div className={`${styles.gameOverMessage} ${gameOver ? styles.show : ''}`}>
                Game Over
              </div>
              <button onClick={startGame} className={styles.startButton}>
                Restart
              </button>
              <button onClick={exitGame} className={styles.startButton}>
                Exit Game
              </button>
            </>
          )}
        </>
      )}

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
    </div>
  );
}
