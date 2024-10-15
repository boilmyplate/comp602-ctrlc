"use client"; // Add this at the top of the file

import React, { useState, useEffect } from 'react';
import styles from "@/app/(component)/moodTracker/moodTracker.module.css";
import { useRouter } from 'next/navigation';
import { auth, db } from '../Firebase/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, where, query } from 'firebase/firestore';
import { useAuth } from '@/app/(context)/auth';

const moodOptions = [
  { name: 'Great', img: './mood_images/great.png' },
  { name: 'Happy', img: './mood_images/happy.png' },
  { name: 'Neutral', img: './mood_images/neutral.png' },
  { name: 'Sad', img: './mood_images/sad.png' },
  { name: 'Angry', img: './mood_images/angry.png' },
  { name: 'Worried', img: './mood_images/worried.png' }
];

// Helper function to format timestamp
const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();

const MoodTracker = () => {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [showInsights, setShowInsights] = useState(false);
  const [timeFrame, setTimeFrame] = useState('Today');
  const [selectedEntries, setSelectedEntries] = useState([]);
  const { userLoggedIn, loading } = useAuth();
  
  useEffect(() => {
    if(!userLoggedIn && !loading) {
      router.push("/");
    }
  }, [userLoggedIn, loading, router]);
  
  // Load mood history from Firestore
  useEffect(() => {
    const currentUser = auth.currentUser?.uid;
    const loadMoodHistory = async () => {
      const q = query(collection(db, "moodHistory"), where("uid", "==", currentUser));
      const querySnapshot = await getDocs(q);
      setMoodHistory(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    console.log(`current uid: ${currentUser}`)
    loadMoodHistory();
  }, []);

  // Save selected mood to Firestore
  const handleMoodSelect = async (moodName) => {
    const currentUser = auth.currentUser?.uid;
    setSelectedMood(moodName);
    const newMoodEntry = { mood: moodName, timestamp: new Date().toISOString(), uid: currentUser };
    const docRef = await addDoc(collection(db, "moodHistory"), newMoodEntry);
    setMoodHistory((prev) => [...prev, { ...newMoodEntry, id: docRef.id }]);
  };

  // Delete entries (single or multiple)
  const handleDelete = async (ids) => {
    if (window.confirm("Are you sure you want to delete the selected entries?")) {
      await Promise.all(ids.map((id) => deleteDoc(doc(db, "moodHistory", id))));
      setMoodHistory((prev) => prev.filter((entry) => !ids.includes(entry.id)));
      setSelectedEntries([]);
    }
  };

  // Convert moodHistory to CSV and download
  const exportToCSV = () => {
    const csvContent = ["Mood,Timestamp", ...moodHistory.map(entry => `${entry.mood},${formatTimestamp(entry.timestamp)}`)].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mood_history.csv";
    link.click();
  };

  // Filter mood history based on time frame
  const filterMoodHistory = () => {
    const now = new Date();
    return moodHistory.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return timeFrame === 'Today' ? entryDate.toDateString() === now.toDateString() :
             timeFrame === 'Last 7 Days' ? now - entryDate <= 7 * 24 * 60 * 60 * 1000 :
             timeFrame === 'Last 30 Days' ? now - entryDate <= 30 * 24 * 60 * 60 * 1000 : true;
    });
  };

  // Calculate insights based on filtered history
  const calculateInsights = () => {
    const filteredHistory = filterMoodHistory();
    const moodCount = filteredHistory.reduce((acc, { mood }) => ({ ...acc, [mood]: (acc[mood] || 0) + 1 }), {});
    const mostFrequentMood = Object.keys(moodCount).reduce((a, b) => moodCount[a] > moodCount[b] ? a : b, '');
    return { totalEntries: filteredHistory.length, mostFrequentMood, filteredHistory };
  };

  const insights = calculateInsights();
  console.log("insights", insights);

  return (
    <div className={styles.moodTrackerContainer}>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
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
        <button onClick={() => setShowInsights(true)} className={styles.insightsButton}>Show Insights</button>
        <button onClick={() => router.push('/home')} className={styles.homeButton}>Back to Homepage</button>
      </div>

      {showInsights && (
        <div className={styles.insightsContainer}>
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
      </>
      )}
    </div>
  );
};

export default MoodTracker;
