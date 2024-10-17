"use client";

import React, { useState, useEffect } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Legend
} from "recharts";
import styles from "@/app/(component)/Home/home.module.css";
import { useRouter } from "next/navigation";
import { db, auth } from "../Firebase/firebase";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    where,
    orderBy,
    limit
} from "firebase/firestore";
import Image from "next/image";

const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#FF4560",
    "#32CD32"
];

export default function Home() {
    const router = useRouter();
    const [moodHistory, setMoodHistory] = useState([]);
    const [messages, setMessages] = useState([]);
    const [happyStreak, setHappyStreak] = useState(0);
    const [sortBy, setSortBy] = useState("mood");
    const [categoryCounts, setCategoryCounts] = useState([]);
    const [penguinScore, setPenguinScore] = useState("No score yet");
    const [alphabet2048Score, setAlphabet2048Score] = useState("No score yet");
    const [leaderboard, setLeaderboard] = useState([]);
    const [leaderboardSortBy, setLeaderboardSortBy] = useState("score");

    const user = auth.currentUser;

    // Fetch high scores for the authenticated user
    useEffect(() => {
        if (user) {
            const fetchHighScores = async () => {
                try {
                    const penguinDoc = await getDoc(
                        doc(db, "scores", `${user.uid}_penguin_score`)
                    );
                    const alphabet2048Doc = await getDoc(
                        doc(db, "scores", `${user.uid}_2048`)
                    );

                    setPenguinScore(
                        penguinDoc.exists()
                            ? penguinDoc.data().score
                            : "No score yet"
                    );
                    setAlphabet2048Score(
                        alphabet2048Doc.exists()
                            ? alphabet2048Doc.data().score
                            : "No score yet"
                    );
                } catch (error) {
                    console.error("Error fetching scores:", error);
                }
            };

            fetchHighScores();
        }
    }, [user]);

    // Fetch leaderboard data from Firestore
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const leaderboardData = [];
                const leaderboardQuery = query(
                    collection(db, "scores"),
                    orderBy("score", "desc"),
                    limit(10)
                );
                const leaderboardSnapshot = await getDocs(leaderboardQuery);

                for (const scoreDoc of leaderboardSnapshot.docs) {
                    const {
                        uid,
                        gameType,
                        score,
                        displayName
                    } = scoreDoc.data();
                    // console.log(scoreDoc.data());
                    leaderboardData.push({ uid, displayName, gameType, score });
                }

                setLeaderboard(leaderboardData);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            }
        };

        fetchLeaderboard();
    }, []);

    // Sort leaderboard based on selected criteria
    useEffect(() => {
        if (leaderboardSortBy === "score") {
            setLeaderboard(prevLeaderboard =>
                [...prevLeaderboard].sort((a, b) => b.score - a.score)
            );
        } else if (leaderboardSortBy === "gameType") {
            setLeaderboard(prevLeaderboard =>
                [...prevLeaderboard].sort((a, b) =>
                    a.gameType.localeCompare(b.gameType)
                )
            );
        }
    }, [leaderboardSortBy]);

    // Fetch mood history and messages from Firestore
    useEffect(() => {
        const fetchData = async () => {
            try {
                const moodQuery = query(
                    collection(db, "moodHistory"),
                    where("uid", "==", user.uid)
                );
                const moodData = await getDocs(moodQuery);

                const moodHistoryData = moodData.docs.map(doc => {
                    const data = doc.data();
                    return {
                        ...data,
                        date: new Date(data.timestamp)
                    };
                });

                setMoodHistory(moodHistoryData);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchData();
    }, [user]);

    // Calculate the happy streak dynamically
    useEffect(() => {
        if (moodHistory.length === 0) {
            setHappyStreak(0);
            return;
        }

        const happyMoods = moodHistory
            .filter(entry => entry.mood === "Happy")
            .sort((a, b) => b.date - a.date);

        let streak = 0;
        let currentStreakDate = new Date();

        happyMoods.forEach(entry => {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);

            if (streak === 0) {
                currentStreakDate = entryDate;
                streak = 1;
            } else {
                const diffDays = Math.round(
                    (currentStreakDate - entryDate) / (1000 * 60 * 60 * 24)
                );
                if (diffDays === 1) {
                    streak += 1;
                    currentStreakDate = entryDate;
                } else if (diffDays > 1) {
                    return;
                }
            }
        });

        setHappyStreak(streak);
    }, [moodHistory]);

    // Mood data calculation for the Pie chart
    const moodData = moodHistory.reduce((acc, { mood }) => {
        const moodItem = acc.find(item => item.name === mood);
        if (moodItem) moodItem.value += 1;
        else acc.push({ name: mood, value: 1 });
        return acc;
    }, []);

    const sortedMoodData = moodData.sort((a, b) =>
        sortBy === "frequency"
            ? b.value - a.value
            : a.name.localeCompare(b.name)
    );

    // Frequency calculation for the Bar chart
    useEffect(() => {
        const fetchJournalCount = async () => {
            const messageQuery = query(
                collection(db, "messages"),
                where("uid", "==", user.uid)
            );
            const messageData = await getDocs(messageQuery);

            setMessages(
                messageData.docs.map(doc => ({ ...doc.data(), id: doc.id }))
            );
        };

        fetchJournalCount();

        if (messages.length === 0) return;

        const counts = messages.reduce((acc, { category }) => {
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        const categoryData = Object.keys(counts).map(category => ({
            category,
            count: counts[category]
        }));

        setCategoryCounts(categoryData);
    }, [messages]);

    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                {/* Top Row: Happy Streak and Game Scoreboard */}
                <div className={styles.topRowContainer}>
                    <div className={styles.streakContainer}>
                        <Image
                            src="/mood_images/fire.png"
                            alt="Fire Icon"
                            width={30}
                            height={30}
                            className={styles.fireIcon}
                        />
                        <h4>
                            Happy Streak:{" "}
                            {happyStreak === 0
                                ? "0 days happy streak"
                                : happyStreak === 1
                                ? "1 day happy streak"
                                : `${happyStreak} days happy streak`}
                        </h4>
                    </div>

                    <div className={styles.scoreboardContainer}>
                        <h4>Current Game High Score</h4>
                        <ul className={styles.scoreList}>
                            <li className={styles.scoreItem}>
                                <span className={styles.gameTitle}>
                                    Penguin Game:
                                </span>
                                <span className={styles.scoreValue}>
                                    {penguinScore}
                                </span>
                                
                            </li>
                            <li className={styles.scoreItem}>
                                <span className={styles.gameTitle}>
                                    2048 Alphabet:
                                </span>
                                <span className={styles.scoreValue}>
                                    {alphabet2048Score}
                                </span>
                                
                            </li>
                        </ul>
                    </div>

                    <div className={styles.leaderboardContainer}>
                        <h4>Game Leaderboard</h4>
                        <div className={styles.sortContainer}>
                            <label htmlFor="leaderboardSortBy">Sort By:</label>
                            <select
                                id="leaderboardSortBy"
                                value={leaderboardSortBy}
                                onChange={e =>
                                    setLeaderboardSortBy(e.target.value)
                                }
                                className={styles.sortSelect}
                            >
                                <option value="score">Highest Score</option>
                                <option value="gameType">Game Type</option>
                            </select>
                        </div>
                        <ul className={styles.leaderboardList}>
                            {leaderboard.map((entry, index) => (
                                <li
                                    key={index}
                                    className={styles.leaderboardItem}
                                >
                                    <span className={styles.leaderboardRank}>
                                        {index + 1}.
                                    </span>
                                    <span className={styles.leaderboardUser}>
                                        {entry.displayName}
                                    </span>
                                    <span className={styles.leaderboardScore}>
                                        {entry.gameType}: {entry.score}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className={styles.chartFlexContainer}>
                    <div className={styles.pieChartContainer}>
                        <h4>Mood Tracker</h4>
                        <div className={styles.sortContainer}>
                            <label htmlFor="sortBy">Sort By: </label>
                            <select
                                id="sortBy"
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className={styles.sortSelect}
                            >
                                <option value="mood">Mood Name</option>
                                <option value="frequency">
                                    Mood Frequency
                                </option>
                            </select>
                        </div>

                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={
                                        sortedMoodData.length
                                            ? sortedMoodData
                                            : [{ name: "No data", value: 1 }]
                                    }
                                    cx="50%"
                                    cy="60%"
                                    outerRadius={90}
                                    dataKey="value"
                                    label={({ name, percent }) =>
                                        `${name}: ${(percent * 100).toFixed(
                                            0
                                        )}%`
                                    }
                                >
                                    {sortedMoodData.length ? (
                                        sortedMoodData.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        ))
                                    ) : (
                                        <Cell fill="#cccccc" />
                                    )}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <button
                            onClick={() => router.push("/moodTracker")}
                            className={styles.moodTrackerButton}
                        >
                            Go to Mood Tracker
                        </button>
                    </div>

                    <div className={styles.barChartContainer}>
                        <h4>Journal Entry</h4>
                        <ResponsiveContainer width="70%" height={400}>
                            <BarChart
                                data={
                                    categoryCounts.length
                                        ? categoryCounts
                                        : [{ category: "No data", count: 0 }]
                                }>
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#7151d1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
