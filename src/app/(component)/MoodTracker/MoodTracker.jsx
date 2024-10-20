"use client"; // Ensures this file is treated as a Client Component

import React, { useState, useEffect } from "react";
import styles from "@/app/(component)/MoodTracker/MoodTracker.module.css";
import { useRouter } from "next/navigation";
import { auth } from "../Firebase/firebase";
import {
    addMoodHistory,
    deleteMoodHistory,
    exportToCSV,
    fetchMoodHistory
} from "../Firebase/firestore/moodTrackerDB";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faDownload } from "@fortawesome/free-solid-svg-icons";

const moodOptions = [
    { name: "Happy", img: "./mood_images/happy.png" },
    { name: "Great", img: "./mood_images/great.png" },
    { name: "Neutral", img: "./mood_images/neutral.png" },
    { name: "Sad", img: "./mood_images/sad.png" },
    { name: "Angry", img: "./mood_images/angry.png" },
    { name: "Worried", img: "./mood_images/worried.png" }
];

const formatTimestamp = timestamp => new Date(timestamp).toLocaleString();

const MoodTracker = () => {
    const router = useRouter();
    const [selectedMood, setSelectedMood] = useState(null);
    const [moodHistory, setMoodHistory] = useState([]);
    const [showInsights, setShowInsights] = useState(false);
    const [timeFrame, setTimeFrame] = useState("Today");
    const [selectedEntries, setSelectedEntries] = useState([]);
    const user = auth.currentUser.uid;

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

    // Filter mood history by selected time frame
    const filterMoodHistory = () => {
        const now = new Date();
        return moodHistory.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return timeFrame === "Today"
                ? entryDate.toDateString() === now.toDateString()
                : timeFrame === "Last 7 Days"
                ? now - entryDate <= 7 * 24 * 60 * 60 * 1000
                : timeFrame === "Last 30 Days"
                ? now - entryDate <= 30 * 24 * 60 * 60 * 1000
                : true;
        });
    };

    const calculateInsights = () => {
        const filteredHistory = filterMoodHistory();
        const moodCount = filteredHistory.reduce(
            (acc, { mood }) => ({ ...acc, [mood]: (acc[mood] || 0) + 1 }),
            {}
        );
        const mostFrequentMood = Object.keys(moodCount).reduce(
            (a, b) => (moodCount[a] > moodCount[b] ? a : b),
            ""
        );
        return {
            totalEntries: filteredHistory.length,
            mostFrequentMood,
            filteredHistory
        };
    };

    const insights = calculateInsights();
    console.log("insights", insights);

    return (
        <div className={styles.background}>
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
                    <i
                        alt="Download CSV"
                        className={styles.icon}
                        onClick={() => exportToCSV(moodHistory)}
                    >
                        <FontAwesomeIcon icon={faDownload} />
                    </i>
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
                        <i
                            className={styles.closeButton}
                            onClick={() => setShowInsights(false)}
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </i>
                        <h1>Mood Insights</h1>
                        <div className={styles.timeFrameContainer}>
                            <label>Sort by:</label>
                            <select
                                value={timeFrame}
                                onChange={e => setTimeFrame(e.target.value)}
                            >
                                <option value="Today">Today</option>
                                <option value="Last 7 Days">Last 7 Days</option>
                                <option value="Last 30 Days">
                                    Last 30 Days
                                </option>
                                <option value="All Time">All Time</option>
                            </select>
                        </div>
                        {insights.totalEntries > 0 ? (
                            <>
                                <div className={styles.descriptors}>
                                    <p>
                                        Total Entries: {insights.totalEntries}
                                    </p>
                                    <p>
                                        Most Frequent Mood:{" "}
                                        {insights.mostFrequentMood}
                                    </p>
                                </div>
                                <div className={styles.moodListContainer}>
                                    {insights.filteredHistory.map(entry => (
                                        <div
                                            key={entry.id}
                                            className={styles.moodTimestamps}
                                        >
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
                                                            : [
                                                                  ...prev,
                                                                  entry.id
                                                              ]
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
                                        </div>
                                    ))}
                                </div>
                                <br />
                                <button
                                    onClick={() =>
                                        handleDelete(selectedEntries)
                                    }
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
        </div>
    );
};

export default MoodTracker;
