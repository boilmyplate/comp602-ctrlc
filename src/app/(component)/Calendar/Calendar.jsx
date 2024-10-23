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
        console.log("COMPONENT RENDERED");
    }, [user, eventsRef]);

    const formatDate = dateStr => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Add new event
    const handleDateClick = arg => {
        const date = formatDate(arg.dateStr); // Format the selected date
        setSelectedDate(date); // Set the selected date
        setStartTime(date); // Pre-fill start time with formatted date
        setEndTime(date); // Pre-fill end time with formatted date
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (eventTitle && startTime && endTime) {
            const added = await addEvent(user, eventTitle, startTime, endTime); // Add the event to Firestore

            eventsRef.current.push(added);
            setEvents([...eventsRef.current]);
            console.log("Updating Events: ", eventsRef.current);

            resetForm();
        }
    };

    // Handle event click (for editing)
    const handleClickEvent = ({ event }) => {
        const date = formatDate(event.dateStr);
        setClickEvent(event);
        setEventTitle(event.title); // Pre-fill form with the clicked event's title
        setSelectedDate(date);
        setStartTime(date); // Pre-fill form with event's start time
        setEndTime(date); // Pre-fill form with event's end time
        // console.log("clicked", event);
    };

    // Delete event
    const handleDeleteEvent = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this event?"
        );

        if (confirmDelete && clickEvent) {
            try {
                await deleteEvent(clickEvent.id); // Delete the event from Firestore
                eventsRef.current = eventsRef.current.filter(
                    e => e.id !== clickEvent.id
                );
                setEvents(eventsRef.current); // Update the state with the remaining events
                setClickEvent(null); // Clear the clicked event after deletion
            } catch (error) {
                console.error("Error deleting event: ", error);
            }
        }
    };

    // Edit event
    const handleEditEvent = async e => {
        e.preventDefault();

        const updateData = {
            title: eventTitle,
            start: startTime,
            end: endTime
        };

        try {
            await editEvent(clickEvent.id, updateData);
            eventsRef.current = eventsRef.current.map(e =>
                e.id === clickEvent.id
                    ? {
                          ...e,
                          ...updateData
                      }
                    : e
            );
            setEvents([...eventsRef.current]);
            resetForm();
            console.log("Event successfully edited");
        } catch (error) {
            console.error("Error editing event: ", error.message);
        }
    };

    function resetForm() {
        setClickEvent(null);
        setEventTitle("");
        setStartTime("");
        setEndTime("");
    }

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
                        plugins={[
                            dayGridPlugin,
                            timeGridPlugin,
                            interactionPlugin
                        ]}
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
                                    onChange={e =>
                                        setEventTitle(e.target.value)
                                    }
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
                                <button
                                    type="button"
                                    onClick={handleDeleteEvent}
                                >
                                    Delete Event
                                </button>
                                <button type="button" onClick={resetForm}>
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
