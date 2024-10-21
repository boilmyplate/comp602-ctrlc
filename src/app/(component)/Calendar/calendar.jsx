"use client";
import { useEffect, useRef, useState } from "react";
import styles from "@/app/(component)/Calendar/calendar.module.css";
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
    const eventsRef = useRef(null);
    const [user] = auth.currentUser.uid;

    useEffect(() => {
        const fetchEvents = async () => {
            eventsRef.current = await fetchEvents(user);
            setEvents(eventsRef.current);
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            eventsRef.current = await fetchEvents(user);
            setEvents(eventsRef.current);
        };

        fetchData();
    }, [eventTitle]);

    // adding an event
    const handleDateClick = arg => {
        setSelectedDate(arg.dateStr); // Set the selected date
        setStartTime(arg.dateStr); // Pre-fill start time with selected date
        setEndTime(arg.dateStr); // Pre-fill end time with selected date
    };

    // handle the submit button
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

    // handle the click event
    const handleClickEvent = ({ event }) => {
        setClickEvent(event);
        setEventTitle(event.title); // Set the title to the clicked event's title
        setStartTime(event.start); // Set the start time to the clicked event's start time
        setEndTime(event.end);
        console.log("clicked");
    };

    // handle the delete event
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
                setClickEvent(null); // Clear the clicked event after deletion
    
            } catch (error) {
                console.error("Error deleting event: ", error);
            }
        }
    };

    // handle the edit event
    const handleEditEvent = async () => {
        if (eventTitle && startTime && endTime && clickEvent) {
            const updateData = {
                title: eventTitle,
                start: startTime,
                end: endTime
            };
            try {
                await editEvent(clickEvent.id, updateData);
                const updatedEvents = events.map(e =>
                    e.id === clickEvent.id
                        ? {
                              ...e,
                              title: eventTitle,
                              start: startTime,
                              end: endTime
                          }
                        : e
                );
                setEvents(updatedEvents);
                setClickEvent(null);
                console.log("Event successfully edit");
            } catch (error) {
                console.error("Error edit event: ", error);
            }
        }
    };


     // handle the cancel action
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
    );
};

export default Calendar;
