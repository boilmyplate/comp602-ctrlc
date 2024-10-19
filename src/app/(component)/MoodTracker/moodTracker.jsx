"use client"; // Ensures this file is treated as a Client Component

import React, { useState, useEffect } from "react";
import styles from "@/app/(component)/MoodTracker/moodTracker.module.css";
import { useRouter } from "next/navigation";
import { db, auth } from "../Firebase/firebase";
import {
    collection,
    setDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    addDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
    addMoodHistory,
    calculateInsights,
    deleteMoodHistory,
    exportToCSV,
    fetchMoodHistory
} from "../Firebase/firestore/moodTrackerDB";

const moodOptions = [
    { name: "Happy", img: "./mood_images/happy.png" },
    { name: "Great", img: "./mood_images/great.png" },
    { name: "Neutral", img: "./mood_images/neutral.png" },
    { name: "Sad", img: "./mood_images/sad.png" },
    { name: "Angry", img: "./mood_images/angry.png" },
    { name: "Worried", img: "./mood_images/worried.png" }
];

const MoodTracker = () => {
    const router = useRouter();
    const [selectedMood, setSelectedMood] = useState(null);
    const [moodHistory, setMoodHistory] = useState([]);
    const [showInsights, setShowInsights] = useState(false);
    const [timeFrame, setTimeFrame] = useState("Today");
    const [selectedEntries, setSelectedEntries] = useState([]);
    const user = auth.currentUser.uid;
    const insights = calculateInsights(moodHistory);
    // console.log("insights", insights);

    // Load mood history
    useEffect(() => {
        const fetchData = async () => {
            const moodHistoryRef = await fetchMoodHistory(user);
            setMoodHistory(moodHistoryRef);
        };

        fetchData();
        console.log("FETCHING DATA: ", moodHistory);
    }, [user]);

    // Save selected mood to Firestore for the specific user
    const handleMoodSelect = async moodName => {
        const timestamp = new Date().toISOString(); // Current timestamp

        const newMoodEntry = {
            mood: moodName,
            timestamp: timestamp
        };

        const docRef = await addMoodHistory(user, newMoodEntry);
        setMoodHistory(prev => [...prev, { ...newMoodEntry, id: docRef.id }]); // Update local state with new entry
    };

    // Delete selected entries from Firestore
    const handleDelete = async ids => {
        if (
            window.confirm(
                "Are you sure you want to delete the selected entries?"
            )
        ) {
            await deleteMoodHistory(user, ids);
            setMoodHistory(prev =>
                prev.filter(entry => !ids.includes(entry.id))
            );
            setSelectedEntries([]);
        }
    };

    return (
        <div className={styles.moodTrackerContainer}>
            <h2>How are you feeling right now?</h2>
            <div className={styles.moodGrid}>
                {moodOptions.map(mood => (
                    <div
                        key={mood.name}
                        className={styles.moodOption}
                        onClick={() => handleMoodSelect(mood.name)}
                    >
                        <img
                            src={mood.img}
                            alt={mood.name}
                            className={styles.moodImage}
                        />
                        <p>{mood.name}</p>
                    </div>
                ))}
            </div>
            {selectedMood && (
                <div className={styles.selectedMood}>
                    You are feeling: {selectedMood}
                </div>
            )}
            <div className={styles.buttonContainer}>
                <img
                    src="/mood_images/download.png"
                    alt="Download CSV"
                    className={styles.icon}
                    onClick={() => exportToCSV(moodHistory)}
                />
                <button
                    onClick={() => setShowInsights(!showInsights)}
                    className={styles.insightsButton}
                >
                    Show Insights
                </button>
                <button
                    onClick={() => router.push("/")}
                    className={styles.homeButton}
                >
                    Back to Homepage
                </button>
            </div>

            {showInsights && (
                <div className={styles.insightsContainer}>
                    <button
                        className={styles.closeButton}
                        onClick={() => setShowInsights(false)}
                    >
                        Close
                    </button>
                    <h3>Mood Insights</h3>
                    <div className={styles.timeFrameContainer}>
                        <label>Sort by:</label>
                        <select
                            value={timeFrame}
                            onChange={e => setTimeFrame(e.target.value)}
                        >
                            <option value="Today">Today</option>
                            <option value="Last 7 Days">Last 7 Days</option>
                            <option value="Last 30 Days">Last 30 Days</option>
                            <option value="All Time">All Time</option>
                        </select>
                    </div>
                    {insights.totalEntries > 0 ? (
                        <>
                            <p>Total Entries: {insights.totalEntries}</p>
                            <p>
                                Most Frequent Mood: {insights.mostFrequentMood}
                            </p>
                            <ul className={styles.moodTimestamps}>
                                {insights.filteredHistory.map(entry => (
                                    <li key={entry.id}>
                                        <input
                                            type="checkbox"
                                            checked={selectedEntries.includes(
                                                entry.id
                                            )}
                                            onChange={() =>
                                                setSelectedEntries(prev =>
                                                    prev.includes(entry.id)
                                                        ? prev.filter(
                                                              id =>
                                                                  id !==
                                                                  entry.id
                                                          )
                                                        : [...prev, entry.id]
                                                )
                                            }
                                        />
                                        {entry.mood}:{" "}
                                        {formatTimestamp(entry.timestamp)}
                                        <button
                                            onClick={() =>
                                                handleDelete([entry.id])
                                            }
                                            className={styles.deleteButton}
                                            style={{ marginLeft: "10px" }}
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleDelete(selectedEntries)}
                                disabled={selectedEntries.length === 0}
                                className={styles.deleteButton}
                            >
                                Delete Selected
                            </button>
                        </>
                    ) : (
                        <p>No entries available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default MoodTracker;
