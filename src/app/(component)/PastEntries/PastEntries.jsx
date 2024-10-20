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
  where,
} from "firebase/firestore";
// Import React and hooks for state management and side effects.
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { deleteJournalEntry, fetchJournalEntries } from "../Firebase/firestore/journalDB";

const PastEntries = () => {
  const [entries, setEntries] = useState([]); // State to hold the list of journal entries.
  const [filteredEntries, setFilteredEntries] = useState([]); // State to hold filtered search results
  const [value, setValue] = useState(''); // State for input value
  const [showDropdown, setShowDropdown] = useState(false); // State to track dropdown visibility
  const user = auth.currentUser?.uid;

  // Fetch entries from Firestore when the component mounts
  useEffect(() => {
    const fetchData = async () => {
        const fetchedJournalEntries = await fetchJournalEntries(user);
        setEntries(fetchedJournalEntries); // Update the state with the list of entries
        setFilteredEntries(fetchedJournalEntries); // Initially, display all entries
    };

    fetchData(); // Call the fetch function when the component loads
  }, []); // Empty dependency array ensures this runs only once on mount

  // Toggle edit mode for a specific entry
  const toggleEdit = (id) => {
    setEntries(
      entries.map(
        (entry) =>
          entry.id === id ? { ...entry, isEditing: !entry.isEditing } : entry // Toggle isEditing flag for the selected entry
      )
    );
  };

  // Update entry content in state and Firestore
  const updateEntry = async (id, newContent) => {
    // Update the entry's content in the state
    setEntries(
      entries.map(
        (entry) => (entry.id === id ? { ...entry, entry: newContent } : entry) // Update the entry's content with the new value
      )
    );

    // Update the content in Firestore
    try {
      await updateDoc(doc(db, "messages", id), { entry: newContent }); // Update the document in Firestore
    } catch (error) {
      console.error("Error updating entry:", error); // Log any errors that occur during the update
    }
  };

  // Delete an entry from state and Firestore
  const deleteEntry = async (uid, docid) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return; // Confirm the deletion with the user
    setFilteredEntries(filteredEntries.filter((entry) => entry.id !== docid)); // Filter out the deleted entry
    await deleteJournalEntry(uid, docid); // Delete the document from Firestore
  };

  // Handle the search input changes and filter dynamically
  const onChange = (event) => {
    const searchTerm = event.target.value;
    setValue(searchTerm); // Set the input value based on user typing

    if (searchTerm.trim() !== "") {
      const filtered = entries.filter((entry) =>
        entry.title && entry.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEntries(filtered); // Update filtered entries based on user input
      setShowDropdown(true); // Show the dropdown with suggestions
    } else {
      setFilteredEntries(entries); // Show all entries if input is cleared
      setShowDropdown(false); // Hide the dropdown when input is cleared
    }
  };

  // Handle selection of a dropdown option
  const onSelectSuggestion = (suggestion) => {
    setValue(suggestion.entry); // Set input value to selected suggestion
    setFilteredEntries([suggestion]); // Filter to the selected suggestion
    setShowDropdown(false); // Hide the dropdown after selection
  };

  // Share entry content with date, title, and category
  const shareEntry = (entryDate, title, category, entryContent) => {
    const contentToShare = `Category: ${category}\nTitle: ${title}\nDate: ${entryDate}\n\n${entryContent}`; // Combine date, title, category, and entry content

    if (navigator.share) {
      // If Web Share API is supported
      navigator.share({
        title: 'Journal Entry',
        text: contentToShare,
      })
      .then(() => console.log('Entry shared successfully!'))
      .catch((error) => console.error('Error sharing entry:', error));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(contentToShare)
        .then(() => alert('Entry copied to clipboard!'))
        .catch((error) => console.error('Error copying to clipboard:', error));
    }
  };

  return (
    <div className={styles.background}>
      <div className={styles["past-entries-container"]}>
        <h1>Past Entries</h1>
        <div className={styles["display-container"]}>
          {/* Input field for search */}
          <div className={styles["search-container"]}>
            <div className={styles["search-container-withoutInput"]}>
              <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder="Search entries..."
                className={styles.searchInput}
              />
              <button onClick={() => setShowDropdown(false)} className={styles.searchButton}>
                Search
              </button>
            </div>
            {/* Dropdown for search suggestions */}
          {showDropdown && filteredEntries.length > 0 && (
            <div className={styles.dropdown}>
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => onSelectSuggestion(entry)} // Handle selection from dropdown
                  className={styles.dropdownItem}
                >
                  {entry.title}
                </div>
              ))}
            </div>
          )}
          </div>

          {/* Displaying the list of filtered entries */}
          {filteredEntries.map((entry) => (
          <div key={entry.id} className={styles["entry-item"]}>
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
                    <span className={styles.tag}>#{entry.category}</span> // Use the entry's category as the tag
                  ) : (
                    <span className={styles.tag}>#NoCategory</span> // Default tag if no category is provided
                  )}
                </div>
            </div>
            {/* Action Buttons */}
            <div className={styles["button-group"]}>
              <button
                className={styles.button}
                onClick={() => toggleEdit(entry.id)}
              >
                {entry.isEditing ? "Save" : "Edit"}
              </button>
              <button
                className={styles.button}
                onClick={() => deleteEntry(user, entry.id)}
              >
                Delete
              </button>
              <button
                className={styles.button}
                onClick={() =>
                  shareEntry(
                    `${entry.day} ${entry.month}, ${entry.year}`,
                    entry.title || "Untitled Entry",
                    entry.tags ? entry.tags.join(", ") : "No Tags",
                    entry.entry
                  )
                } // Share entry logic
              >
                Share
              </button>
            </div>
          </div>
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
