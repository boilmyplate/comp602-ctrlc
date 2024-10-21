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
  Legend,
} from "recharts";
import styles from "@/app/(component)/Home/Home.module.css";
import { useRouter } from "next/navigation";
import { db, auth } from "../Firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import Image from "next/image";
import { fetchHighScore } from "../Firebase/firestore/gameDB";
import { fetchMoodHistory } from "../Firebase/firestore/moodTrackerDB";

const COLORS = [
  "#606C38",
  "#FEFAE0",
  "#93b2ce",
  "#FF8042",
  "#FF4560",
  "#32CD32",
];

export default function Home() {
  const router = useRouter();
  const [moodHistory, setMoodHistory] = useState([]);
  const [happyStreak, setHappyStreak] = useState(0);
  const [sortBy, setSortBy] = useState("mood");
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [penguinScore, setPenguinScore] = useState("No score yet");
  const [alphabet2048Score, setAlphabet2048Score] = useState("No score yet");
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardSortBy, setLeaderboardSortBy] = useState("score");

  const user = auth.currentUser?.uid; 

  // Fetch high scores for the authenticated user
  useEffect(() => {
    const fetchData = async () => {
      const penguinScoreRef = await fetchHighScore(user, "penguinScore");
      const alphabet2048ScoreRef = await fetchHighScore(user, "2048Score");
      setPenguinScore(penguinScoreRef);
      setAlphabet2048Score(alphabet2048ScoreRef);
    };

    fetchData();
  }, [user]);

  // Fetch leaderboard data from Firestore
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboardData = [];
        const leaderboardQuery = query(
          collection(db, "users"),
          orderBy("penguinscore", "desc"),
          limit(10)
        );
        const leaderboardSnapshot = await getDocs(leaderboardQuery);

        leaderboardSnapshot.forEach((scoreDoc) => {
          const { displayName, gameType, score } = scoreDoc.data();
          leaderboardData.push({ displayName, gameType, score });
        });

        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  // Sort leaderboard based on selected criteria (either by score or game type)
  useEffect(() => {
    if (leaderboardSortBy === "score") {
      // Sort by score in descending order
      setLeaderboard((prevLeaderboard) =>
        [...prevLeaderboard].sort((a, b) => b.score - a.score)
      );
    } else if (leaderboardSortBy === "gameType") {
      // Sort by gameType alphabetically and then by score within each game type
      setLeaderboard((prevLeaderboard) =>
        [...prevLeaderboard]
          .sort((a, b) => a.gameType.localeCompare(b.gameType))
          .sort((a, b) => b.score - a.score) // Keep high scores on top within each game type
      );
    }
  }, [leaderboardSortBy]);

  // Fetch mood history from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const moodHistoryRef = await fetchMoodHistory(user);
      setMoodHistory(moodHistoryRef);
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
      .filter((entry) => entry.mood === "Happy")
      .sort((a, b) => b.date - a.date);

    let streak = 0;
    let currentStreakDate = new Date();

    happyMoods.forEach((entry) => {
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

  // Mood data calculation for the PieChart
  const moodData = moodHistory.reduce((acc, { mood }) => {
    const moodItem = acc.find((item) => item.name === mood);
    if (moodItem) moodItem.value += 1;
    else acc.push({ name: mood, value: 1 });
    return acc;
  }, []);

  const sortedMoodData = moodData.sort((a, b) =>
    sortBy === "frequency"
      ? b.value - a.value
      : a.name.localeCompare(b.name)
  );

  // Frequency calculation for the BarChart
  useEffect(() => {
    const fetchJournalCounts = async () => {
      try {
        // Reference to the user's document
        const docRef = doc(db, "users", user);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();

          // Extract category counts from the user document
          const categoryCountsData = [
            {
              category: "Shopping List",
              count: userData.journalShoppingListCount || 0,
            },
            {
              category: "Spending Log",
              count: userData.journalSpendingLogCount || 0,
            },
            {
              category: "Emotion",
              count: userData.journalEmotionCount || 0,
            },
            {
              category: "To-Do List",
              count: userData.journalToDoListCount || 0,
            },
            {
              category: "Other",
              count: userData.journalOtherCount || 0,
            },
          ];

          setCategoryCounts(categoryCountsData);
        } else {
          console.log("No user document found!");
          setCategoryCounts([]); // Set to empty if no data found
        }
      } catch (error) {
        console.error("Error fetching journal category counts:", error);
      }
    };

    fetchJournalCounts();
  }, [user]);

  // Custom Tooltip Component for the BarChart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#FEFAE0", 
            color: "#333",           
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <p>{`Category: ${label}`}</p>
          <p>{`Count: ${payload[0].value}`}</p>
        </div>
      );
    }

    return null;
  };

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
                <span className={styles.gameTitle}>Penguin Game:</span>
                <span className={styles.scoreValue}>{penguinScore}</span>
              </li>
              <li className={styles.scoreItem}>
                <span className={styles.gameTitle}>2048 Alphabet:</span>
                <span className={styles.scoreValue}>{alphabet2048Score}</span>
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
                onChange={(e) => setLeaderboardSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="score">Highest Score</option>
                <option value="gameType">Game Type</option>
              </select>
            </div>
            <ul className={styles.leaderboardList}>
              {leaderboard.map((entry, index) => (
                <li key={index} className={styles.leaderboardItem}>
                  <span className={styles.leaderboardRank}>{index + 1}.</span>
                  <span className={styles.leaderboardUser}>
                    {entry.displayName ? entry.displayName : "Unknown User"}
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
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="mood">Mood Name</option>
                <option value="frequency">Mood Frequency</option>
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
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {sortedMoodData.length ? (
                    sortedMoodData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
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
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={
                  categoryCounts.length
                    ? categoryCounts
                    : [{ category: "No data", count: 0 }]
                }
              >
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="count" fill="#FEFAE0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
