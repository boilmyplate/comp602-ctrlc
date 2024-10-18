import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const fetchEvents = async uid => {
    const eventsRef = collection(db, "users", uid, "calendar");
    const snapshot = await getDocs(eventsRef);
    const fetchedEvents = snapshot.docs.map(doc => ({ 
        end: doc.end,
        start: doc.start,
        title: doc.title, 
    }));

    return fetchedEvents;
};

export const addEvent = async (uid, eventTitle, startTime, endTime) => {
    const eventsRef = collection(db, "users", uid, "calendar"); // Reference to user's events collection
    try {
        await addDoc(eventsRef, {
            title: eventTitle,
            start: startTime,
            end: endTime
        }); // Add new event to Firestore
    } catch (e) {
        console.error("Error adding event: ", e);
    }
};
