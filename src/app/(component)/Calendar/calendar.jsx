"use client";
import { useEffect, useState } from "react";
import styles from "@/app/(component)/Calendar/calendar.module.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDocs,
    onSnapshot
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // For user authentication
import { auth, db } from "../Firebase/firebase";

const Calendar = () => {
    const [events, setEvents] = useState([]); // Initialize events state
    const [eventTitle, setEventTitle] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                setUserId(user.uid);
                const eventsRef = collection(db, "calendar", userId, "events"); // Reference to the user's document
                const snapshot = await getDocs(eventsRef); // Fetch the user's document
                const fetchedEvents = snapshot.docs.map(doc => doc.data());
                console.log(fetchedEvents);
                setEvents(fetchedEvents); // Set the events state with fetched events
            } catch (error) {
                console.error("Fetch Error: ", error);
            } 
        });

        // Clean up listener when component unmounts
        return () => unsubscribe();
    }, []);

    // adding an event
    const handleDateClick = arg => {
        setSelectedDate(arg.dateStr); // Set the selected date
        setStartTime(arg.dateStr); // Pre-fill start time with selected date
        setEndTime(arg.dateStr); // Pre-fill end time with selected date
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        if (eventTitle && startTime && endTime && userId) {
            const eventsRef = collection(db, "calendar", userId, "events"); // Reference to user's events collection
            await addDoc(eventsRef, { title: eventTitle, start: startTime, end: endTime }); // Add new event to Firestore
            setEvents((prevEvents) => [...prevEvents, { title: eventTitle, start: startTime, end: endTime }]); // Update local state
            setEventTitle(""); // Clear the input fields
            setStartTime(""); // Clear the start time
            setEndTime(""); // Clear the end time
            setSelectedDate(null); // Clear the selected date
            console.log("inside handleSubmit(): ", events);
        }
    };

    // const [removeEvent, setRemoveEvent] = useState([]);

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.form}>
                {/* Form for Adding New Events */}
                <form onSubmit={handleSubmit} className={styles.eventForm}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Event Title"
                        value={eventTitle}
                        onChange={e => setEventTitle(e.target.value)}
                        required
                    />
                    <input
                        type="datetime-local"
                        name="start"
                        placeholder="Start Time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        required
                    />
                    <input
                        type="datetime-local"
                        name="end"
                        placeholder="End Time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        required
                    />
                    <button type="submit">Add Event</button>
                </form>
            </div>

            <FullCalendar
                key={events.length}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={"dayGridMonth"}
                headerToolbar={{
                    start: "today prev,next",
                    center: "title",
                    end: "dayGridMonth,timeGridWeek,timeGridDay"
                }}
                height={"90vh"}
                events={events} // Use the events state
                dateClick={handleDateClick} // Handle date click
            />
        </div>
    );
};

export default Calendar;
