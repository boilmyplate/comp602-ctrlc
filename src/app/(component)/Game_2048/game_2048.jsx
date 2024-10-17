"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '../Firebase/firebase';
import { saveScore } from '../Firebase/firestore/gameDB';
import { doc, getDoc } from 'firebase/firestore';
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
                filteredLine[i] = { value: String.fromCharCode(filteredLine[i].value.charCodeAt(0) + 1), moved: true };
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

const Alphabet2048 = () => {
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [grid, setGrid] = useState(initialGrid());
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [isMoving, setIsMoving] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const router = useRouter();

    const resetGame = useCallback(() => {
        setGrid(initialGrid());
        setScore(0);
        setGameOver(false);
        setIsMoving(false);
    }, []);

    useEffect(() => {
        const fetchBestScore = async () => {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(db, 'scores', `${user.uid}_2048`);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setBestScore(docSnap.data().score);
                }
            }
        };
        fetchBestScore();
    }, []);

    useEffect(() => {
        const saveBestScore = async () => {
            const user = auth.currentUser;
            if (user && score > bestScore) {
                setBestScore(score);
                await saveScore(user.uid, "2048", score, user.displayName);
                console.log("High score saved successfully");
            }
        };
        saveBestScore();
    }, [score, bestScore]);

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
            }, 50);
        }
    }, [grid, isMoving, gameOver]);

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
                        <div className={styles.buttonContainer}>
                            <button onClick={resetGame} className={styles.button}>Restart Game</button>
                            <button onClick={() => { setIsGameStarted(false); resetGame(); }} className={styles.button}>Main Menu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    ) : (
        <div className={styles.homeContainer}>
            <h1>Welcome to Alphabet 2048</h1>
            <img src="/puzzle.png" alt="Puzzle" className={styles.puzzleImage} />
            <button onClick={() => { setIsGameStarted(true); resetGame(); }} className={styles.start}>Start Game</button>
            <button onClick={() => router.push("/gamelibrary")} className={styles.start}>Back to library</button>
        </div>
    );
};

const ScoreBoard = ({ score, bestScore }) => (
    <div className={styles.scoreBoard}>
        <div className={styles.titleContainer}>
            <p className={styles.blockTitle}>2048 Alphabet</p>
        </div>
        <div>Current Score: {score}</div>
        <div>Best Score: {bestScore}</div>
    </div>
);

const Grid = ({ grid }) => (
    <div className={styles.gridContainer}>
        {grid.map((row, rowIndex) => row.map((tile, colIndex) => 
            <Tile key={`${rowIndex}-${colIndex}`} value={tile.value} moved={tile.moved} />
        ))}
    </div>
);

const Tile = ({ value, moved }) => (
    <div className={`${styles.tile} ${moved ? styles.slide : ''}`} data-value={value}>
        {value || ''}
    </div>
);

export default Alphabet2048;
