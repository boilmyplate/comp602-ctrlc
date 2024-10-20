import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const fetchEvents = async uid => {
    const eventsRef = collection(db, "users", uid, "calendar");
    const snapshot = await getDocs(eventsRef);
    const fetchedEvents = snapshot.docs.map(doc => doc.data());

    if (fetchedEvents.length < 1) {
        console.error("No document");
        return [];
    }

    // console.log("fetchEvents: ", fetchEvents);
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
        console.log("Successfully added event");

        const events = await fetchEvents(uid); // Fetch events after adding
        return events;
    } catch (e) {
        console.error("Error adding event: ", e);
    }
};
