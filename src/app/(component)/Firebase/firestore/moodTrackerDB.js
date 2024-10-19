import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs
} from "firebase/firestore";
import { db } from "../firebase";

export const fetchMoodHistory = async user => {
    try {
        const userRef = collection(db, "users");
        const moodHistoryRef = collection(userRef, user, "moodhistory");
        const querySnapshot = await getDocs(moodHistoryRef);
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
        console.error("Error fetching data: ", error);
        return null;
    }
};

export const addMoodHistory = async (user, newMoodEntry) => {
    try {
        const userRef = collection(db, "users");
        const docRef = await addDoc(
            collection(userRef, user, "moodhistory"),
            newMoodEntry
        );
        return docRef;
    } catch (error) {
        console.error("Error adding doc: ", error);
        return null;
    }
};

export const deleteMoodHistory = async (user, entries) => {
    try {
        await Promise.all(
            entries.map(id =>
                deleteDoc(doc(db, "users", user, "moodhistory", id))
            )
        );
    } catch (error) {
        console.log("Error deleting mood entry/entries: ", error);
    }
};

export const exportToCSV = moodHistory => {
    const formatTimestamp = timestamp => new Date(timestamp).toLocaleString();
    const csvContent = [
        "Mood,Timestamp",
        ...moodHistory.map(
            entry => `${entry.mood},${formatTimestamp(entry.timestamp)}`
        )
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mood_history.csv";
    link.click();
};

// Filter mood history by selected time frame
export const filterMoodHistory = (moodHistory) => {
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

export const calculateInsights = (moodHistory) => {
    const filteredHistory = filterMoodHistory(moodHistory);
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
