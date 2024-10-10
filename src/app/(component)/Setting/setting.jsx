"use client";
import React, { useState, createContext } from "react";
import Link from "next/link";
import ReactSwitch from "react-switch";
import styles from "@/app/(component)/Setting/setting.module.css";
import { auth } from "../Firebase/firebase";
import {
    doPasswordChange,
    updateUsername
} from "@/app/(component)/Firebase/auth";

export const ThemeContext = createContext(null);

const Setting = () => {
    const [username, setNewUsername] = useState("");
    const [password, setPassword] = useState("");
    const user = auth.currentUser;
    const [theme, setTheme] = useState("dark");

    const toggleTheme = () => {
        setTheme(curr => (curr === "light" ? "dark" : "light"));
        console.log(theme);
    };

    const passSubmit = async () => {
        try {
            // Call the doPasswordChange function with the new password
            await doPasswordChange(password);
            alert("Password updated successfully!");
            setPassword("");
        } catch (error) {
            console.error("Error updating password:", error);
            alert("Failed to update password. Please try again.");
        }
    };

    const userSubmit = async () => {
        try {
            // Call the updateProfile function with the new username
            await updateUsername(username);
            alert("Username updated successfully!");
            setNewUsername("");
        } catch (error) {
            console.error("Error updating password:", error);
            alert("Failed to update username. Please try again.");
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <div className={styles["page-container"]} id={theme}>
                <div className={styles.all}>
                    <h1 className={styles.setting}>General Account Setting</h1>
                    <div className={styles.container}>
                        <div className={styles["label-input-container"]}>
                            <label>Email: {user.email}</label>
                        </div>
                        <div className={styles["label-input-container"]}>
                            <label>Username: {user.displayName}</label>
                        </div>

                        <div className={styles["label-input-container"]}>
                            <label>Username </label>
                            <input
                                className={styles.inputs}
                                type="text"
                                placeholder="username"
                                value={username}
                                onChange={e => setNewUsername(e.target.value)}
                            />
                            <button
                                className={styles.save}
                                onClick={userSubmit}
                            >
                                save{" "}
                            </button>
                        </div>

                        <div className={styles["label-input-container"]}>
                            <label>Password: </label>
                            <input
                                className={styles.inputs}
                                type="password"
                                placeholder="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button
                                className={styles.save}
                                onClick={passSubmit}
                            >
                                save{" "}
                            </button>
                        </div>
                        <div className={styles.switch}>
                            <label>
                                {" "}
                                {theme === "light" ? "Light Mode" : "Dark Mode"}
                            </label>
                            <ReactSwitch
                                onChange={toggleTheme}
                                checked={theme === "dark"}
                            />
                        </div>
                    </div>
                    <div className={styles.links}>
                        <p>
                            If you want to reset your Google account password,
                            visit{" "}
                            <Link href="https://myaccount.google.com/security">
                                <u>Google Account Security</u>
                            </Link>
                        </p>
                        <div className={styles.links}>
                            <a className={styles.back} href="/">
                                Back to Homepage
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </ThemeContext.Provider>
    );
};

export default Setting;
