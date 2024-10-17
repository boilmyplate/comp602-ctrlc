import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// Function to save score to Firestore only if it's higher than the existing score
export const saveScore = async (uid, gameType, newScore, displayName) => {
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
          await setDoc(docRef, { score: newScore, uid, gameType, displayName }, { merge: true });
          console.log(`Score updated successfully for user ${uid} in game ${gameType}`);
        } else {
          console.log(`No update needed. Current score: ${currentScore} is higher or equal to new score: ${newScore}`);
        }
      } else {
        // If no existing score, set the initial score
        console.log("No existing score found, setting initial score.");
        await setDoc(docRef, { score: newScore, uid, gameType, displayName }, { merge: true });
        console.log(`Score set for the first time for user ${uid} in game ${gameType}`);
      }
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };
  