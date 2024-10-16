"use client"; // Ensures this file is treated as a Client Component

import React, { useState, useEffect } from 'react';
import styles from "@/app/(component)/moodTracker/moodTracker.module.css";
import { useRouter } from 'next/navigation';
import { db, auth } from '../Firebase/firebase';
import { collection, setDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const moodOptions = [
  { name: 'Happy', img: './mood_images/happy.png' },
  { name: 'Great', img: './mood_images/great.png' },
  { name: 'Neutral', img: './mood_images/neutral.png' },
  { name: 'Sad', img: './mood_images/sad.png' },
  { name: 'Angry', img: './mood_images/angry.png' },
  { name: 'Worried', img: './mood_images/worried.png' }
];

const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();

const MoodTracker = () => {
  const router = useRouter();
  const [uid, setUid] = useState(null); // State to store uid from auth
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [showInsights, setShowInsights] = useState(false);
  const [timeFrame, setTimeFrame] = useState('Today');
  const [selectedEntries, setSelectedEntries] = useState([]);

  // Monitor Firebase auth state and set uid
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid); // Set the uid for the logged-in user
      } else {
        setUid(null);
      }
    });
    return unsubscribe;
  }, []);

  // Load mood history for the specific user from Firestore
  useEffect(() => {
    if (!uid) return; // Only fetch data if uid is available

    const loadMoodHistory = async () => {
      try {
        const moodHistoryQuery = query(
          collection(db, "moodHistory"),
          where("uid", "==", uid) // Query based on uid to fetch user-specific data
        );
        const querySnapshot = await getDocs(moodHistoryQuery);
        setMoodHistory(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error("Error fetching mood history:", error);
      }
    };
    loadMoodHistory();
  }, [uid]);

  // Save selected mood to Firestore for the specific user
  const handleMoodSelect = async (moodName) => {
    if (!uid) {
      console.error("User ID is null. Cannot save mood entry.");
      return;
    }

    setSelectedMood(moodName);
    const timestamp = new Date().toISOString(); // Current timestamp

    // Set the document ID as `${uid}_${timestamp}` to allow multiple entries per user
    const docId = `${uid}_${timestamp}`;

    const newMoodEntry = { 
      mood: moodName, 
      timestamp: timestamp, 
      uid // Associate mood entry with uid
    };

    try {
      await setDoc(doc(db, "moodHistory", docId), newMoodEntry); // Use `setDoc` with custom doc ID
      setMoodHistory((prev) => [...prev, { ...newMoodEntry, id: docId }]); // Update local state with new entry
    } catch (error) {
      console.error("Error saving mood entry:", error);
    }
  };

  // Delete selected entries from Firestore
  const handleDelete = async (ids) => {
    if (window.confirm("Are you sure you want to delete the selected entries?")) {
      try {
        await Promise.all(ids.map((id) => deleteDoc(doc(db, "moodHistory", id))));
        setMoodHistory((prev) => prev.filter((entry) => !ids.includes(entry.id)));
        setSelectedEntries([]);
      } catch (error) {
        console.error("Error deleting entries:", error);
      }
    }
  };

  // Export mood history to CSV
  const exportToCSV = () => {
    const csvContent = ["Mood,Timestamp", ...moodHistory.map(entry => `${entry.mood},${formatTimestamp(entry.timestamp)}`)].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mood_history.csv";
    link.click();
  };

  // Filter mood history by selected time frame
  const filterMoodHistory = () => {
    const now = new Date();
    return moodHistory.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return timeFrame === 'Today' ? entryDate.toDateString() === now.toDateString() :
             timeFrame === 'Last 7 Days' ? now - entryDate <= 7 * 24 * 60 * 60 * 1000 :
             timeFrame === 'Last 30 Days' ? now - entryDate <= 30 * 24 * 60 * 60 * 1000 : true;
    });
  };

  const calculateInsights = () => {
    const filteredHistory = filterMoodHistory();
    const moodCount = filteredHistory.reduce((acc, { mood }) => ({ ...acc, [mood]: (acc[mood] || 0) + 1 }), {});
    const mostFrequentMood = Object.keys(moodCount).reduce((a, b) => moodCount[a] > moodCount[b] ? a : b, '');
    return { totalEntries: filteredHistory.length, mostFrequentMood, filteredHistory };
  };

  const insights = calculateInsights();

  return (
    <div className={styles.moodTrackerContainer}>
      <h2>How are you feeling right now?</h2>
      <div className={styles.moodGrid}>
        {moodOptions.map((mood) => (
          <div key={mood.name} className={styles.moodOption} onClick={() => handleMoodSelect(mood.name)}>
            <img src={mood.img} alt={mood.name} className={styles.moodImage} />
            <p>{mood.name}</p>
          </div>
        ))}
      </div>
      {selectedMood && <div className={styles.selectedMood}>You are feeling: {selectedMood}</div>}

      <div className={styles.buttonContainer}>
        <img src="/mood_images/download.png" alt="Download CSV" className={styles.icon} onClick={exportToCSV} />
        <button onClick={() => setShowInsights(!showInsights)} className={styles.insightsButton}>Show Insights</button>
        <button onClick={() => router.push('/')} className={styles.homeButton}>Back to Homepage</button>
      </div>

      {showInsights && (
      <div className={styles.insightsContainer}>
        <button className={styles.closeButton} onClick={() => setShowInsights(false)}>Close</button>
        <h3>Mood Insights</h3>
        <div className={styles.timeFrameContainer}>
          <label>Sort by:</label>
          <select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)}>
            <option value="Today">Today</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="All Time">All Time</option>
          </select>
        </div>
        {insights.totalEntries > 0 ? (
          <>
            <p>Total Entries: {insights.totalEntries}</p>
            <p>Most Frequent Mood: {insights.mostFrequentMood}</p>
            <ul className={styles.moodTimestamps}>
              {insights.filteredHistory.map((entry) => (
                <li key={entry.id}>
                  <input 
                    type="checkbox" 
                    checked={selectedEntries.includes(entry.id)} 
                    onChange={() => setSelectedEntries((prev) =>
                      prev.includes(entry.id) ? prev.filter((id) => id !== entry.id) : [...prev, entry.id]
                    )}
                  />
                  {entry.mood}: {formatTimestamp(entry.timestamp)}
                  <button onClick={() => handleDelete([entry.id])} className={styles.deleteButton} style={{ marginLeft: '10px' }}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={() => handleDelete(selectedEntries)} disabled={selectedEntries.length === 0} className={styles.deleteButton}>
              Delete Selected
            </button>
          </>
        ) : <p>No entries available.</p>}
      </div>
    )}
    </div>
  );
};

export default MoodTracker;