"use client";

import React, { useState } from "react";
import styles from "@/app/(component)/ResetPass/resetpass.module.css";
import { doPasswordReset } from "@/app/(component)/Firebase/auth";

const Reset = () => {
	const [isValidEmail, setIsValidEmail] = useState(false);
	const [email, setEmail] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	// const EmailFormat = (email) => {
	//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	//   return emailRegex.test(email);
	// };

	const onSubmit = async (e) => {
		e.preventDefault(); // Prevent page reload on form submit

		// check if the email is valid
		if (!isValidEmail) {
			setIsValidEmail(true); // set the email as invalid
			setErrorMessage("Please enter a valid email address."); // display error message for invalid email
			return; // if email is invalid, funtion stopped
		}

		// if email valid, continue processing
		try {
			await doPasswordReset(email); // attemp to send email request
			setSuccessMessage(
				"Instructions to reset your password have been sent to your email."
			);
		} catch (error) {
			setErrorMessage("Failed to reset password. Please try again.");
		}
		setIsValidEmail(false); // reset the email validity to false after error
	};

	return (
		<div className={styles.background}>
			<div>
				<title>Reset Password</title>
			</div>

			<div className={styles.WhiteBox}>
				<h1>Reset Password</h1>
				<p className={styles.para}>
					Please enter your email address and we'll send you
					instructions to reset your password.
				</p>

				{/* Error Message Display */}
				{errorMessage && (
					<div className={styles["error-message"]}>
						{errorMessage}
					</div>
				)}

				{/* Success Message Display */}
				{successMessage && (
					<div className={styles["success-message"]}>
						{successMessage}
					</div>
				)}

				<input
					className={styles.inputs}
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)} // update email state when typing
				/>
				{/* submit button after user entered their email */}
				<button className={styles.SubmitButton} onClick={onSubmit}>
					Submit
				</button>

				<div className={styles.links}>
					<a href="/">Back to login</a>
				</div>
			</div>
		</div>
	);
};

export default Reset;
