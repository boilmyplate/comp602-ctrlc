"use client";
import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import ReactSwitch from "react-switch";
import styles from "./Setting.module.css";
import { auth } from "../Firebase/firebase";
import { doPasswordChange, updateUsername } from "../Firebase/auth";
import { ThemeContext } from '../ThemeProvider/themeProvider'; 

const Setting = () => {
  // variables for username, password, theme, and current user
  const [username, setNewUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  // const user = auth.currentUser;
  
  // Consume the global theme context
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);


  //allow user to change password 
  const passSubmit = async () => {
    try {
      // call the doPasswordChange function with the new password
      await doPasswordChange(password);
      // alert user when password have been updated
      alert("Password updated successfully!"); 
      setPassword(""); // clear the password input
    } catch (error) {
      console.error("Error updating password:", error); 
      // alert user when after failing to update password 
      alert("Failed to update password. Please try again.");
    }
  };

    // allow user to change username
  const userSubmit = async () => {
    try {
      // Call the updateProfile function with the new username
      await updateUsername(username);
      // alert user when username have been updated
      alert("Username updated successfully!");
      // clear the username input
      setNewUsername("");
    } catch (error) {
      console.error("Error updating password:", error);
      // alert user when after failing to update username 
      alert("Failed to update username. Please try again.");
    }
  };

  return user ? (
    <div
      className={`${styles["page-container"]} ${
        theme === "light" ? styles.pageContainerLight : styles.pageContainerDark
      }`}
    >
      <div
        className={`${styles.all} ${
          theme === "light" ? styles.allLight : styles.allDark
        }`}
      >
        <h1 className={styles.setting}>General Account Setting</h1>
        <div
          className={`${styles.container} ${
            theme === "light" ? styles.containerLight : styles.containerDark
          }`}
        >
          <div className={styles["label-input-container"]}>
            <label>Email: {user.email}</label>
          </div>
          <div className={styles["label-input-container"]}>
            <label>Username: {user.displayName}</label>
          </div>

          <div className={styles["label-input-container"]}>
            <label>New Username</label>
            <input
              className={`${styles.inputs} ${
                theme === "light" ? styles.inputsLight : styles.inputsDark
              }`}
              type="text"
              placeholder="Enter new username"
              value={username}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <button
              className={`${styles.save} ${
                theme === "light" ? styles.saveLight : styles.saveDark
              }`}
              onClick={userSubmit}
            >
              Save
            </button>
          </div>

          <div className={styles["label-input-container"]}>
            <label>New Password</label>
            <input
              className={`${styles.inputs} ${
                theme === "light" ? styles.inputsLight : styles.inputsDark
              }`}
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className={`${styles.save} ${
                theme === "light" ? styles.saveLight : styles.saveDark
              }`}
              onClick={passSubmit}
            >
              Save
            </button>
          </div>
          <div className={styles.switch}>
            <label>{theme === "light" ? "Light Mode" : "Dark Mode"}</label>
            <ReactSwitch onChange={toggleTheme} checked={theme === "dark"} />
          </div>
        </div>
        <div
          className={`${styles.links} ${
            theme === "dark" ? styles.linksDark : ""
          }`}
        >
          <p>
            If you want to reset your Google account password, visit{" "}
            <Link href="https://myaccount.google.com/security">
              <u>Google Account Security</u>
            </Link>
          </p>
          <div className={styles.links}>
            <Link className={styles.back} href="/">
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default Setting;
