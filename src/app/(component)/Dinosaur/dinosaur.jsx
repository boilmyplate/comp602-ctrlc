"use client";  // Ensure it's treated as a Client Component in Next.js

import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';  // Import Link from Next.js
import styles from './dinosaur.module.css';  // Import your CSS module

const DinosaurGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);  // Track the score
  const [isPaused, setIsPaused] = useState(false);  // Track if the game is paused
  const canvasRef = useRef(null);
  const gameLoopRequest = useRef(null);  // Ref to store the requestAnimationFrame ID

  let boardWidth = 1100;  // Game width
  let boardHeight = 400;  // Game height
  let monsterX = 50;
  let monsterY = boardHeight - 90;
  let frameCount = 0;
  let runFrame = 0;
  let jumpFrame = 0;
  let velocityY = 0;
  let gravity = 0.6;
  let velocityX = -8;
  let isJumping = false;

  const monsterRunImages = [];
  const monsterJumpImages = [];
  const cactusArray = [];
  const cactusImages = [];

  let backgroundImg = new Image();  // Background image
  let backgroundX = 0;  // Background position for scrolling

  let context;

  // Load images and set up the game
  useEffect(() => {
    if (gameStarted && !isPaused) {
      startGame();
    }
    return () => cancelAnimationFrame(gameLoopRequest.current);
  }, [gameStarted]);

  const startGame = () => {
    const canvas = canvasRef.current;
    context = canvas.getContext("2d");
    canvas.width = boardWidth;
    canvas.height = boardHeight;

    // Reset score when the game starts
    setScore(0);
    setGameOver(false); // Ensure gameOver is false when starting

    // Load background image
    backgroundImg.src = `/img/background.png`;  // Update this to your actual background image path

    // Load images for monster running
    for (let i = 1; i <= 6; i++) {
      const runImg = new Image();
      runImg.src = `/img/monster_run_${i}.png`;
      monsterRunImages.push(runImg);
    }

    // Load images for monster jumping
    for (let i = 1; i <= 8; i++) {
      const jumpImg = new Image();
      jumpImg.src = `/img/monster_jump_${i}.png`;
      monsterJumpImages.push(jumpImg);
    }

    // Load cactus images
    const cactus1 = new Image();
    cactus1.src = `/img/cactus_1.png`;
    const cactus2 = new Image();
    cactus2.src = `/img/cactus_2.png`;
    const cactus3 = new Image();
    cactus3.src = `/img/cactus_3.png`;
    cactusImages.push(cactus1, cactus2, cactus3);

    // Start placing cacti periodically
    setInterval(placeCactus, 2000);  // Place cactus every 2 seconds

    // Start the game loop
    gameLoopRequest.current = requestAnimationFrame(() => gameLoop(context));
  };

  const gameLoop = (context) => {
    if (gameOver || isPaused) return;  // Stop game loop if paused or game is over

    gameLoopRequest.current = requestAnimationFrame(() => gameLoop(context));

    context.clearRect(0, 0, boardWidth, boardHeight);
    
    // Draw the scrolling background
    drawBackground(context);

    frameCount++;

    // Apply gravity and update monster Y position
    velocityY += gravity;
    monsterY = Math.min(monsterY + velocityY, boardHeight - 90);

    // Reset isJumping if the monster lands back on the ground
    if (monsterY === boardHeight - 90) {
      velocityY = 0;  // Stop falling
      isJumping = false;  // Allow another jump
    }

    // Draw the monster (run or jump)
    if (isJumping) {
      if (frameCount % 5 === 0) {
        jumpFrame = (jumpFrame + 1) % monsterJumpImages.length;
      }
      context.drawImage(monsterJumpImages[jumpFrame], monsterX, monsterY, 80, 90);
    } else {
      if (frameCount % 5 === 0) {
        runFrame = (runFrame + 1) % monsterRunImages.length;
      }
      context.drawImage(monsterRunImages[runFrame], monsterX, monsterY, 80, 90);
    }

    // Move and draw cacti
    cactusArray.forEach((cactus, index) => {
      cactus.x += velocityX;
      context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);

      // Remove cactus when it goes off screen and increase score
      if (cactus.x + cactus.width < 0) {
        cactusArray.splice(index, 1);
        if (!gameOver) {  // Only increment score if the game is not over
          setScore((prevScore) => prevScore + 1);  // Increment score when cactus is avoided
        }
      }

      // Detect collision with monster
      if (detectCollision(monsterX, monsterY, 80, 90, cactus)) {
        setGameOver(true);
      }
    });

    // Display score on the game screen
    displayScore(context);
  };

  const displayScore = (context) => {
    context.fillStyle = "black";
    context.font = "20px courier";
    context.fillText("Score: " + score, 5, 20);
  };

  const drawBackground = (context) => {
    // Draw the background image at the current position
    context.drawImage(backgroundImg, backgroundX, 0, boardWidth, boardHeight);
    context.drawImage(backgroundImg, backgroundX + boardWidth, 0, boardWidth, boardHeight);

    // Move the background to create scrolling effect
    backgroundX += velocityX;

    // Reset background position to create a continuous loop
    if (backgroundX <= -boardWidth) {
      backgroundX = 0;
    }
  };

  // Function to place cacti at intervals
  const placeCactus = () => {
    if (gameOver || isPaused) return;  // Don't place new cacti if the game is over or paused

    const randomIndex = Math.floor(Math.random() * cactusImages.length);  // Choose random cactus
    const cactus = {
      img: cactusImages[randomIndex],
      x: boardWidth,  // Start at the right side of the screen
      y: boardHeight - 100,  // Place it at the bottom
      width: 60,
      height: 100,
    };
    cactusArray.push(cactus);  // Add cactus to array
  };

  // Collision detection function
  const detectCollision = (mx, my, mw, mh, cactus) => {
    return (
      mx < cactus.x + cactus.width &&
      mx + mw > cactus.x &&
      my < cactus.y + cactus.height &&
      my + mh > cactus.y
    );
  };

  const handleJump = () => {
    if (!isJumping && monsterY === boardHeight - 90) {
      velocityY = -15;  // Apply jump velocity
      isJumping = true;  // Set isJumping to true to prevent multiple jumps mid-air
    }
  };

  // Pause or resume the game
  const togglePause = () => {
    if (!isPaused) {
      // Pause the game and cancel the animation frame
      cancelAnimationFrame(gameLoopRequest.current);
      setIsPaused(true);
    } else {
      // Resume the game and restart the animation frame
      setIsPaused(false);
      gameLoopRequest.current = requestAnimationFrame(() => gameLoop(context));
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setIsPaused(false);  // Reset paused state
    setScore(0);  // Reset score when restarting
    cactusArray.length = 0;  // Reset cacti array
  };

  return (
    <div className="App">
      {!gameStarted && !gameOver && (
        <div id="home-screen" className={styles.homeScreen}>
          <h1 className={styles.title}>Run Baggy Run!</h1>
          <button onClick={() => setGameStarted(true)} className={styles.retroBtn}>
            Start
          </button>
          <Link href="/" passHref>
            <button className={styles.retroBtn}>Back to homepage</button>
          </Link>
        </div>
      )}

      {gameStarted && !gameOver && (
        <div id="game-container" className={styles.gameContainer}>
          <canvas ref={canvasRef} className={styles.gameCanvas} tabIndex="0"></canvas>
          <button onClick={handleJump} className={styles.retroBtn}>Jump</button>
          <button onClick={togglePause} className={styles.retroBtn}>
            {isPaused ? "Resume" : "Pause"}
          </button>
        </div>
      )}

      {gameOver && (
        <div id="game-over-container" className={styles.gameOverContainer}>
          <h1>Game Over</h1>
          <p id="final-score">Final Score: {score}</p>  {/* Display the final score */}
          <button className={styles.retroBtn} onClick={() => resetGame()}>Restart</button>
          <Link href="/" passHref>
            <button className={styles.retroBtn}>Back to homepage</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DinosaurGame;
