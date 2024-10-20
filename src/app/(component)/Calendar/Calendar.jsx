"use client";
import { useEffect, useRef, useState } from "react";
import styles from "@/app/(component)/Calendar/Calendar.module.css";
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
            eventsRef.current = await addEvent(
                user,
                eventTitle,
                startTime,
                endTime
            );
            setEvents(eventsRef.current);

            setEventTitle(""); // Clear the input fields
            setStartTime(""); // Clear the start time
            setEndTime(""); // Clear the end time
            setSelectedDate(null); // Clear the selected date
        }
    };

    // const [removeEvent, setRemoveEvent] = useState([]);

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
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
                    height={"70vh"}
                    events={events} // Use the events state
                    dateClick={handleDateClick} // Handle date click
                />
            </div>
        </div>
    );
};

export default Calendar;
