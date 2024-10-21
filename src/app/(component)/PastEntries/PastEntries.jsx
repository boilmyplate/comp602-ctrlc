"use client"; // Enable client-side rendering for this component

// Import the Firestore configuration from the firebaseConfig file.
import { auth, db } from "../Firebase/firebase";
// Import CSS styles specific to the PastEntries component.
import styles from "@/app/(component)/PastEntries/PastEntries.module.css";
// Import Firestore functions to interact with the database.
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where
} from "firebase/firestore";
// Import React and hooks for state management and side effects.
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    deleteJournalEntry,
    fetchJournalEntries,
    updateJournalEntry
} from "../Firebase/firestore/journalDB";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const PastEntries = () => {
    const [entries, setEntries] = useState([]); // State to hold the list of journal entries.
    const [filteredEntries, setFilteredEntries] = useState([]); // State to hold filtered search results
    const [value, setValue] = useState(""); // State for input value
    const [showDropdown, setShowDropdown] = useState(false); // State to track dropdown visibility
    const [isViewing, setIsViewing] = useState(false);
    const [toChange, setToChange] = useState(null);
    const user = auth.currentUser?.uid;

    // Fetch entries from Firestore when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            const fetchedJournalEntries = await fetchJournalEntries(user);
            setEntries(fetchedJournalEntries); // Update the state with the list of entries
            setFilteredEntries(fetchedJournalEntries); // Initially, display all entries
        };

        fetchData(); // Call the fetch function when the component loads
    }, [user]); // Empty dependency array ensures this runs only once on mount

    // Update entry content in state and Firestore
    const updateEntry = async (user, docid, change) => {
        // Update the entry's content in the state
        setFilteredEntries(
            filteredEntries.map(
                entry =>
                    entry.id === docid ? { ...entry, entry: change } : entry // Update the entry's content with the new value
            )
        );

        const success = updateJournalEntry(user, docid, change);
        if (success) {
            alert("Successfully updated entry!");
        } else if (!success) {
            alert("Error updating entry!")
        }
    };

    // Delete an entry from state and Firestore
    const deleteEntry = async (uid, docid) => {
        if (!window.confirm("Are you sure you want to delete this entry?"))
            return; // Confirm the deletion with the user
        setFilteredEntries(filteredEntries.filter(entry => entry.id !== docid)); // Filter out the deleted entry
        await deleteJournalEntry(uid, docid); // Delete the document from Firestore
    };

    // Handle the search input changes and filter dynamically
    const onChange = event => {
        const searchTerm = event.target.value;
        setValue(searchTerm); // Set the input value based on user typing

        if (searchTerm.trim() !== "") {
            const filtered = entries.filter(
                entry =>
                    entry.title &&
                    entry.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredEntries(filtered); // Update filtered entries based on user input
            setShowDropdown(true); // Show the dropdown with suggestions
        } else {
            setFilteredEntries(entries); // Show all entries if input is cleared
            setShowDropdown(false); // Hide the dropdown when input is cleared
        }
    };

    // Handle selection of a dropdown option
    const onSelectSuggestion = suggestion => {
        setValue(suggestion.entry); // Set input value to selected suggestion
        setFilteredEntries([suggestion]); // Filter to the selected suggestion
        setShowDropdown(false); // Hide the dropdown after selection
    };

    // Share entry content with date, title, and category
    const shareEntry = (entryDate, title, category, entryContent) => {
        const contentToShare = `Category: ${category}\nTitle: ${title}\nDate: ${entryDate}\n\n${entryContent}`; // Combine date, title, category, and entry content

        if (navigator.share) {
            // If Web Share API is supported
            navigator
                .share({
                    title: "Journal Entry",
                    text: contentToShare
                })
                .then(() => console.log("Entry shared successfully!"))
                .catch(error => console.error("Error sharing entry:", error));
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard
                .writeText(contentToShare)
                .then(() => alert("Entry copied to clipboard!"))
                .catch(error =>
                    console.error("Error copying to clipboard:", error)
                );
        }
    };

    return (
        <div className={styles.background}>
            <div className={styles["past-entries-container"]}>
                <h1>Past Entries</h1>
                <div className={styles["display-container"]}>
                    {/* Input field for search */}
                    <div className={styles["search-container"]}>
                        <div
                            className={styles["search-container-withoutInput"]}
                        >
                            <input
                                type="text"
                                value={value}
                                onChange={onChange}
                                placeholder="Search entries..."
                                className={styles.searchInput}
                            />
                            <button
                                onClick={() => setShowDropdown(false)}
                                className={styles.searchButton}
                            >
                                Search
                            </button>
                        </div>
                        {/* Dropdown for search suggestions */}
                        {showDropdown && filteredEntries.length > 0 && (
                            <div className={styles.dropdown}>
                                {filteredEntries.map(entry => (
                                    <div
                                        key={entry.id}
                                        onClick={() =>
                                            onSelectSuggestion(entry)
                                        } // Handle selection from dropdown
                                        className={styles.dropdownItem}
                                    >
                                        {entry.title}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Displaying the list of filtered entries */}
                    {filteredEntries.map(entry => (
                        <>
                            {isViewing && toChange && (
                                <div
                                    className={
                                        styles["viewing-entry-container"]
                                    }
                                >
                                    <i
                                        className={
                                            styles["viewing-entry-closebtn"]
                                        }
                                        onClick={() => {setIsViewing(false), setToChange(null), console.log("EDITING ENTRY SET TO: ", toChange)}}
                                    >
                                        <FontAwesomeIcon icon={faXmark} />
                                    </i>
                                    <div
                                        className={
                                            styles["viewing-entry-wrapper"]
                                        }
                                    >
                                        <h2>{toChange.title}</h2>
                                        <p>
                                            Date: {toChange.day} {toChange.month},{" "}
                                            {toChange.year}
                                        </p>
                                        <textarea
                                            name="entry content"
                                            value={toChange.entry}
                                            onChange={(e) =>
                                                setToChange({
                                                    ...toChange,
                                                    entry: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                    <div
                                        className={
                                            styles["viewing-entry-buttons"]
                                        }
                                    >
                                        <button className={styles.button} onClick={() => updateEntry(user, toChange.id, toChange.entry)}>Save</button>
                                        <button
                                            className={styles.button}
                                            onClick={() =>
                                                deleteEntry(user, entry.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                        <button
                                            className={styles.button}
                                            onClick={() =>
                                                shareEntry(
                                                    `${entry.day} ${entry.month}, ${entry.year}`,
                                                    entry.title ||
                                                        "Untitled Entry",
                                                    entry.tags
                                                        ? entry.tags.join(", ")
                                                        : "No Tags",
                                                    entry.entry
                                                )
                                            } // Share entry logic
                                        >
                                            Share
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div
                                key={entry.id}
                                className={`${styles["entry-item"]} ${
                                    isViewing ? styles.viewing : ""
                                }`}
                                onClick={() => {setIsViewing(true), setToChange(entry), console.log("EDITING ENTRY: ", entry)}}
                            >
                                {/* Display Title */}
                                <h3>{entry.title || "Untitled Entry"}</h3>
                                <div className={styles.dateNTags}>
                                    {/* Display Date */}
                                    <p>
                                        Date: {entry.day} {entry.month}, {entry.year}
                                    </p>
                                    {/* Display Tags */}
                                    <div className={styles.tags}>
                                        {entry.category ? (
                                            <span className={styles.tag}>
                                                #{entry.category}
                                            </span> // Use the entry's category as the tag
                                        ) : (
                                            <span className={styles.tag}>
                                                #NoCategory
                                            </span> // Default tag if no category is provided
                                        )}
                                    </div>
                                </div>
                                {/* Action Buttons */}
                                <div className={styles["button-group"]}>
                                    <button
                                        className={styles.button}
                                        onClick={() =>
                                            deleteEntry(user, entry.id)
                                        }
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className={styles.button}
                                        onClick={() =>
                                            shareEntry(
                                                `${entry.day} ${entry.month}, ${entry.year}`,
                                                entry.title || "Untitled Entry",
                                                entry.tags
                                                    ? entry.tags.join(", ")
                                                    : "No Tags",
                                                entry.entry
                                            )
                                        } // Share entry logic
                                    >
                                        Share
                                    </button>
                                </div>
                            </div>
                        </>
                    ))}
                </div>
                <Link href="/journal">
                    <button className={styles.button}>Back to Journal</button>
                </Link>
            </div>
        </div>
    );
};

export default PastEntries;
