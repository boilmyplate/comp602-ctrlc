"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "@/app/(component)/Pong/Pong.module.css";
import Link from "next/link";

// Pong component
const Pong = () => {
    const canvasRef = useRef(null); // Reference to the canvas element
    const [paddleHeight] = useState(100); // Paddle height state
    const [paddleWidth] = useState(10); // Paddle width state
    const [ballSize] = useState(20); // Ball size state
    const [playerY, setPlayerY] = useState(0); // Player paddle position on Y-axis
    const [computerY, setComputerY] = useState(0); // Computer paddle position on Y-axis
    const [ball, setBall] = useState({ x: 10, y: 10, dx: 10, dy: 12 }); // Ball position and direction
    const [playerScore, setPlayerScore] = useState(0); // Player's score
    const [computerScore, setComputerScore] = useState(0); // Computer's score
    const [isGameRunning, setIsGameRunning] = useState(false); // Game running state
    const [isGamePaused, setIsGamePaused] = useState(false); // Game paused state
    const [showText, setShowText] = useState(true); // Show start menu state
    const [showRestartConfirm, setShowRestartConfirm] = useState(false); // Show restart confirmation dialog state

    // useEffect to handle game updates
    useEffect(() => {
        if (!isGameRunning || isGamePaused) return;

        const canvas = canvasRef.current;
        canvas.width = window.innerWidth; // Set canvas width
        canvas.height = window.innerHeight; // Set canvas height
        const context = canvas.getContext("2d");

        let animationFrameId;

        // Function to update game state and draw objects
        const update = () => {
            let { x, y, dx, dy } = ball;
            x += dx; // Update ball position
            y += dy;

            // Bounce the ball off the top and bottom walls
            if (y < 0 || y > canvas.height - ballSize) dy *= -1;

            // Player paddle collision detection
            if (x < paddleWidth && y > playerY && y < playerY + paddleHeight) {
                dx *= -1; // Change ball direction
                x = paddleWidth;
            }

            // Computer paddle collision detection
            if (
                x > canvas.width - paddleWidth - ballSize &&
                y > computerY &&
                y < computerY + paddleHeight
            ) {
                dx *= -1;
                x = canvas.width - paddleWidth - ballSize;
            }

            // Check if player/computer scores
            if (x < 0) {
                setComputerScore(score => score + 1); // Computer scores
                resetBall(); // Reset ball to center
                return;
            } else if (x > canvas.width - ballSize) {
                setPlayerScore(score => score + 1); // Player scores
                resetBall(); // Reset ball
                return;
            }

            // Move computer paddle towards the ball
            if (computerY + paddleHeight / 2 < y) {
                setComputerY(
                    Math.min(computerY + 10, canvas.height - paddleHeight)
                );
            } else {
                setComputerY(Math.max(computerY - 4, 0));
            }

            // Update ball position
            setBall({ x, y, dx, dy });

            // Clear canvas and redraw everything
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawDashedLine(context); // Draw middle dashed line
            drawPaddle(context, 0, playerY); // Draw player paddle
            drawPaddle(context, canvas.width - paddleWidth, computerY); // Draw computer paddle
            drawBall(context, x, y); // Draw ball
            drawScore(context); // Display scores

            animationFrameId = requestAnimationFrame(update); // Request next frame
        };

        // Function to draw a paddle
        const drawPaddle = (ctx, x, y) => {
            ctx.fillStyle = "white";
            ctx.fillRect(x, y, paddleWidth, paddleHeight);
        };

        // Function to draw the ball
        const drawBall = (ctx, x, y) => {
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(
                x + ballSize / 2,
                y + ballSize / 2,
                ballSize / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        };

        // Function to draw the middle dashed line
        const drawDashedLine = ctx => {
            ctx.setLineDash([10, 10]); // Set dash pattern
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.setLineDash([]); // Reset to solid lines
        };

        // Function to draw the scores
        const drawScore = ctx => {
            ctx.fillStyle = "gray";
            ctx.font = "120px Arial"; // Set larger font
            ctx.textAlign = "center"; // Center the score text

            // Display player's score on the left
            ctx.fillText(playerScore, canvas.width / 4, canvas.height / 5);

            // Display computer's score on the right
            ctx.fillText(
                computerScore,
                (3 * canvas.width) / 4,
                canvas.height / 5
            );
        };

        // Function to reset ball position after a point is scored
        const resetBall = () => {
            const canvas = canvasRef.current;

            const randomDirectionX = Math.random() < 0.5 ? -1 : 1;
            const randomDirectionY = Math.random() < 0.5 ? -1 : 1;

            setBall({
                x: canvas.width / 2,
                y: canvas.height / 2,
                dx: randomDirectionX * Math.abs(ball.dx),
                dy: randomDirectionY * Math.abs(ball.dy)
            });
        };

        animationFrameId = requestAnimationFrame(update);

        return () => cancelAnimationFrame(animationFrameId); // Clean up animation frame
    }, [
        ball,
        computerY,
        playerY,
        playerScore,
        computerScore,
        paddleHeight,
        paddleWidth,
        ballSize,
        isGameRunning,
        isGamePaused
    ]);

    // Function to handle key press for player paddle movement
    const handleKeyDown = e => {
        if (e.key === "ArrowUp" && playerY > 0) {
            setPlayerY(Math.max(playerY - 20, 0)); // Move paddle up
        } else if (
            e.key === "ArrowDown" &&
            playerY < canvasRef.current.height - paddleHeight
        ) {
            setPlayerY(
                Math.min(playerY + 20, canvasRef.current.height - paddleHeight)
            ); // Move paddle down
        }
    };

    // Function to handle mouse movement for player paddle
    const handleMouseMove = e => {
        const canvas = canvasRef.current;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;
        setPlayerY(
            Math.min(
                Math.max(mouseY - paddleHeight / 2, 0),
                canvas.height - paddleHeight
            )
        );
    };

    // Add event listeners for key and mouse input
    useEffect(() => {
        if (!isGameRunning || isGamePaused) return;

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [playerY, isGameRunning, isGamePaused]);

    // Function to start the game
    const startGame = () => {
        setIsGameRunning(true);
        setIsGamePaused(false);
        setShowText(false);
    };

    // Function to pause the game
    const pauseGame = () => {
        setIsGamePaused(true);
    };

    // Function to resume the game
    const resumeGame = () => {
        setIsGamePaused(false);
    };

    // Function to show restart confirmation dialog
    const confirmRestart = () => {
        setShowRestartConfirm(true);
    };

    // Function to handle restart confirmation
    const handleRestartConfirm = confirm => {
        setShowRestartConfirm(false);
        if (confirm) {
            setPlayerScore(0);
            setComputerScore(0);
            setBall({ x: 60, y: 60, dx: 4, dy: 4 });
            setPlayerY(0);
            setComputerY(0);
            setIsGamePaused(false);
            setIsGameRunning(true);
        }
    };

    // Function to reset game and return to main menu
    const backToMainMenu = () => {
        setPlayerScore(0);
        setComputerScore(0);
        setBall({ x: 60, y: 60, dx: 4, dy: 4 });
        setPlayerY(0);
        setComputerY(0);
        setIsGamePaused(false);
        setIsGameRunning(false);
        setShowText(true);
    };

    return (
        <div>
            {showText && (
                <div className={styles["main-menu"]}>
                    <h2 className={styles.heading}>Pong Game</h2>
                    <p className={styles["welcome-text"]}>
                        Welcome to Pong Game! Use this game as a way to distract
                        your mind through any stressful situation or simply for
                        fun.
                    </p>

                    <p className={styles["welcome-text"]}>
                        Use the arrow keys or your mouse to control the paddle.
                    </p>
                    <p className={styles["welcome-text"]}>
                        Press 'Start Game' to begin!
                    </p>
                    <img src="game.png" width="270" alt="Journal Image" />
                </div>
            )}

            {!isGameRunning ? (
                <div className={styles["start-controls"]}>
                    <button
                        onClick={startGame}
                        className={styles["start-button"]}
                    >
                        Start Game
                    </button>

                    <Link href="/gamelibrary">
                        <button className={styles["back-home-button"]}>
                            {" "}
                            Back to library
                        </button>
                    </Link>
                </div>
            ) : (
                !isGamePaused && (
                    <div className={styles.controls}>
                        <button
                            onClick={pauseGame}
                            className={styles["pause-button"]}
                        >
                            Pause
                        </button>
                    </div>
                )
            )}

            {isGamePaused && (
                <div className={styles["pause-menu"]}>
                    <h2>Game Paused</h2>
                    <button
                        onClick={resumeGame}
                        className={styles["pause-menu-button"]}
                    >
                        Resume
                    </button>
                    <button
                        onClick={confirmRestart}
                        className={styles["pause-menu-button"]}
                    >
                        Restart
                    </button>
                    <button
                        onClick={backToMainMenu}
                        className={styles["pause-menu-button"]}
                    >
                        {" "}
                        Main Menu
                    </button>
                </div>
            )}
            {showRestartConfirm && (
                <div className={styles["confirm-dialog"]}>
                    <p>Are you sure you want to restart the game?</p>
                    <button
                        onClick={() => handleRestartConfirm(true)}
                        className={styles["confirm-button"]}
                    >
                        Yes{" "}
                    </button>
                    <button
                        onClick={() => handleRestartConfirm(false)}
                        className={styles["confirm-button"]}
                    >
                        No
                    </button>
                </div>
            )}
            <canvas ref={canvasRef} className={styles["pong-canvas"]} />
        </div>
    );
};
export default Pong;
