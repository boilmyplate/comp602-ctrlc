"use client";

import styles from "@/app/(component)/Login/login.module.css";
import React, { useState } from "react";
import {
    doSignInWithEmailAndPassword,
    doSignInWithGoogle
} from "@/app/(component)/Firebase/auth";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/(context)/auth";
import Link from "next/link";

const Login = () => {
    // Set up state variables for email, password, sign-in status, and error messages
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    // useRouter for redirecting users
    const router = useRouter();

    // Function to handle form submission for email and password login
    const onSubmit = async e => {
        e.preventDefault();

        if (!isSigningIn) {
            // Prevent multiple login attempts
            setIsSigningIn(true);
            try {
                // Sign in using email and password
                await doSignInWithEmailAndPassword(email, password);
            } catch (error) {
                // Display error message on failure
                setErrorMessage(
                    "Incorrect email or password. Please try again!"
                );
                setIsSigningIn(false); // Reset signing-in state
            }
        }
    };

    // Function to handle sign-in with Google
    const onGoogleSignIn = async e => {
        e.preventDefault();

        if (!isSigningIn) {
            // Prevent multiple sign-in attempts
            setIsSigningIn(true);
            try {
                // Sign in using Google
                await doSignInWithGoogle();
            } catch (error) {
                // Display error message on failure
                setErrorMessage(
                    "Failed to sign in with Google. Please try again."
                );
                setIsSigningIn(false); // Reset signing-in state
            }
        }
    };

    return (
        <div className={styles.background}>
            <div className={styles.SignupContainer}>
                <div className={styles.textContainer}>
                    <h1 className={styles.title}>Welcome to Blank Web</h1>
                    <p className={styles.desc}>
                        Our app combines journaling and games to help you
                        unwind.
                    </p>
                    <p className={styles.desc}>
                        Find calm and balance in one place.
                    </p>
                    <div className={styles.socialIcons}>
                        {/* Add social media icons here */}
                    </div>
                </div>
                <div className={styles.FormContainer}>
                    <div>
                        <h3 className={styles.heading}>Login</h3>
                    </div>

                    {/* Display error message if there's any */}
                    {errorMessage && (
                        <div className={styles["error-message"]}>
                            {errorMessage}
                        </div>
                    )}

                    {/* Email Input */}
                    <div className={styles["label-input-container"]}>
                        <p className={styles.text}>Email</p>
                        <input
                            className={styles.inputs}
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)} // Updates email state
                        />
                    </div>

                    {/* Password Input */}
                    <div className={styles["label-input-container"]}>
                        <p className={styles.text}>Password</p>
                        <input
                            className={styles.inputs}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)} // Updates password state
                        />
                    </div>

                    {/* Sign In with Google Button */}
                    <div className={styles["label-input-container"]}>
                        <p className={styles.text}>Sign In With Google</p>
                        <button
                            className={styles["GoogleSignIn"]}
                            onClick={onGoogleSignIn} // Handles Google sign-in
                        >
                            <img
                                src="google.svg"
                                alt="Google"
                                className={styles.googleicon}
                            />
                            Sign In With Google
                        </button>
                    </div>

                    {/* Login Button */}
                    <button
                        className={styles.SignupButton}
                        onClick={onSubmit}
                        disabled={isSigningIn}
                    >
                        Login
                    </button>

                    {/* Links for password reset and signup */}
                    <div className={styles.links}>
                        <Link
                            href="/resetpass"
                            className={styles["forgot-password"]}
                        >
                            Forgot password?
                        </Link>
                        <br></br>
                        <Link href="/signup" className={styles.signup}>
                            Can't login? Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
