"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../Firebase/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import styles from './Game_2048.module.css';
// Initialise the grid with two random tiles at the start
const initialGrid = () => {
    const grid = Array(4).fill(null).map(() => Array(4).fill({ value: null, moved: false }));
    addRandomTile(grid);
    addRandomTile(grid);
    return grid;
};
// Calculate the score value based on the letter's position in the alphabet
const getScoreValue = (letter) => Math.pow(2, letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1);
// Add a random tile with the letter 'A' to an empty spot on the grid
const addRandomTile = (grid) => {
    const availableSpots = [];
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (grid[row][col].value === null) availableSpots.push([row, col]);
        }
    }
    if (!availableSpots.length) return;
    const [row, col] = availableSpots[Math.floor(Math.random() * availableSpots.length)];// Choose a random spot and place a new tile
    grid[row][col] = { value: 'A', moved: false };
};
// Handle moving and merging tiles in a specific direction
const moveTiles = (grid, direction, setScore) => {
    let moved = false;
    let newScore = 0;
  // Function to slide and merge tiles within a row or column
    const slideAndMerge = (line) => {
        const filteredLine = line.filter(tile => tile.value !== null);
        for (let i = 0; i < filteredLine.length - 1; i++) {
            if (filteredLine[i].value === filteredLine[i + 1].value) {
                newScore += getScoreValue(filteredLine[i].value);
                filteredLine[i] = { value: String.fromCharCode(filteredLine[i].value.charCodeAt(0) + 1), moved: true };
                filteredLine[i + 1] = { value: null, moved: true };
            }
        } // Fill in empty spots after merging
        while (filteredLine.length < 4) filteredLine.push({ value: null, moved: false });
        return filteredLine;
    };
// Move tiles left, right, up, or down based on direction
    if (direction === 'left') {
        for (let row = 0; row < 4; row++) {
            const newRow = slideAndMerge(grid[row]);
            if (JSON.stringify(grid[row]) !== JSON.stringify(newRow)) moved = true;
            grid[row] = newRow;
        }
    } else if (direction === 'right') {
        for (let row = 0; row < 4; row++) {
            const newRow = slideAndMerge([...grid[row]].reverse()).reverse();
            if (JSON.stringify(grid[row]) !== JSON.stringify(newRow)) moved = true;
            grid[row] = newRow;
        }
    } else if (direction === 'up') {
        for (let col = 0; col < 4; col++) {
            const column = [grid[0][col], grid[1][col], grid[2][col], grid[3][col]];
            const newColumn = slideAndMerge(column);
            for (let row = 0; row < 4; row++) {
                if (grid[row][col].value !== newColumn[row].value) moved = true;
                grid[row][col] = newColumn[row];
            }
        }
    } else if (direction === 'down') {
        for (let col = 0; col < 4; col++) {
            const column = [grid[0][col], grid[1][col], grid[2][col], grid[3][col]].reverse();
            const newColumn = slideAndMerge(column).reverse();
            for (let row = 0; row < 4; row++) {
                if (grid[row][col].value !== newColumn[row].value) moved = true;
                grid[row][col] = newColumn[row];
            }
        }
    }
    setScore(prevScore => prevScore + newScore);
    return moved;
};

const Alphabet2048 = () => {
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [grid, setGrid] = useState(initialGrid());
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [isMoving, setIsMoving] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const router = useRouter();
   // Function to reset the game state
    const resetGame = useCallback(() => {
        setGrid(initialGrid());
        setScore(0);
        setGameOver(false);
        setIsMoving(false);
    }, []);
   // Function to reset the game state
    useEffect(() => {
        const fetchBestScore = async () => {
            const docRef = doc(db, "scores", "2048_score");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setBestScore(docSnap.data().score);
            }
        };
        fetchBestScore();
    }, []);
 // Save the best score to Firebase if the current score exceeds it
    useEffect(() => {
        const saveBestScore = async () => {
            if (score > bestScore) {
                setBestScore(score);
                const docRef = doc(db, "scores", "2048_score");
                await setDoc(docRef, { score });
            }
        };
        saveBestScore();
    }, [score]);
 // Handle key presses for moving tiles
    const handleKeyDown = useCallback((e) => {
        if (isMoving || gameOver) return;

        let moved = false;
        switch (e.key) {
            case 'ArrowLeft': moved = moveTiles(grid, 'left', setScore); break;
            case 'ArrowRight': moved = moveTiles(grid, 'right', setScore); break;
            case 'ArrowUp': moved = moveTiles(grid, 'up', setScore); break;
            case 'ArrowDown': moved = moveTiles(grid, 'down', setScore); break;
            default: return;
        }

        if (moved) {
            setIsMoving(true);
            setTimeout(() => {
                addRandomTile(grid);
                setGrid([...grid]);
                setIsMoving(false);
                checkGameOver();
            }, 50);  // Reduced delay to improve responsiveness
        }
    }, [grid, isMoving, gameOver]); 
    // Check if there are no more valid moves, ending the game
    const checkGameOver = () => {
        let noMovesLeft = true;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (grid[row][col].value === null || 
                    (row < 3 && grid[row][col].value === grid[row + 1][col].value) || 
                    (col < 3 && grid[row][col].value === grid[row][col + 1].value)) {
                    noMovesLeft = false;
                    break;
                }
            }
        }
        setGameOver(noMovesLeft);
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return isGameStarted ? (
        <div className={styles.gameContainer}>
            <div className={styles.header}>
                <ScoreBoard score={score} bestScore={bestScore} />
                <div className={styles.buttonContainer}>
                    <button onClick={() => { setIsGameStarted(false); resetGame(); }} className={styles.button}>
                        Main Menu
                    </button>
                    <button onClick={resetGame} className={styles.button}>
                        Restart
                    </button>
                </div>
            </div>
            <Grid grid={grid} />
            {gameOver && (
                <div className={styles.overlay}>
                    <div className={styles.gameOverMessage}>
                        <h2>Game Over</h2>
                        <button onClick={resetGame} className={styles.button}>Restart Game</button>
                        <button onClick={() => { setIsGameStarted(false); resetGame(); }} className={styles.button}>Main Menu</button>
                    </div>
                </div>
            )}
        </div>
    ) : (
        <div className={styles.homeContainer}>
            <h1>Welcome to Alphabet 2048</h1>
            <img src="/puzzle.png" alt="Puzzle" className={styles.puzzleImage} />
            <button onClick={() => router.push("/")} className={styles.start}>Back to Homepage</button>
            <button onClick={() => { setIsGameStarted(true); resetGame(); }} className={styles.start}>Start Game</button>
        </div>
    );
};
// ScoreBoard component displays current and best scores
const ScoreBoard = ({ score, bestScore }) => (
    <div className={styles.scoreBoard}>
        <div className={styles.titleContainer}>
            <p className={styles.blockTitle}>2048 Alphabet</p>
        </div>
        <div>Current Score: {score}</div>
        <div>Best Score: {bestScore}</div>
    </div>
);
// Grid component displays the 4x4 grid of tiles
const Grid = ({ grid }) => (
    <div className={styles.gridContainer}>
        {grid.map((row, rowIndex) => row.map((tile, colIndex) => 
            <Tile key={`${rowIndex}-${colIndex}`} value={tile.value} moved={tile.moved} />
        ))}
    </div>
);
// Tile component represents each tile on the grid
const Tile = ({ value, moved }) => (
    <div className={`${styles.tile} ${moved ? styles.slide : ''}`} data-value={value}>
        {value || ''}
    </div>
);

export default Alphabet2048;
