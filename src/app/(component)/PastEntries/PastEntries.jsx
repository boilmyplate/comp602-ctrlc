"use client";

import { auth } from "../Firebase/firebase";
import styles from "@/app/(component)/PastEntries/PastEntries.module.css";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    deleteJournalEntry,
    fetchJournalEntries,
    updateJournalEntry
} from "../Firebase/firestore/journalDB";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const PastEntries = () => {
    const [entries, setEntries] = useState([]); // State to hold filtered search results
    const [value, setValue] = useState(""); // State for input value
    const [showDropdown, setShowDropdown] = useState(false); // State to track dropdown visibility
    const [isViewing, setIsViewing] = useState(false);
    const [change, setChange] = useState("");
    const toChangeRef = useRef(null);
    const entryRef = useRef(null);
    const user = auth.currentUser?.uid;

    // Fetch entries from Firestore when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            entryRef.current = await fetchJournalEntries(user);
            setEntries(entryRef.current); // Update the state with the list of entries
        };

        fetchData(); // Call the fetch function when the component loads
    }, [user]); // Empty dependency array ensures this runs only once on mount

    // Update entry content in state and Firestore
    const updateEntry = async (user, docid, change) => {
        const fallback = entryRef.current;
        entryRef.current = entryRef.current.map(e =>
            e.id === docid ? { ...e, entry: change } : e
        );

        try {
            setEntries([...entryRef.current]);
            const success = await updateJournalEntry(user, docid, change);
            if (success) alert("Successfully updated entry!");
        } catch (error) {
            console.error("Error updating entry: ", error);
            alert("Error updating entry!");
            setEntries(fallback);
            entryRef.current = fallback;
        }
    };

    // delete entry from state and firestore
    const deleteEntry = async (uid, docid) => {
        if (!window.confirm("Are you sure you want to delete this entry?"))
            return;

        entryRef.current = entryRef.current.filter(e => e.id !== docid);

        try {
            await deleteJournalEntry(uid, docid);
            setEntries(entryRef.current);
        } catch (error) {
            console.error("Error deleting entry", error);
        }
    };

    // Handle the search input changes and filter dynamically
    const onChange = event => {
        const searchTerm = event.target.value;
        setValue(searchTerm); // Set the input value based on user typing

        if (searchTerm.trim() !== "") {
            const filtered = entryRef.current.filter(
                entry =>
                    entry.title &&
                    entry.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setEntries(filtered); // Update filtered entries based on user input
            setShowDropdown(true); // Show the dropdown with suggestions
        } else {
            setEntries(entryRef.current); // Show all entries if input is cleared
            setShowDropdown(false); // Hide the dropdown when input is cleared
        }
    };

    // Handle selection of a dropdown option
    const onSelectSuggestion = suggestion => {
        setValue(suggestion.entry); // Set input value to selected suggestion
        setEntries([suggestion]); // Filter to the selected suggestion
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

    const handleClick = e => {
        toChangeRef.current = e;
        setChange(e.entry);
        setIsViewing(true);
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
                        {showDropdown && entries.length > 0 && (
                            <div className={styles.dropdown}>
                                {entries.map(entry => (
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
                    {entries.map(entry => (
                        <>
                            {isViewing && toChangeRef.current && (
                                <div
                                    className={
                                        styles["viewing-entry-container"]
                                    }
                                >
                                    <i
                                        className={
                                            styles["viewing-entry-closebtn"]
                                        }
                                        onClick={() => setIsViewing(false)}
                                    >
                                        <FontAwesomeIcon icon={faXmark} />
                                    </i>
                                    <div
                                        className={
                                            styles["viewing-entry-wrapper"]
                                        }
                                    >
                                        <h2>{entry.title}</h2>
                                        <p>
                                            Date: {entry.day} {entry.month},{" "}
                                            {entry.year}
                                        </p>
                                        <textarea
                                            name="entry content"
                                            value={change}
                                            onChange={e =>
                                                setChange(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div
                                        className={
                                            styles["viewing-entry-buttons"]
                                        }
                                    >
                                        <button
                                            className={styles.button}
                                            onClick={() =>
                                                updateEntry(
                                                    user,
                                                    entry.id,
                                                    change
                                                )
                                            }
                                        >
                                            Save
                                        </button>
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
                                onClick={() => handleClick(entry)}
                            >
                                {/* Display Title */}
                                <h3>{entry.title || "Untitled Entry"}</h3>
                                <div className={styles.dateNTags}>
                                    {/* Display Date */}
                                    <p>
                                        Date: {entry.day} {entry.month},{" "}
                                        {entry.year}
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
                                        onClick={e => {
                                            e.stopPropagation();
                                            deleteEntry(user, entry.id);
                                        }}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className={styles.button}
                                        onClick={e => {
                                            e.stopPropagation();
                                            shareEntry(
                                                `${entry.day} ${entry.month}, ${entry.year}`,
                                                entry.title || "Untitled Entry",
                                                entry.tags
                                                    ? entry.tags.join(", ")
                                                    : "No Tags",
                                                entry.entry
                                            );
                                        }} // Share entry logic
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
