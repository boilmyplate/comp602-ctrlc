import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// Function to save score to Firestore only if it's higher than the existing score
export const saveHighScore = async (uid, gameType, newScore, displayName) => {
   try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const currentScore = parseInt(docSnap.data()[gameType], 10) || 0;
            console.log(`Current score in Firestore: ${currentScore}`);

            // Only update if the new score is higher than the current score
            if (newScore > currentScore) {
                await setDoc(
                    docRef,
                    { [gameType]: newScore, displayName: displayName },
                    { merge: true }
                );
                console.log(`Score updated successfully in game ${gameType}`);
            } else {
                console.log(
                    `No update needed. Current score: ${currentScore} is higher or equal to new score: ${newScore}`
                );
            }
        } else {
            // If no existing score, set the initial score
            console.log("No existing score found, setting initial score.");
            await setDoc(
                docRef,
                { [gameType]: newScore, displayName: displayName },
                { merge: true }
            );
            console.log(`Score set for the first time for ${gameType}`);
        }
    } catch (error) {
        console.error("Error saving score:", error);
    }
};

export const fetchHighScore = async (uid, gameType) => {
    const docRef = doc(db, "users", uid);
    try {
        const docSnap = await getDoc(docRef);
        const bestScore = parseInt(docSnap.data()[gameType], 10) || 0;
        return bestScore;
    } catch (error) {
        console.error("Error fetching highscore: ", error);
    }
    
    return 0;
};

export const saveGlobalHighScore = async (uid, gameType) => {
    return null;
};

export const fetchGlobalHighScore = async () => {
    return null;
};
