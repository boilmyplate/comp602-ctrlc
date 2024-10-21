"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import styles from "./GlobalChat.module.css";
import { auth } from "../Firebase/firebase";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComments,
    faXmark,
    faPaperPlane
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { addChatMessage, fetchChats } from "../Firebase/firestore/globalChatDB";

const GlobalChat = () => {
    return (
        <>
            <div className="background">
                <input
                    type="checkbox"
                    name="click"
                    className={styles.click}
                    id="click"
                />
                <label className={styles.btnlabel} htmlFor="click">
                    <i className={styles.fac}>
                        <FontAwesomeIcon icon={faComments} />
                    </i>
                    <i className={styles.fax}>
                        <FontAwesomeIcon icon={faXmark} />
                    </i>
                </label>
                <div className={styles["wrapper"]}>
                    <section>
                        <div className={styles["chatbox-header"]}>
                            <h2 className={styles["chatbox-header-title"]}>
                                Global Chat Room (๑&gt;◡&lt;๑)
                            </h2>
                        </div>
                        <ChatRoom />
                    </section>
                </div>
            </div>
        </>
    );
};

function ChatRoom() {
    const dummy = useRef();
    const [messages, setMessages] = useState([]);
    const [formValue, setFormValue] = useState("");
    const [lastFetchedTime, setLastFetchedTime] = useState(null); // track the time of the last fetch

    // READ: fetch messages
    const fetchMessages = useCallback(async () => {
        const docs = await fetchChats();
        setMessages(docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse());
        setLastFetchedTime(new Date().toLocaleTimeString()); // update the last fetch time
        console.log("FETCHED MESSAGES: ", docs);
    }, []);

    // WRITE: sends message to firestore
    const sendMessage = async e => {
        e.preventDefault();

        // prevent sending a blank message
        if (formValue.trim() === "") {
            return;
        }

        await addChatMessage(formValue);

        setFormValue("");
        dummy.current.scrollIntoView({ behavior: "smooth" });

        fetchMessages();
    };

    // READ: fetch messages when the chat room opens
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    return (
        <>
            <main>
                {messages &&
                    messages.map(message => (
                        <ChatMessage key={message.id} message={message} />
                    ))}

                <div className={styles["fetch-button-container"]}>
                    {lastFetchedTime && (
                        <>
                            <p className={styles["last-fetched"]}>
                                Last fetched at: {lastFetchedTime}
                            </p>
                            <p className={styles["fetch-info"]}>
                                Click send button to fetch new messages
                            </p>
                        </>
                    )}
                </div>

                <span ref={dummy}></span>
            </main>

            <form className={styles["form"]} onSubmit={sendMessage}>
                <input
                    className={styles["inputs"]}
                    value={formValue}
                    onChange={e => setFormValue(e.target.value)}
                    placeholder="Message Global Chat"
                />

                <button className={styles["send-button"]} type="submit">
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </form>
        </>
    );
}

function ChatMessage(props) {
    const { text, uid, displayName, photoURL } = props.message;

    const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
    const messageRef = useRef();

    return (
        <>
            <div
                ref={messageRef}
                className={`${styles.message} ${styles[messageClass]}`}
            >
                <Image
                    alt="User Photo"
                    src={photoURL || "/profile.png"}
                    width={50}
                    height={50}
                />
                <div className={styles["msg-container"]}>
                    <p className={styles.displayname}>{displayName}</p>
                    <p className={styles["chat-messages"]}>{text}</p>
                </div>
            </div>
        </>
    );
}

export default GlobalChat;
