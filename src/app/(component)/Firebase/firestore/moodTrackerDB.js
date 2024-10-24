import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    Timestamp,
    where
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

export const fetchMoodHistoryLastWeek = async user => {
    try {
        const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); 

        const moodHistoryRef = collection(db, "users", user, "moodhistory");

        const moodQuery = query(moodHistoryRef, where("createdAt", ">=", sevenDaysAgo));
        
        const querySnapshot = await getDocs(moodQuery);
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
            { ...newMoodEntry,
                createdAt: serverTimestamp()
            }
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

