"use client";

import { auth, db } from "../Firebase/firebase"; // Import Firebase configuration
import React, { useState, useRef } from "react";
import { collection, addDoc } from "firebase/firestore"; // Import Firestore functions for interacting with the database.
import NavBar from "../NavBar/navbar"; // Import NavBar component
import "./newEntry.css"; // Import CSS styles specific to the New Entry component

// Function to add data to Firestore database
async function addDataToFireStore(category, title, day, month, year, entry) {
    const currentUser = auth.currentUser?.uid;

    try {
        // Add a new document to the "messages" collection in Firestore
        const docRef = await addDoc(collection(db, "messages"), {
            category: category, // Store the category
            title: title, // Store the title of the entry
            day: day, // Store day value
            month: month, // Store month value
            year: year, // Store year value
            entry: entry, // Store the journal entry text
            uid: currentUser
        });
        console.log("Document written with ID: ", docRef.id);
        return true; // Return true if document addition was successful
    } catch (error) {
        console.error("Error adding document: ", error);
        return false; // Return false if there was an error
    }
}

// Categories for the carousel
const categories = [
    { label: "Shopping List", imgSrc: "/shopping.jpg" },
    { label: "Spending Log", imgSrc: "/spending.jpg" },
    { label: "Emotion", imgSrc: "/emotions.jpg" },
    { label: "To-Do List", imgSrc: "/todolist.jpg" },
    { label: "Other", imgSrc: "/other.jpg" }
];

const NewEntry = () => {
    const [currentIndex, setCurrentIndex] = useState(0); // Track the carousel index
    const dayRef = useRef(); // Ref for day selection
    const monthRef = useRef(); // Ref for month selection
    const yearRef = useRef(); // Ref for year selection
    const titleRef = useRef(); // Ref for journal entry title input
    const entryRef = useRef(); // Ref for journal entry textarea

    const [selectedCategory, setSelectedCategory] = useState(""); // Track selected category
    const [showForm, setShowForm] = useState(false); // Track whether to show the form

    // Handle category selection and show the form
    const handleCategorySelect = category => {
        setSelectedCategory(category); // Set the selected category
        setShowForm(true); // Show the form after category selection
    };

    // Handle saving the journal entry
    const handleSave = async () => {
        const title = titleRef.current.value; // Get the title of the entry
        const day = Number(dayRef.current.value); // Convert day value to a number
        const month = monthRef.current.value; // Get month value as a string
        const year = Number(yearRef.current.value); // Convert year value to a number
        const entry = entryRef.current.value; // Get the journal entry text

        // Validate the date input
        if (
            (month === "Feb" && day > 29) ||
            (["Apr", "Jun", "Sep", "Nov"].includes(month) && day > 30)
        ) {
            alert("Please enter a valid date"); // Alert the user if the date is invalid
            return; // Exit the function if the date is invalid
        }

        // Call function to save entry to Firestore
        const success = await addDataToFireStore(
            selectedCategory,
            title,
            day,
            month,
            year,
            entry
        );

        if (success) {
            alert("Entry has been saved!"); // Notify user of successful save
        } else {
            alert("Failed to save entry. Please try again."); // Notify user of a failure
        }
    };

    // Navigate to the next carousel item
    const goToNext = () => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % categories.length);
    };

    // Navigate to the previous carousel item
    const goToPrev = () => {
        setCurrentIndex(
            prevIndex => (prevIndex - 1 + categories.length) % categories.length
        );
    };

    return (
        <>
            <NavBar /> {/* Include the NavBar */}
            <div className="new-entry-container">
                {!showForm ? ( // Show carousel if the form is not yet shown
                    <>
                        <h2 className="new-entry-header">
                            What is this entry about?
                        </h2>

                        {/* Custom carousel for category selection */}
                        <div className="carousel-container">
                            <button className="prevBtn" onClick={goToNext}>
                                &#10094;
                            </button>
                            <div className="carousel-slide">
                                {categories.map((category, index) => {
                                    // Define card class based on the current carousel index
                                    let cardClass = "category-card";
                                    if (index === currentIndex)
                                        cardClass += " center-card";
                                    else if (
                                        index ===
                                        (currentIndex - 1 + categories.length) %
                                            categories.length
                                    )
                                        cardClass += " left-card";
                                    else if (
                                        index ===
                                        (currentIndex + 1) % categories.length
                                    )
                                        cardClass += " right-card";
                                    else cardClass += " back-card";

                                    return (
                                        <div
                                            key={category.label}
                                            className={cardClass}
                                            onClick={() =>
                                                handleCategorySelect(
                                                    category.label
                                                )
                                            }
                                        >
                                            {category.imgSrc && (
                                                <img
                                                    src={category.imgSrc}
                                                    alt={category.label}
                                                />
                                            )}
                                            <div className="content">
                                                <span className="title">
                                                    {category.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button className="nextBtn" onClick={goToPrev}>
                                &#10095;
                            </button>
                        </div>
                    </>
                ) : (
                    // Show form once a category is selected
                    <>
                        <h2 className="new-entry-header">
                            New {selectedCategory} Entry
                        </h2>

                        {/* Container for date selectors */}
                        <div className="date-container">
                            <select ref={dayRef}>
                                {[...Array(31).keys()].map(i => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                            <select ref={monthRef}>
                                {[
                                    "Jan",
                                    "Feb",
                                    "Mar",
                                    "Apr",
                                    "May",
                                    "Jun",
                                    "Jul",
                                    "Aug",
                                    "Sep",
                                    "Oct",
                                    "Nov",
                                    "Dec"
                                ].map(month => (
                                    <option key={month} value={month}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                            <select ref={yearRef}>
                                {[2024, 2025, 2026, 2027, 2028].map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Input field for entering the title */}
                        <input
                            ref={titleRef}
                            type="text"
                            placeholder="Title"
                            className="title-input"
                        />

                        {/* Textarea for entering the journal entry text */}
                        <textarea
                            ref={entryRef}
                            placeholder="Type here..."
                            className="entry-textarea"
                        ></textarea>

                        {/* Container for the action buttons */}
                        <div className="button-container">
                            <button className="button" onClick={handleSave}>
                                Save Entry
                            </button>
                            <button
                                className="button"
                                onClick={() => setShowForm(false)}
                            >
                                Back
                            </button>{" "}
                            {/* Button to go back to the carousel */}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default NewEntry;
