"use client"; // Enable client-side rendering for this component

// Import the Firestore configuration from the firebaseConfig file.
import { db } from "../Firebase/firebase";
// Import CSS styles specific to the PastEntries component.
import styles from "@/app/(component)/PastEntries/past-entries.module.css";
// Import Firestore functions to interact with the database.
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
// Import React and hooks for state management and side effects.
import React, { useState, useEffect } from "react";
import Link from 'next/link';


const PastEntries = () => {
  const [entries, setEntries] = useState([]); // State to hold the list of journal entries.

  // Fetch entries from Firestore when the component mounts
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        // Fetch all documents from the "messages" collection in Firestore
        const snapshot = await getDocs(collection(db, "messages"));
        // Map over the documents to extract data and add document IDs to each entry
        const entriesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEntries(entriesList); // Update the state with the list of entries
      } catch (error) {
        console.error("Error fetching entries:", error); // Log any errors that occur during the fetch
      }
    };

    fetchEntries(); // Call the fetch function when the component loads
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
  const deleteEntry = async (id) => {
    // Confirm the deletion with the user
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    // Remove the entry from the state
    setEntries(entries.filter((entry) => entry.id !== id)); // Filter out the deleted entry

    // Delete the entry from Firestore
    try {
      await deleteDoc(doc(db, "messages", id)); // Delete the document from Firestore
    } catch (error) {
      console.error("Error deleting entry:", error); // Log any errors that occur during deletion
    }
  };

  return (
    <div className={styles.background}>
      <div className={styles["past-entries-container"]}>
        {" "}
        {/* Main container for the past entries */}
        <h1>Past Entries</h1> {/* Header for the past entries page */}
        <div className={styles["display-container"]}>
          {" "}
          {/* Container for displaying the list of entries */}
          {entries.map(
            (
              entry // Map over each entry to display it
            ) => (
              <div key={entry.id} className={styles["entry-item"]}>
                {" "}
                {/* Key is set to the unique entry ID */}
                <p>
                  Date: {entry.day} {entry.month}, {entry.year}
                </p>{" "}
                {/* Display the date of the entry */}
                {entry.isEditing ? ( // Check if the entry is in editing mode
                  <textarea
                    value={entry.entry}
                    onChange={(e) => updateEntry(entry.id, e.target.value)} // Update the entry content on change
                  />
                ) : (
                  <p>{entry.entry}</p> // Display the entry content if not in editing mode
                )}
                <button
                  className={styles.button}
                  onClick={() => toggleEdit(entry.id)}
                >
                  {entry.isEditing ? "Save" : "Edit"}
                </button>{" "}
                {/* Button to toggle edit/save */}
                <button
                  className={styles.button}
                  onClick={() => deleteEntry(entry.id)}
                >
                  Delete
                </button>{" "}
                {/* Button to delete the entry */}
              </div>
            )
          )}
        </div>
        <Link href="/journalWelcome">
          {" "}
          {/* Link back to the Journal page */}
          <button className={styles.button}>Back to Journal</button>
        </Link>
      </div>
    </div>
  );
};

export default PastEntries; // Export the PastEntries component as the default export
