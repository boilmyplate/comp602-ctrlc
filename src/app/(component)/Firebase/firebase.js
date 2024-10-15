import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to save score to Firestore only if it's higher than the existing score
const saveScore = async (uid, gameType, newScore) => {
  if (!uid) {
    console.error("No user ID provided, cannot save score.");
    return;
  }

  try {
    const docRef = doc(db, 'scores', `${uid}_${gameType}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentScore = parseInt(docSnap.data().score, 10) || 0;
      console.log(`Current score in Firestore: ${currentScore}`);

      // Only update if the new score is higher than the current score
      if (newScore > currentScore) {
        console.log(`Updating score: ${newScore} for user: ${uid} in game: ${gameType}`);
        await setDoc(docRef, { score: newScore, uid, gameType }, { merge: true });
        console.log(`Score updated successfully for user ${uid} in game ${gameType}`);
      } else {
        console.log(`No update needed. Current score: ${currentScore} is higher or equal to new score: ${newScore}`);
      }
    } else {
      // If no existing score, set the initial score
      console.log("No existing score found, setting initial score.");
      await setDoc(docRef, { score: newScore, uid, gameType }, { merge: true });
      console.log(`Score set for the first time for user ${uid} in game ${gameType}`);
    }
  } catch (error) {
    console.error("Error saving score:", error);
  }
};

export { app, auth, db, saveScore };
