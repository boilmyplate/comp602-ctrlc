"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "@/app/(component)/Pong/pong.module.css";
import Link from "next/link";

const Pong = () => {
    const canvasRef = useRef(null);
    const [paddleHeight] = useState(100);
    const [paddleWidth] = useState(10);
    const [ballSize] = useState(20);
    const [playerY, setPlayerY] = useState(0);
    const [computerY, setComputerY] = useState(0);
    const [ball, setBall] = useState({ x: 10, y: 10, dx: 5, dy: 7 });
    const [playerScore, setPlayerScore] = useState(0);
    const [computerScore, setComputerScore] = useState(0);
    const [isGameRunning, setIsGameRunning] = useState(false);
    const [isGamePaused, setIsGamePaused] = useState(false);
    const [showText, setShowText] = useState(true);
    const [showRestartConfirm, setShowRestartConfirm] = useState(false);

    useEffect(() => {
        if (!isGameRunning || isGamePaused) return;

        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const context = canvas.getContext("2d");

        let animationFrameId;

        const update = () => {
            let { x, y, dx, dy } = ball;
            x += dx;
            y += dy;

            if (y < 0 || y > canvas.height - ballSize) dy *= -1;

            if (x < paddleWidth && y > playerY && y < playerY + paddleHeight) {
                dx *= -1;
                x = paddleWidth;
            }

            if (
                x > canvas.width - paddleWidth - ballSize &&
                y > computerY &&
                y < computerY + paddleHeight
            ) {
                dx *= -1;
                x = canvas.width - paddleWidth - ballSize;
            }

            if (x < 0) {
                setComputerScore((score) => score + 1);
                resetBall();
                return;
            } else if (x > canvas.width - ballSize) {
                setPlayerScore((score) => score + 1);
                resetBall();
                return;
            }

            if (computerY + paddleHeight / 2 < y) {
                setComputerY(
                    Math.min(computerY + 10, canvas.height - paddleHeight)
                );
            } else {
                setComputerY(Math.max(computerY - 4, 0));
            }

            setBall({ x, y, dx, dy });

            context.clearRect(0, 0, canvas.width, canvas.height);
            drawDashedLine(context); // Draw the dashed line
            drawPaddle(context, 0, playerY);
            drawPaddle(context, canvas.width - paddleWidth, computerY);
            drawBall(context, x, y);
            drawScore(context);

            animationFrameId = requestAnimationFrame(update);
        };

        const drawPaddle = (ctx, x, y) => {
            ctx.fillStyle = "white";
            ctx.fillRect(x, y, paddleWidth, paddleHeight);
        };

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

        const drawDashedLine = (ctx) => {
            ctx.setLineDash([10, 10]); // Dash pattern: 10px line, 10px space
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.setLineDash([]); // Reset to solid lines
        };

        const drawScore = (ctx) => {
            ctx.fillStyle = "gray"; // Set the color of the score
            ctx.font = "120px Arial"; // Increase the font size to make the score larger
            ctx.textAlign = "center"; // Center the text horizontally

            // Display player's score on the left
            ctx.fillText(playerScore, canvas.width / 4, canvas.height / 5);

            // Display opponent's score on the right
            ctx.fillText(
                computerScore,
                (3 * canvas.width) / 4,
                canvas.height / 5
            );
        };

        const resetBall = () => {
            const canvas = canvasRef.current;

            const randomDirectionX = Math.random() < 0.5 ? -1 : 1;
            const randomDirectionY = Math.random() < 0.5 ? -1 : 1;

            setBall({
                x: canvas.width / 2,
                y: canvas.height / 2,
                dx: randomDirectionX * Math.abs(ball.dx),
                dy: randomDirectionY * Math.abs(ball.dy),
            });
        };

        animationFrameId = requestAnimationFrame(update);

        return () => cancelAnimationFrame(animationFrameId);
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
        isGamePaused,
    ]);

    const handleKeyDown = (e) => {
        if (e.key === "ArrowUp" && playerY > 0) {
            setPlayerY(Math.max(playerY - 20, 0));
        } else if (
            e.key === "ArrowDown" &&
            playerY < canvasRef.current.height - paddleHeight
        ) {
            setPlayerY(
                Math.min(playerY + 20, canvasRef.current.height - paddleHeight)
            );
        }
    };

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;
        setPlayerY(
            Math.min(
                Math.max(mouseY - paddleHeight / 2, 0),
                canvas.height - paddleHeight
            )
        );
    };

    useEffect(() => {
        if (!isGameRunning || isGamePaused) return;

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [playerY, isGameRunning, isGamePaused]);

    const startGame = () => {
        setIsGameRunning(true);
        setIsGamePaused(false);
        setShowText(false);
    };

    const pauseGame = () => {
        setIsGamePaused(true);
    };

    const resumeGame = () => {
        setIsGamePaused(false);
    };

    const confirmRestart = () => {
        setShowRestartConfirm(true);
    };

    const handleRestartConfirm = (confirm) => {
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

                    <Link href="/">
                        <button className={styles["back-home-button"]}>
                            {" "}
                            Back to Homepage
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
