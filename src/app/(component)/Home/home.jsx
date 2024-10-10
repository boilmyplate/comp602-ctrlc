"use client"; // Ensures the file is treated as a client-side component

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
import { useAuth } from "@/app/(context)/auth";
import { useRouter } from "next/navigation";
import { db } from "../Firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
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
    const { userLoggedIn } = useAuth();
    const router = useRouter();
    const [moodHistory, setMoodHistory] = useState([]);
    const [messages, setMessages] = useState([]);
    const [happyStreak, setHappyStreak] = useState(0);
    const [sortBy, setSortBy] = useState("mood");
    const [categoryCounts, setCategoryCounts] = useState([]);
    const [leaderboardData, setLeaderboardData] = useState([]);

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
        const streak = moodHistory.reduceRight((acc, entry) => {
            if (entry.mood === "Happy") return acc + 1;
            return 0;
        }, 0);
        setHappyStreak(streak);
    }, [moodHistory]);

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

    useEffect(() => {
        const counts = messages.reduce((acc, { category }) => {
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        setCategoryCounts(
            Object.keys(counts).map(category => ({
                category,
                count: counts[category]
            }))
        );
    }, [messages]);

    return (
        <div className={styles.container}>
            {userLoggedIn ? (
                <div className={styles.contentWrapper}>
                    {/* Top Row: Happy Streak, Map Container, and Game Scoreboard */}
                    <div className={styles.topRowContainer}>
                        <div className={styles.streakContainer}>
                            <Image
                                src="/mood_images/fire.png"
                                alt="Fire Icon"
                                width={30}
                                height={30}
                                className={styles.fireIcon}
                            />
                            <h4>Happy Streak: {happyStreak} day(s)</h4>
                        </div>

                        {/* Map Container with Image */}
                        <div className={styles.mapContainer}>
                            <Image
                                src="/map.png"
                                alt="Map"
                                width={80}
                                height={80}
                            />
                        </div>

                        <div className={styles.scoreboardContainer}>
                            <h4>Game Scoreboard</h4>
                            <ul>
                                {leaderboardData.map((player, index) => (
                                    <li key={index}>
                                        {player.name}: {player.score} points
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Dropdown to sort mood data */}
                    <div className={styles.sortContainer}>
                        <label htmlFor="sortBy">Sort By: </label>
                        <select
                            id="sortBy"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className={styles.sortSelect}
                        >
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
                                    <Pie
                                        data={sortedMoodData}
                                        cx="50%"
                                        cy="60%"
                                        outerRadius={100}
                                        dataKey="value"
                                        label={({ name, percent }) =>
                                            `${name}: ${(percent * 100).toFixed(
                                                0
                                            )}%`
                                        }
                                    >
                                        {sortedMoodData.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className={styles.barChartContainer}>
                            <h4>Journal Entry</h4>
                            <ResponsiveContainer width="80%" height={400}>
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
