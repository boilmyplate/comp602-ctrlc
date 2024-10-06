"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import styles from "@/app/(component)/Home/home.module.css";
import { useAuth } from "@/app/(context)/auth";
import { useRouter } from "next/navigation";
import { db } from '../Firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
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

    useEffect(() => {
        if (!userLoggedIn) {
            router.push("/");
        }
    }, [userLoggedIn, router]);

    useEffect(() => {
        const loadMoodHistory = async () => {
            const data = (await getDocs(collection(db, "moodHistory"))).docs.map(doc => doc.data());
            setMoodHistory(data);
        };
        if (userLoggedIn) loadMoodHistory();
    }, [userLoggedIn]);

    useEffect(() => {
        const loadMessages = async () => {
            const data = (await getDocs(collection(db, "messages"))).docs.map(doc => doc.data());
            setMessages(data);
        };
        if (userLoggedIn) loadMessages();
    }, [userLoggedIn]);

    useEffect(() => {
        let streak = 0;
        for (let i = moodHistory.length - 1; i >= 0; i--) {
            if (moodHistory[i].mood === 'Happy') streak++;
            else break;
        }
        setHappyStreak(streak);
    }, [moodHistory]);

    const moodData = moodHistory.reduce((acc, entry) => {
        const found = acc.find(item => item.name === entry.mood);
        if (found) found.value += 1;
        else acc.push({ name: entry.mood, value: 1 });
        return acc;
    }, []);

    const sortedMoodData = [...moodData].sort((a, b) => 
        sortBy === 'frequency' ? b.value - a.value : a.name.localeCompare(b.name)
    );

    useEffect(() => {
        if (messages.length > 0) {
            const counts = messages.reduce((acc, message) => {
                acc[message.category] = (acc[message.category] || 0) + 1;
                return acc;
            }, {});

            setCategoryCounts(Object.keys(counts).map(category => ({ category, count: counts[category] })));
        }
    }, [messages]);

    return (
        <div className={styles.container}>
            {userLoggedIn ? (
                <div className={styles.contentWrapper}>
                    <div className={styles.streakContainer}>
                        <Image src="/mood_images/fire.png" alt="Fire Icon" width={30} height={30} className={styles.fireIcon} />
                        <h4>Happy Streak: {happyStreak} day(s)</h4>
                    </div>

                    <div className={styles.sortContainer}>
                        <label htmlFor="sortBy">Sort By: </label>
                        <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.sortSelect}>
                            <option value="mood">Mood Name</option>
                            <option value="frequency">Mood Frequency</option>
                        </select>
                    </div>

                    <div className={styles.chartFlexContainer}>
                        <div className={styles.pieChartContainer}>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie data={sortedMoodData} cx="50%" cy="50%" outerRadius={129} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                        {sortedMoodData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className={styles.barChartContainer}>
                            <ResponsiveContainer width="80%" height={400}>
                                <BarChart data={categoryCounts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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