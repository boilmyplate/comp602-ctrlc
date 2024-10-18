"use client";
import { useEffect, useRef, useState } from "react";
import styles from "@/app/(component)/Calendar/calendar.module.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { auth } from "../Firebase/firebase";
import { addEvent, fetchEvents } from "../Firebase/firestore/calendarDB";

const Calendar = () => {
    const [events, setEvents] = useState([]); // Initialize events state
    const [eventTitle, setEventTitle] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const eventsRef = useRef(null);
    const user = auth.currentUser.uid;

    // useEffect(() => {
    //     const unsubscribe = onAuthStateChanged(auth, async (user) => {
    //         try {
    //             setuser(user.uid);
    //             const eventsRef = collection(db, "calendar", user, "events"); // Reference to the user's document
    //             const snapshot = await getDocs(eventsRef); // Fetch the user's document
    //             const fetchedEvents = snapshot.docs.map(doc => doc.data());
    //             console.log(fetchedEvents);
    //             setEvents(fetchedEvents); // Set the events state with fetched events
    //         } catch (error) {
    //             console.error("Fetch Error: ", error);
    //         }
    //     });

    //     // Clean up listener when component unmounts
    //     return () => unsubscribe();
    // }, []);

    useEffect(() => {
        const fetchData = async () => {
            eventsRef.current = await fetchEvents(user);
            setEvents(eventsRef.current);
        };

        fetchData();
    }, [user]);

    // adding an event
    const handleDateClick = arg => {
        setSelectedDate(arg.dateStr); // Set the selected date
        setStartTime(arg.dateStr); // Pre-fill start time with selected date
        setEndTime(arg.dateStr); // Pre-fill end time with selected date
    };

    const handleSubmit = async e => {
        e.preventDefault(); // Prevent default form submission
        if (eventTitle && startTime && endTime && user) {
            await addEvent(user, eventTitle, startTime, endTime);
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
