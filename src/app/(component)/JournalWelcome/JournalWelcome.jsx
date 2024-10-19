"use client";

import React from "react";
import styles from "./journalWelcome.module.css"; // Import CSS styles specific to the Journal component.
import Link from "next/link"; // Import Next.js Link component
import Image from "next/image"; // Import Next.js Image component

const JournalWelcome = () => {
    return (
        <div className={styles["journal-grid"]}>
            {/* Main container for the journal content */}
            <div className={styles["journalWelcome-container"]}>
                <h2 className={styles["journal-header"]}>My Daily Journal</h2>{" "}
                {/* Header for the journal */}
                <div className={styles["content-grid"]}>
                    {/* Container for journal text */}
                    <div className={styles["text-container"]}>
                        <h2>
                            Please use this space to express your feelings,
                            successes, or simply jot down the little things that
                            bring you joy.
                        </h2>
                        <p>Click "+" for new entry</p>

                        {/* New container for buttons */}
                        <div className={styles["button-container"]}>
                            {/* Past Entries Button */}
                            <div className={styles["past-entry-container"]}>
                                <Link
                                    href="/past-entries"
                                    className={styles.link}
                                >
                                    <button className={styles.button}>
                                        Past Entries
                                    </button>
                                </Link>
                            </div>

                            {/* New Entry Button (Plus Icon) */}
                            <div className={styles["new-entry-container"]}>
                                <Link
                                    href="/newentry"
                                    className={styles["plus-link"]}
                                >
                                    <div className={styles["plus-icon"]}>+</div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Container for the image */}
                    <div className={styles["image-container"]}>
                        <Image
                            src="/journal.jpg"
                            alt="Journal Image"
                            width={400}
                            height={300}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JournalWelcome;
