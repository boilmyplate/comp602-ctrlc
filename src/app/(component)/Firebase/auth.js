import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	sendPasswordResetEmail,
	sendEmailVerification,
	updatePassword,
	signInWithPopup,
	GoogleAuthProvider,
	updateProfile,
	signOut,
} from "firebase/auth";
import { auth } from "./firebase";

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

		return user; // Return the user object
	} catch (error) {
		console.error("Error creating user: ", error);
		throw error; // Rethrow error to handle it in the component
	}
};

export const updateUsername = async(username) => {
	await updateProfile(auth.currentUser, { displayName: username });
}

// using their email and password to sign in
export const doSignInWithEmailAndPassword = async (email, password) => {
	return signInWithEmailAndPassword(auth, email, password);
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

export const doSignOut = async () => {
	try {
		await signOut(auth);
	} catch (e) {
		console.error(e);
	}
};
// before they log into their account
export const doPasswordReset = (email) => {
	return sendPasswordResetEmail(auth, email);
};
// after they have logged in but wanting to change their password
export const doPasswordChange = (password) => {
	return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = () => {
	return sendEmailVerification(auth.currentUser, {
		url: `${window.location.origin}/home`,
	});
};
