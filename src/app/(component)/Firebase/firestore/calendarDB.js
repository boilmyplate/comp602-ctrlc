import {
    addDoc,
    collection,
    getDocs,
    query,
    where,
    doc,
    deleteDoc,
    updateDoc
} from "firebase/firestore";
import { db } from "../firebase";

export const fetchEvents = async uid => {
    const eventsRef = collection(db, "calendar"); // Reference to the user's events collection
    const q = query(eventsRef, where("user", "==", uid)); // Create a query to filter events by user ID
    try {
        const snapshot = await getDocs(q); // Fetch documents matching the query
        const events = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })); // Map documents to an array
        return events; // Return the array of events
    } catch (e) {
        console.error("Error fetching events: ", e);
        return []; // Return an empty array in case of an error
    }
};

export const addEvent = async (uid, eventTitle, startTime, endTime) => {
    const eventsRef = collection(db, "calendar"); // Reference to user's events collection
    try {
        await addDoc(eventsRef, {
            user: uid, // Include user ID in the event
            title: eventTitle,
            start: startTime,
            end: endTime
        }); // Add new event to Firestore
        console.log("Successfully added event");
    } catch (e) {
        console.error("Error adding event: ", e);
        return false; // Return false in case of error
    }
};

export const deleteEvent = async eventId => {
    const eventsRef = doc(db, "calendar", eventId);
    try {
        await deleteDoc(eventsRef);
        console.log("Successfully deleted event");
    } catch (e) {
        console.error("Error deleting event: ", e);
        return false; // Return false in case of error
    }
};


export const editEvent = async (eventId, updateData) => {
    const eventsRef = doc(db, "calendar", eventId);
    try {
        await updateDoc(eventsRef, updateData);
    } catch {
        return false
    }
}