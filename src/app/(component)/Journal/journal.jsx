"use client"; // This directive is specific to Next.js and enables client-side rendering for this component.


import { db } from "../Firebase/firebase"; // Import Firebase configuration
import React, { useRef } from "react"; // Import React hooks
import { collection, addDoc } from "firebase/firestore"; // Import Firestore functions for interacting with the database
import styles from "@/app/(component)/Journal/journal.module.css"; // Import CSS styles specific to the Journal component
import { useAuth } from "@/app/(context)/auth"; // Import authentication context
import { useRouter } from "next/navigation"; // Import Next.js navigation
import { auth } from "../Firebase/firebase"; // Firebase auth import

// Function to add data to Firestore database
async function addDataToFireStore(day, month, year, entry) {
    try {
        console.log("Attempting to add document:", { day, month, year, entry });

        const docRef = await addDoc(collection(db, "messages"), {
            day: day, // Store day value
            month: month, // Store month value
            year: year, // Store year value
            entry: entry, // Store the journal entry text
        });

        console.log("Document written with ID: ", docRef.id);
        return true;
    } catch (error) {
        console.error("Error adding document: ", error);
        return false;
    }
}

const Journal = () => {
    const dayRef = useRef(); // Ref for day selection
    const monthRef = useRef(); // Ref for month selection
    const yearRef = useRef(); // Ref for year selection
    const entryRef = useRef(); // Ref for journal entry textarea
    const { userLoggedIn } = useAuth(); // Authentication hook
    const router = useRouter(); // Next.js router

    // Function to handle saving the journal entry
    const handleSave = async () => {
        const day = Number(dayRef.current.value);
        const month = monthRef.current.value;
        const year = Number(yearRef.current.value);
        const entry = entryRef.current.value;

        if (
            (month === "Feb" && day > 29) ||
            (["Apr", "Jun", "Sep", "Nov"].includes(month) && day > 30)
        ) {
            alert("Please enter a valid date");
            return;
        }

        const success = await addDataToFireStore(day, month, year, entry);

        if (success) {
            alert("Entry has been saved!");
        } else {
            alert("Failed to save entry. Please try again.");
        }
    };

    return (
        <div className={styles.background}>
            {!userLoggedIn && router.push("/")} {/* Redirect to home if not logged in */}
            
            {/*
            <p className={styles["journal-description"]}>
                Please use this space to express your feelings, successes, or simply jot down the little things that bring you joy. 
                Start off by entering the date and use this as an opportunity to pause, breathe, and be honest with yourself—no matter 
                what you’re going through.
            </p>
            */}
            {/* Journal Container */}
            <div className={styles["journal-container"]}>
                {/* Left container: Date Selector and Buttons */}
                <div className={styles["left-container"]}>
                    <div className={styles["date-container"]}>
                        <select ref={dayRef}>
                            {[...Array(31).keys()].map((i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                </option>
                            ))}
                        </select>

                        <select ref={monthRef}>
                            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                                (month) => (
                                    <option key={month} value={month}>
                                        {month}
                                    </option>
                                )
                            )}
                        </select>

                        <select ref={yearRef}>
                            {[2024, 2025, 2026, 2027, 2028].map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles["button-container"]}>
                        <a href="/past-entries">
                            <button className={styles.button}>Past Entries</button>
                        </a>
                        <button className={styles.button} onClick={handleSave}>
                            Save
                        </button>
                        <a href="/home">
                            <button className={styles.button}>Back to Homepage</button>
                        </a>
                    </div>
                </div>

                {/* Right container: Journal Entry Textarea */}
                <div className={styles["right-container"]}>
				<h2 className={styles["journal-header"]}>My Daily Journal</h2>
                    <textarea
                        className={styles.texts}
                        ref={entryRef}
                        placeholder="Type here..."
                    ></textarea>
                </div>
            </div>
        </div>
    );

};

export default Journal;
