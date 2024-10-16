"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './game_2048.module.css';

const initialGrid = () => {
    const grid = Array(4).fill(null).map(() => Array(4).fill({ value: null, moved: false }));
    addRandomTile(grid);
    addRandomTile(grid);
    return grid;
};

const getScoreValue = (letter) => Math.pow(2, letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1);

const addRandomTile = (grid) => {
    const availableSpots = [];
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (grid[row][col].value === null) availableSpots.push([row, col]);
        }
    }
    if (!availableSpots.length) return;
    const [row, col] = availableSpots[Math.floor(Math.random() * availableSpots.length)];
    grid[row][col] = { value: 'A', moved: false };
};

const moveTiles = (grid, direction, setScore) => {
    let moved = false;
    let newScore = 0;

    const slideAndMerge = (line) => {
        const filteredLine = line.filter(tile => tile.value !== null);
        for (let i = 0; i < filteredLine.length - 1; i++) {
            if (filteredLine[i].value === filteredLine[i + 1].value) {
                newScore += getScoreValue(filteredLine[i].value);
                filteredLine[i] = {
                    value: String.fromCharCode(filteredLine[i].value.charCodeAt(0) + 1),
                    moved: true
                };
                filteredLine[i + 1] = { value: null, moved: true };
            }
        }
        while (filteredLine.length < 4) filteredLine.push({ value: null, moved: false });
        return filteredLine;
    };

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

// Game component
const Alphabet2048 = () => {
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [grid, setGrid] = useState(initialGrid());
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(() => localStorage.getItem('bestScore') || 0);
    const [isMoving, setIsMoving] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const router = useRouter();

    const handleKeyDown = (e) => {
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
            }, 100);
        }
    };

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

    const resetGame = () => {
        setGrid(initialGrid());
        setScore(0);
        setGameOver(false);
    };

    const goToMainMenu = () => {
        setIsGameStarted(false);
        setGrid(initialGrid());
        setScore(0);
        setGameOver(false);
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [grid, isMoving, gameOver]);

    useEffect(() => {
        if (score > bestScore) {
            setBestScore(score);
            localStorage.setItem('bestScore', score);
        }
    }, [score]);

    return isGameStarted ? (
        <div className={styles.gameContainer}>
            <div className={styles.header}>
                <ScoreBoard score={score} bestScore={bestScore} onReset={goToMainMenu} />
                <button onClick={resetGame} className={styles.button}>Restart</button>
            </div>
            <Grid grid={grid} />
            {gameOver && (
                <div className={styles.overlay}>
                    <div className={styles.gameOverMessage}>
                        <h2>Game Over</h2>
                        <button onClick={resetGame} className={styles.button}>Restart Game</button>
                      <button onClick={goToMainMenu} className={styles.button}>Main Menu</button>


                    </div>
                </div>
            )}
        </div>
    ) : (
        <div className={styles.homeContainer}>
            <h1>Welcome to Alphabet 2048</h1>
            <img src="/puzzle.png" alt="Puzzle" className={styles.puzzleImage} />
            <p>Use arrow keys to move the Alphabet tiles. When two tiles with the same letter touch, they merge into the next letter in the alphabet.</p>
            <button onClick={() => router.push("/")} className={styles.start}>Back to Homepage</button>
            <button onClick={() => setIsGameStarted(true)} className={styles.start}>Start Game</button>
        </div>
    );
};

// Supporting components
const Grid = ({ grid }) => (
    <div className={styles.gridContainer}>
        {grid.map((row, rowIndex) => row.map((tile, colIndex) => 
            <Tile key={`${rowIndex}-${colIndex}`} value={tile.value} moved={tile.moved} />
        ))}
    </div>
);

const Tile = ({ value, moved }) => (
    <div className={`${styles.tile} ${moved ? styles.slide : ''}`} data-value={value}>
        {value || ''} {/* Display the letter directly */}
    </div>
);

const ScoreBoard = ({ score, bestScore, onReset }) => (
    <div className={styles.scoreBoard}>
        <div>Score: {score}</div>
        <div>Best: {bestScore}</div>
        <button onClick={onReset} className={styles.button}>Main Menu</button>
    </div>
);

export default Alphabet2048;