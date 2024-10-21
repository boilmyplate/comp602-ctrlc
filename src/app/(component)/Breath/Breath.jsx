"use client"; // Add this at the top of the file

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "@/app/(component)/Breath/Breath.module.css";

const Breath = () => {
    const [seconds, setSeconds] = useState(4);
    const [phase, setPhase] = useState("Inhale"); // Phases: 'Inhale', 'Hold', 'Exhale'
    const [running, setRunning] = useState(false);
    const [totalTime, setTotalTime] = useState(120); // Default 2 minutes (in seconds)
    const [timeLeft, setTimeLeft] = useState(120); // Time left in the session
    const [selectedTime, setSelectedTime] = useState(2); // Default time selection
    const [sessionComplete, setSessionComplete] = useState(false); // Track session completion
    const [color, setColor] = useState("#007bff"); // Default color
    const [volume, setVolume] = useState(0.5); // Default volume (50%)

    // Use useRef to store the Audio object persistently
    const meditationMusicRef = useRef(new Audio("/music/meditation.mp3")); // Access meditation.mp3 from the public folder

    // Handle user input for total session duration
    const handleTimeChange = minutes => {
        setSelectedTime(minutes);
        const totalInSeconds = minutes * 60;
        setTotalTime(totalInSeconds);
        setTimeLeft(totalInSeconds);
        setSessionComplete(false); // Reset session completion state
    };

    // Handle color change
    const handleColorChange = event => {
        setColor(event.target.value); // Set the selected color
    };

    // Handle volume change
    const handleVolumeChange = event => {
        const newVolume = event.target.value;
        setVolume(newVolume);
        meditationMusicRef.current.volume = newVolume; // Adjust the volume of the audio
    };

    // Play or pause music using the useRef Audio object
    const toggleMusic = useCallback(
        play => {
            const music = meditationMusicRef.current;
            music.volume = volume; // Set the initial volume
            if (play) {
                music.loop = true; // Loop the music during the session
                music.play();
            } else {
                music.pause();
                music.currentTime = 0; // Reset the music
            }
        },
        [volume, meditationMusicRef]
    );

    const startTimer = () => {
        setRunning(true);
        setSessionComplete(false); // Reset session complete state
        toggleMusic(true); // Start playing the music
    };

    const stopTimer = useCallback(() => {
        setRunning(false);
        setSeconds(4);
        setPhase("Inhale");
        toggleMusic(false); // Stop the music when the timer is stopped
    }, [setRunning, setSeconds, setPhase, toggleMusic]);

    // Restart the timer and music
    const restartTimer = () => {
        setTimeLeft(selectedTime * 60); // Reset the time to the selected duration
        setSeconds(4); // Reset phase timing
        setPhase("Inhale"); // Start with the "Inhale" phase
        setSessionComplete(false); // Reset completion state
        setRunning(true); // Start the timer
        toggleMusic(true); // Start playing the music
    };

    useEffect(() => {
        let timer;
        if (running && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
                if (seconds > 0) {
                    setSeconds(prev => prev - 1);
                } else {
                    switch (phase) {
                        case "Inhale":
                            setPhase("Hold");
                            setSeconds(4);
                            break;
                        case "Hold":
                            setPhase("Exhale");
                            setSeconds(6);
                            break;
                        case "Exhale":
                            setPhase("Inhale");
                            setSeconds(4);
                            break;
                        default:
                            break;
                    }
                }
            }, 1000);
        } else if (timeLeft === 0) {
            stopTimer(); // Automatically stop when time is up
            setSessionComplete(true); // Mark session as complete
        }
        return () => clearInterval(timer);
    }, [seconds, phase, running, timeLeft, stopTimer]);

    return (
        <div className={styles.breath}>
            <h2>Breathing Exercise</h2>
            <h5>Music will start when Start is clicked</h5>

            <div className={styles["time-selector"]}>
                <label>Select Duration:</label>
                <div className={styles["time-buttons"]}>
                    {[2, 4, 6, 8, 10].map(time => (
                        <button
                            key={time}
                            className={`${styles["time-btn"]} ${
                                selectedTime === time ? styles.selected : ""
                            }`}
                            onClick={() => handleTimeChange(time)}
                            disabled={running}
                            style={{ backgroundColor: color }}
                        >
                            {time} min
                        </button>
                    ))}
                </div>
            </div>

            {/* Volume Control */}
            <div className={styles["volume-control"]}>
                <label htmlFor="volumeControl">Adjust Volume: </label>
                <input
                    type="range"
                    id="volumeControl"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                />
            </div>

            {/* Color Picker */}
            <div className={styles["color-picker"]}>
                <label htmlFor="colorPicker">Adjust Color: </label>
                <input
                    type="color"
                    id="colorPicker"
                    value={color}
                    onChange={handleColorChange}
                    disabled={running}
                />
            </div>

            <div className={`${styles.timer} ${styles[phase.toLowerCase()]}`}>
                <h3>{phase}</h3>
                <div className={styles.circle} style={{ borderColor: color }}>
                    <span className={styles.time}>{seconds}s</span>
                </div>
                <div className={styles["total-time-left"]}>
                    <span>
                        Total Time Left: {Math.floor(timeLeft / 60)}:
                        {("0" + (timeLeft % 60)).slice(-2)}
                    </span>
                </div>
            </div>

            <div className={styles.controls}>
                {!running ? (
                    <button
                        className={styles["start-btn"]}
                        onClick={startTimer}
                        style={{ backgroundColor: color }}
                    >
                        Start
                    </button>
                ) : (
                    <>
                        <button
                            className={styles["stop-btn"]}
                            onClick={stopTimer}
                            style={{ backgroundColor: color }}
                        >
                            Stop
                        </button>

                        {/* Restart Button */}
                        <button
                            className={styles["restart-btn"]}
                            onClick={restartTimer}
                            style={{ backgroundColor: color }}
                        >
                            <span>&#x21bb;</span> Restart
                        </button>
                    </>
                )}
            </div>

            {sessionComplete && (
                <div className={styles["session-summary"]}>
                    <h3>Session Complete!</h3>
                    <p>Total Time: {selectedTime} minutes</p>
                </div>
            )}
        </div>
    );
};

export default Breath;
