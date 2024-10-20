import React from "react";
import styles from "@/app/(component)/GameLibrary/Games.module.css";
import Link from "next/link";

export default function GameLibrary() {
    return (
        <>
            <div className={styles.gridContainer}>
                <div className={styles.mainContainer}>
                    {/* Hover Effect with Play Button */}
                    <div className={styles.hoverOverlay}>
                        <Link href="/pong">
                            <button className={styles.playButton}>
                                Play Now
                            </button>
                        </Link>
                    </div>
                    <h1>Pong game</h1>
                    <p>
                        Pong Classic is a retro-style table tennis game where
                        players control paddles to hit a ball back and forth,
                        aiming to score points by passing the opponent's paddle.
                        It offers both solo and multiplayer modes with simple
                        yet challenging gameplay.
                    </p>
                </div>
                <div className={styles.leftContainer}>
                    <div className={styles.gameCard}>
                        {/* Game Image */}
                        <div alt="Game 1" className={styles.gameImage} />
                        {/* Hover Effect with Play Button */}
                        <div className={styles.hoverOverlay}>
                            <Link href="/penguin">
                                <button className={styles.playButton}>
                                    Play Now
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className={styles.rightContainer}>
                    <div className={styles.gameCard}>
                        {/* Game Image */}
                        <div alt="Game 2" className={styles.gameImage} />
                        {/* Hover Effect with Play Button */}
                        <div className={styles.hoverOverlay}>
                            <Link href="/game_2048">
                                <button className={styles.playButton}>
                                    Play Now
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
