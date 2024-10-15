"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import styles from "@/app/(component)/Home/home.module.css";
import { useAuth } from "@/app/(context)/auth";
import { useRouter } from "next/navigation";
import { db } from '../Firebase/firebase'; // Importing Firestore
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import Image from 'next/image';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#32CD32'];

export default function Home() {
    const { user } = useAuth();
    const router = useRouter();
    const [moodHistory, setMoodHistory] = useState([]);
    const [messages, setMessages] = useState([]);
    const [happyStreak, setHappyStreak] = useState(0);
    const [sortBy, setSortBy] = useState("mood");
    const [categoryCounts, setCategoryCounts] = useState([]);
    const [penguinScore, setPenguinScore] = useState(null); // Default to "no score yet"
    const [alphabet2048Score, setAlphabet2048Score] = useState(null); // Default to "no score yet"

    const uid = user ? user.uid : null;

    // Debugging logs for user info
    useEffect(() => {
        console.log("User ID:", uid);
        console.log("User:", user);
    }, [uid]);

    // Fetch game scores from Firestore
    useEffect(() => {
        if (!uid) {
            console.log("User ID is null, skipping score fetch");
            return;
        }

        const fetchScores = async () => {
            try {
                console.log(`Fetching scores for user ID: ${uid}`);
                const penguinDoc = await getDoc(doc(db, "scores", `${uid}_penguin_score`));
                const alphabet2048Doc = await getDoc(doc(db, "scores", `${uid}_2048`));

                if (penguinDoc.exists()) {
                    setPenguinScore(penguinDoc.data().score || null);
                    console.log("Penguin Score:", penguinDoc.data().score);
                } else {
                    console.log("No Penguin Score document found for this user.");
                }

                if (alphabet2048Doc.exists()) {
                    setAlphabet2048Score(alphabet2048Doc.data().score || null);
                    console.log("Alphabet 2048 Score:", alphabet2048Doc.data().score);
                } else {
                    console.log("No Alphabet 2048 Score document found for this user.");
                }
            } catch (error) {
                console.error("Error fetching scores from Firebase:", error);
            }
        };

        fetchScores();
    }, [uid]);

    // Fetch mood history and messages from Firestore
    useEffect(() => {
        if (!uid) return;

        const fetchData = async () => {
            try {
                const moodQuery = query(collection(db, "moodHistory"), where("userId", "==", uid));
                const moodData = await getDocs(moodQuery);
                setMoodHistory(moodData.docs.map(doc => doc.data()));

                const messageQuery = query(collection(db, "messages"), where("userId", "==", uid));
                const messageData = await getDocs(messageQuery);
                setMessages(messageData.docs.map(doc => doc.data()));

                console.log("Fetched mood history and messages:", {
                    moodHistory: moodData.docs.map(doc => doc.data()),
                    messages: messageData.docs.map(doc => doc.data())
                });
            } catch (error) {
                console.error("Error fetching user data from Firebase:", error);
            }
        };

        fetchData();
    }, [uid]);

    // Calculate the happy streak based on consecutive "Happy" moods
    useEffect(() => {
        const sortedHistory = moodHistory
            .filter(entry => entry.mood === 'Happy')
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        let streak = 0;
        let currentStreak = true;
        const today = new Date();

        if (sortedHistory.length > 0) {
            const latestEntryDate = new Date(sortedHistory[0].date);
            const dayDifference = Math.floor((today - latestEntryDate) / (1000 * 60 * 60 * 24));

            if (dayDifference <= 1) {
                streak = 1;
                for (let i = 1; i < sortedHistory.length; i++) {
                    const currentDate = new Date(sortedHistory[i - 1].date);
                    const nextDate = new Date(sortedHistory[i].date);

                    const dayDiff = Math.floor((currentDate - nextDate) / (1000 * 60 * 60 * 24));

                    if (dayDiff === 1) {
                        streak += 1;
                    } else {
                        currentStreak = false;
                        break;
                    }
                }
            } else {
                currentStreak = false;
            }
        } else {
            currentStreak = false;
        }

        setHappyStreak(currentStreak ? streak : 0);
    }, [moodHistory]);

    // Calculate the frequency of each mood for the Pie chart
    const moodData = moodHistory.reduce((acc, { mood }) => {
        const moodItem = acc.find(item => item.name === mood);
        if (moodItem) moodItem.value += 1;
        else acc.push({ name: mood, value: 1 });
        return acc;
    }, []);

    const sortedMoodData = moodData.sort((a, b) =>
        sortBy === 'frequency' ? b.value - a.value : a.name.localeCompare(b.name)
    );

    // Calculate the frequency of each category for the Bar chart
    useEffect(() => {
        const counts = messages.reduce((acc, { category }) => {
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        setCategoryCounts(Object.keys(counts).map(category => ({ category, count: counts[category] })));
    }, [messages]);

    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                {/* Top Row: Happy Streak and Game Scoreboard */}
                <div className={styles.topRowContainer}>
                    <div className={styles.streakContainer}>
                        <Image src="/mood_images/fire.png" alt="Fire Icon" width={30} height={30} className={styles.fireIcon} />
                        <h4>Happy Streak: {happyStreak > 0 ? `${happyStreak} day(s)` : "No happy streak yet"}</h4>
                    </div>

                    <div className={styles.scoreboardContainer}>
                        <h4>Current Game High Score</h4>
                        <ul className={styles.scoreList}>
                            <li className={styles.scoreItem}>
                                <span className={styles.gameTitle}>Penguin Game:</span>
                                <span className={styles.scoreValue}>
                                    {penguinScore !== null ? `${penguinScore} points` : "No score yet"}
                                </span>
                                <button onClick={() => router.push("/penguin")} className={styles.playButton}>Play Penguin Game</button>
                            </li>
                            <li className={styles.scoreItem}>
                                <span className={styles.gameTitle}>2048 Alphabet:</span>
                                <span className={styles.scoreValue}>
                                    {alphabet2048Score !== null ? `${alphabet2048Score} points` : "No score yet"}
                                </span>
                                <button onClick={() => router.push("/game_2048")} className={styles.playButton}>Play 2048 Alphabet</button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={styles.sortContainer}>
                    <label htmlFor="sortBy">Sort By: </label>
                    <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.sortSelect}>
                        <option value="mood">Mood Name</option>
                        <option value="frequency">Mood Frequency</option>
                    </select>
                </div>

                {/* Charts Container */}
                <div className={styles.chartFlexContainer}>
                    <div className={styles.pieChartContainer}>
                        <h4>Mood Tracker</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={sortedMoodData.length ? sortedMoodData : [{ name: "No data", value: 1 }]} cx="50%" cy="60%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                    {sortedMoodData.length ? sortedMoodData.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    )) : <Cell fill="#cccccc" />}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <button onClick={() => router.push("/moodTracker")} className={styles.moodTrackerButton}>Go to Mood Tracker</button>
                    </div>

                    <div className={styles.barChartContainer}>
                        <h4>Journal Entry</h4>
                        <ResponsiveContainer width="70%" height={400}>
                            <BarChart data={categoryCounts.length ? categoryCounts : [{ category: "No data", count: 0 }]}>
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
