import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc
} from "firebase/firestore";
import { db } from "../firebase";

export const fetchJournalEntries = async uid => {
    try {
        // Fetch all documents from the "messages" collection in Firestore
        const docRef = collection(db, "users", uid, "journal");
        const snapshot = await getDocs(docRef);
        // Map over the documents to extract data and add document IDs to each entry
        const entriesList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return entriesList;
    } catch (error) {
        console.error("Error fetching entries:", error); // Log any errors that occur during the fetch
        return [];
    }
};

export const addJournalEntry = async (
    uid,
    category,
    title,
    day,
    month,
    year,
    entry
) => {
    try {
        // console.log("Attempting to add document:", { user, category, title, day, month, year, entry });

        const docRef = collection(db, "users", uid, "journal");
        const newEntry = await addDoc(docRef, {
            category: category, // Store the category
            title: title, // Store the title of the entry
            day: day, // Store day value
            month: month, // Store month value
            year: year, // Store year value
            entry: entry // Store the journal entry text
        });

        await updateJournalCounts(uid, newEntry.id, 1); // update the journal count fields

        // console.log("Document written with ID: ", newEntry.id);
        return true;
    } catch (error) {
        console.error("Error adding document: ", error);
        return false;
    }
};

export const deleteJournalEntry = async (uid, docid) => {
    try {
        await updateJournalCounts(uid, docid, -1);
        await deleteDoc(doc(db, "users", uid, "journal", docid)); // Delete the document from Firestore
        console.log("Deleted entry: ", docid);
    } catch (error) {
        console.error("Error deleting entry:", error); // Log any errors that occur during deletion
    }
};

const updateJournalCounts = async (uid, docid, change) => {
    try {
        const userDocRef = doc(db, "users", uid);
        const journalEntryRef = doc(db, "users", uid, "journal", docid);

        const userDocSnap = await getDoc(userDocRef);
        const journalEntrySnap = await getDoc(journalEntryRef);

        if (!userDocSnap.exists() || !journalEntrySnap.exists()) {
            console.log(
                "User document or journal entry document does not exist!"
            );
            return;
        }

        const userData = userDocSnap.data();
        const journalData = journalEntrySnap.data();

        const currentJournalTotalCount = userData.journalTotalCount || 0;

        // determine the category count field based on the entry's category
        const categoryCountField =
            {
                "Shopping List": "journalShoppingListCount",
                "Spending Log": "journalSpendingLogCount",
                "Emotion": "journalEmotionCount",
                "To-Do List": "journalToDoListCount",
                "Other": "journalOtherCount"
            }[journalData.category] || null;

        // get the count for the passed entry's category 
        const currentCategoryCount = categoryCountField
            ? userData[categoryCountField] || 0
            : 0;

        // calculate new counts ensuring it doesn't go below 0
        const newJournalTotalCount = Math.max(
            currentJournalTotalCount + change,
            0
        );
        const newCategoryCount = Math.max(currentCategoryCount + change, 0);

        const updateData = {
            journalTotalCount: newJournalTotalCount
        };

        if (categoryCountField) {
            updateData[categoryCountField] = newCategoryCount;
        }

        await setDoc(userDocRef, updateData, { merge: true });

        console.log(`Journal total count updated to: ${newJournalTotalCount}`);
    } catch (error) {
        console.error("Error updating journal total: ", error);
    }
};

export const updateJournalEntry = async (uid, docid, change) => {
    try {
        const docRef = doc(db, "users", uid, "journal", docid);
        await updateDoc(docRef, { entry: change})
        return true;
    } catch (error) {
        console.error("Error updating journal entry: ", error);
        return false;
    }
};
