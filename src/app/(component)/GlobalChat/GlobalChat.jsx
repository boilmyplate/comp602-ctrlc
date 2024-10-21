"use client";

import React, { useRef, useState, useEffect } from "react";
import styles from "./GlobalChat.module.css";
import { db, auth } from "../Firebase/firebase";
import { getDocs } from "firebase/firestore";
import {
    collection,
    orderBy,
    limit,
    query,
    serverTimestamp,
    addDoc
} from "firebase/firestore";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComments,
    faXmark,
    faPaperPlane
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

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

    const messagesRef = collection(db, "chats");
    const messagesQuery = query(
        messagesRef,
        orderBy("createdAt", "desc"),
        limit(20)
    );

    // READ: fetch messages
    const fetchMessages = async () => {

        try {
            const snapshot = await getDocs(messagesQuery);
            const docs = snapshot.docs;

            setMessages(docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse());
            setLastFetchedTime(new Date().toLocaleTimeString()); // update the last fetch time
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
        console.log("FETHCING MESSGAESG")
    };

    // WRITE: sends message to firestore
    const sendMessage = async e => {
        e.preventDefault();

        // prevent sending a blank message
        if (formValue.trim() === "") {
            return;
        }

        const { uid, photoURL, displayName } = auth.currentUser;

        await addDoc(messagesRef, {
            text: formValue,
            createdAt: serverTimestamp(),
            uid,
            displayName,
            photoURL
        });

        setFormValue("");
        dummy.current.scrollIntoView({ behavior: "smooth" });
    };

    // READ: fetch messages when the chat room opens
    useEffect(() => {
        fetchMessages();
    }, []);

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
                            <p className={styles["last-fetched"]}>Last fetched at: {lastFetchedTime}</p>
                            <p className={styles["fetch-info"]}>Click send button to fetch new messages</p>
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

                <button
                    className={styles["send-button"]}
                    type="submit"
                    onClick={fetchMessages}
                >
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
