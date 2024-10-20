"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Penguin.module.css';
import { auth } from '../Firebase/firebase'; // Import db, and auth
import { fetchHighScore, saveHighScore } from '../Firebase/firestore/gameDB';
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
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const user = auth.currentUser;
  const router = useRouter();

  // Fetch the best score for the authenticated user
  useEffect(() => {
    const fetchData = async () => {
        const highScore = await fetchHighScore(user.uid, "penguinScore");
        setBestScore(highScore);
    };

    fetchData();
}, [user]);

  function generateFish() {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  }

  const handleKeyDown = (e) => {
    const newDirection = DIRECTIONS[e.key];
    if (newDirection && (newDirection.x !== -direction.x || newDirection.y !== -direction.y)) {
      setDirection(newDirection);
    }
  };

  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const movePenguin = setInterval(() => {
      setPenguin((prevPenguin) => {
        const newHead = {
          x: prevPenguin[0].x + direction.x,
          y: prevPenguin[0].y + direction.y
        };

        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          endGame();
          return prevPenguin;
        }

        if (prevPenguin.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          endGame();
          return prevPenguin;
        }

        const newPenguin = [newHead, ...prevPenguin];

        if (newHead.x === fish.x && newHead.y === fish.y) {
          setFish(generateFish());
          setScore((score) => score + 1);
        } else {
          newPenguin.pop();
        }

        return newPenguin;
      });
    }, 200);

    return () => clearInterval(movePenguin);
  }, [gameStarted, direction, fish, gameOver, isPaused]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction]);

  const startGame = () => {
    setPenguin(INITIAL_PENGUIN);
    setFish(generateFish());
    setDirection(DIRECTIONS.ArrowRight);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setIsPaused(false);
  };

  const endGame = async () => {
    setGameOver(true);
    if (score > bestScore) { 
      try {
        await saveHighScore(user.uid, "penguinScore", score, user.displayName);
        setBestScore(score); // Update bestScore locally only if Firebase update is successful
        console.log("Score successfully saved to Firebase:", score);
      } catch (error) {
        console.error("Error saving score to Firebase:", error);
      }
    }
  };

  const exitGame = () => {
    router.push('/gamelibrary');
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <div className={styles.bodyWrapper} style={{ backgroundImage: `url(${backgroundImage.src})` }}>
      <h2>Penguin Game</h2>
      <div className={styles.score}>Score: {score}</div>
      <div className={styles.bestScore}>Best Score: {bestScore}</div>

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
