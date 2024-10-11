"use client";
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import styles from "@/app/(component)/Home/home.module.css";
import { useAuth } from "@/app/(context)/auth";
import { useRouter } from "next/navigation";
import { db } from '../Firebase/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4560', '#32CD32'];

export default function Home() {
    const { userLoggedIn } = useAuth();
    const router = useRouter();
    const [moodHistory, setMoodHistory] = useState([]);
    const [messages, setMessages] = useState([]);
    const [happyStreak, setHappyStreak] = useState(0);
    const [sortBy, setSortBy] = useState("mood");
    const [categoryCounts, setCategoryCounts] = useState([]);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [penguinScore, setPenguinScore] = useState(0);
    const [alphabet2048Score, setAlphabet2048Score] = useState(0);

    // Fetch high scores for Penguin and 2048 games from Firebase
    useEffect(() => {
        const fetchScores = async () => {
            try {
                // Fetch score for the Penguin game
                const penguinDoc = await getDoc(doc(db, "scores", "penguin_score"));
                if (penguinDoc.exists()) {
                    setPenguinScore(penguinDoc.data().score); // Use "score" instead of "highScore"
                } else {
                    console.log("Penguin score document does not exist.");
                }
    
                // Fetch score for the 2048 game
                const alphabet2048Doc = await getDoc(doc(db, "scores", "2048_score"));
                if (alphabet2048Doc.exists()) {
                    setAlphabet2048Score(alphabet2048Doc.data().score); // Use "score" instead of "highScore"
                } else {
                    console.log("2048 score document does not exist.");
                }
            } catch (error) {
                console.error("Error fetching scores from Firebase:", error);
            }
        };
        
        fetchScores();
    }, []);
    

    useEffect(() => {
        if (!userLoggedIn) router.push("/");

        const fetchData = async () => {
            const moodData = await getDocs(collection(db, "moodHistory"));
            const messageData = await getDocs(collection(db, "messages"));
            setMoodHistory(moodData.docs.map(doc => doc.data()));
            setMessages(messageData.docs.map(doc => doc.data()));
        };

        if (userLoggedIn) fetchData();
    }, [userLoggedIn, router]);

    useEffect(() => {
        // Calculate Happy Streak
        const sortedHistory = [...moodHistory]
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

    const moodData = moodHistory.reduce((acc, { mood }) => {
        const moodItem = acc.find(item => item.name === mood);
        if (moodItem) moodItem.value += 1;
        else acc.push({ name: mood, value: 1 });
        return acc;
    }, []);

    const sortedMoodData = moodData.sort((a, b) =>
        sortBy === 'frequency' ? b.value - a.value : a.name.localeCompare(b.name)
    );

    useEffect(() => {
        const counts = messages.reduce((acc, { category }) => {
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        setCategoryCounts(Object.keys(counts).map(category => ({ category, count: counts[category] })));
    }, [messages]);

    return (
        <div className={styles.container}>
            {userLoggedIn ? (
                <div className={styles.contentWrapper}>
                    {/* Top Row: Happy Streak, Map Container, and Game Scoreboard */}
                    <div className={styles.topRowContainer}>
                        <div className={styles.streakContainer}>
                            <Image src="/mood_images/fire.png" alt="Fire Icon" width={30} height={30} className={styles.fireIcon} />
                            <h4>Happy Streak: {happyStreak} day(s)</h4>
                        </div>

                        {/* Map Container with Image */}
                        <div className={styles.mapContainer}>
                            <Image src="/map.png" alt="Map"  width={80} height={80} />
                        </div>

                        {/* Game Scoreboard displaying 2048 and Penguin high scores */}
<div className={styles.scoreboardContainer}>
    <h4>Current Game High Score</h4>
    <ul className={styles.scoreList}>
        <li className={styles.scoreItem}>
            <span className={styles.gameTitle}>Penguin Game:</span>
            <span className={styles.scoreValue}>{penguinScore} points</span>
        </li>
        <li className={styles.scoreItem}>
            <span className={styles.gameTitle}>2048 Alphabet:</span>
            <span className={styles.scoreValue}>{alphabet2048Score} points</span>
        </li>
    </ul>
</div>

                    </div>

                    {/* Dropdown to sort mood data */}
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
                                    <Pie data={sortedMoodData} cx="50%" cy="60%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                        {sortedMoodData.map((entry, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <button onClick={() => router.push("/moodTracker")} className={styles.moodTrackerButton}>Go to Mood Tracker
                            </button>
                        </div>

                        <div className={styles.barChartContainer}>
                            <h4>Journal Entry</h4>
                            <ResponsiveContainer width="70%" height={400}>
                                <BarChart data={categoryCounts}>
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
            ) : (
                <p>Please log in to see your mood and message data.</p>
            )}
        </div>
    );
}
