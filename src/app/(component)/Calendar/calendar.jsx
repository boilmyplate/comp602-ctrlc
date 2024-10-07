"use client";
import { useState } from "react";
import styles from "@/app/(component)/Calendar/calendar.module.css";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import { createViewWeek, createViewMonthGrid } from "@schedule-x/calendar";
import "@schedule-x/theme-default/dist/calendar.css";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";

const Calendar = () => {
  // Initialize events as an empty array
  const [events, setEvents] = useState([]);

  const calendar = useCalendarApp({
    views: [createViewMonthGrid(), createViewWeek()],
    events: events,
    selectedDate: "2025-01-01",
    plugins: [createEventModalPlugin(), createDragAndDropPlugin()],
  });

  // Function to handle adding a new event
  const addEvent = (e) => {
    e.preventDefault();
    const newEvent = {
      id: events.length + 1, // Use length of the current events array to assign a new id
      title: e.target.title.value,
      start: e.target.start.value,
      end: e.target.end.value,
    };
    setEvents([...events, newEvent]); // Update the state with the new event
    console.log("Error")
  };

  return (
    <div className={styles.eventForm}>
      {/* Event Input Form */}
      <form onSubmit={addEvent}>
        <input type="text" name="title" placeholder="Event Title" required />
        <input type="datetime-local" name="start" placeholder="Start Time" required />
        <input type="datetime-local" name="end" placeholder="End Time" required />
        <button type="submit">Add Event</button>
      </form>

      {/* Calendar Component */}
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
};

export default Calendar;
