"use client";
import { useEffect, useRef, useState } from "react";
import styles from "@/app/(component)/Calendar/Calendar.module.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { auth } from "../Firebase/firebase";
import {
    addEvent,
    deleteEvent,
    editEvent,
    fetchEvents
} from "../Firebase/firestore/calendarDB";

const Calendar = () => {
    const [events, setEvents] = useState([]); // Initialize events state
    const [eventTitle, setEventTitle] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [clickEvent, setClickEvent] = useState(null);
    const eventsRef = useRef();
    const user = auth.currentUser?.uid;

    useEffect(() => {
        const fetchData = async () => {
            eventsRef.current = await fetchEvents(user);
            setEvents(eventsRef.current);
        };

        fetchData();
    }, [user, eventsRef]);

    // Add new event
    const handleDateClick = arg => {
        setSelectedDate(arg.dateStr); // Set the selected date
        setStartTime(arg.dateStr); // Pre-fill start time with selected date
        setEndTime(arg.dateStr); // Pre-fill end time with selected date
    };

    // Submit new event
    const handleSubmit = async e => {
        e.preventDefault(); // Prevent default form submission
        if (eventTitle && startTime && endTime && user) {
            await addEvent(user, eventTitle, startTime, endTime); // Add the event to Firestore

            // Fetch the updated events after adding the new one
            eventsRef.current = await fetchEvents(user);
            setEvents(eventsRef.current); // Update the state with the correct events array

            // Clear the form fields after submission
            setEventTitle(""); 
            setStartTime(""); 
            setEndTime(""); 
            setSelectedDate(null);
        }
    };

    // Handle event click (for editing)
    const handleClickEvent = ({ event }) => {
        setClickEvent(event);
        setEventTitle(event.title); // Pre-fill form with the clicked event's title
        setStartTime(event.startStr); // Pre-fill form with event's start time
        setEndTime(event.endStr); // Pre-fill form with event's end time
        console.log("clicked" + event);
    };

    // Delete event
    const handleDeleteEvent = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this event?"
        );
        if (confirmDelete && clickEvent) {
            try {
                await deleteEvent(clickEvent.id); // Delete the event from Firestore
                const updatedEvents = events.filter(
                    e => e.id !== clickEvent.id
                ); // Remove from local state
                setEvents(updatedEvents); // Update the state with the remaining events
                setClickEvent(""); // Clear the clicked event after deletion
    
            } catch (error) {
                console.error("Error deleting event: ", error);
            }
        }
    };

    // Edit event
    const handleEditEvent = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        if (eventTitle && startTime && endTime && clickEvent && clickEvent.id) {
            const updateData = {
                title: eventTitle,
                start: startTime,
                end: endTime
            };
            try {
                await editEvent(clickEvent.id, updateData);
                setEvents(
                    events.map(entry =>
                        entry.id === clickEvent.id ? {
                            ...entry,
                            title: eventTitle,
                            start: startTime,
                            end: endTime
                        } : entry // Update the entry's content with the new value
                    )
                );
                setClickEvent(null); // Clear the clicked event
                setEventTitle(""); // Clear the form fields
                setStartTime(""); 
                setEndTime("");
                console.log("Event successfully edited");
            } catch (error) {
                console.error("Error editing event: ", error);
            }
        }
    };


     // Cancel editing
     const handleCancelEdit = () => {
        setClickEvent(null); // Clear the clicked event
        setEventTitle(""); // Clear the title
        setStartTime(""); // Clear the start time
        setEndTime(""); // Clear the end time
    };

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

                <div className={styles["calendarContainer"]}>
                    <FullCalendar
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
                        eventClick={handleClickEvent} // Handle event click
                    />

                    {/* Show the edit/delete form when an event is clicked */}
                    {clickEvent && (
                        <div className={styles.editForm}>
                            <h3>Edit Event: {clickEvent.title}</h3>
                            <form onSubmit={handleEditEvent}>
                                <input
                                    type="text"
                                    placeholder="New Event Title"
                                    value={eventTitle}
                                    onChange={e => setEventTitle(e.target.value)}
                                    required
                                />
                                <input
                                    type="datetime-local"
                                    placeholder="New Start Time"
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    required
                                />
                                <input
                                    type="datetime-local"
                                    placeholder="New End Time"
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                    required
                                />
                                <button type="submit">Save Changes</button>
                                <button type="button" onClick={handleDeleteEvent}>
                                    Delete Event
                                </button>
                                <button type="button" onClick={handleCancelEdit}>
                                    Cancel
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
