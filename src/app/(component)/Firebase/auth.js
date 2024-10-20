import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    updatePassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
    signOut
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const doCreateUserWithEmailAndPassword = async (
    username,
    email,
    password
) => {
    try {
        // Create the user with email and password
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;
        await updateProfile(auth.currentUser, { displayName: username });
        // Send verification email to the new user
        await sendEmailVerification(user);

        checkUserDB();
        return user; // Return the user object
    } catch (error) {
        console.error("Error creating user: ", error);
        throw error; // Rethrow error to handle it in the component
    }
};

export const updateUsername = async username => {
    await updateProfile(auth.currentUser, { displayName: username });
};

// using their email and password to sign in
export const doSignInWithEmailAndPassword = async (email, password) => {
    const login = await signInWithEmailAndPassword(auth, email, password);
    checkUserDB();
    return login;
};

// using Google to sign in
export const doSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user; // return the authenticated user
    } catch (error) {
        console.error("Error signing in with Google: ", error);
        throw error; // rethrow the error to handle it in the component
    }
};

const checkUserDB = async () => {
    const user = auth.currentUser;
    if (user) {
        console.log("User is logged in.");
        const userRef = doc(db, "users", user.uid);
        try {
            const userSnapshot = await getDoc(userRef);

            if (!userSnapshot.exists()) {
                // If the user document doesn't exist, add them to the userDB
                await setDoc(userRef, {
                    displayName: user.displayName,
                    email: user.email,
                    penguinScore: 0,
                    "2048Score": 0,
                    journalTotalCount: 0,
                    journalShoppingListCount: 0,
                    journalSpendingLogCount: 0,
                    journalEmotionCount: 0,
                    journalToDoListCount: 0,
                    journalOtherCount: 0
                });
                console.log("User added to userDB successfully.");
            }
        } catch (error) {
            console.error("Error adding user: ", error);
        }
    } else {
        console.log("User is not logged in.");
    }
};

export const doSignOut = async () => {
    try {
        await signOut(auth);
    } catch (e) {
        console.error(e);
    }
};
// before they log into their account
export const doPasswordReset = email => {
    return sendPasswordResetEmail(auth, email);
};
// after they have logged in but wanting to change their password
export const doPasswordChange = password => {
    return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = () => {
    return sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/`
    });
};
