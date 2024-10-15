"use client";

import React, { useRef, useState, useEffect } from "react";
import styles from "./GlobalChat.module.css";
import { db, auth } from "../Firebase/firebase";
import { onSnapshot } from "firebase/firestore";
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

const GlobalChat = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const handleChatOpen = () => setIsChatOpen(!isChatOpen);

    return (
        <>
            <div className="background">
                <input
                    type="checkbox"
                    name="click"
                    className={styles.click}
                    id="click"
                    onChange={handleChatOpen}
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
                                Global Chat Room
                            </h2>
                        </div>
                        {isChatOpen && <ChatRoom />}
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

    const messagesRef = collection(db, "chats");
    const messagesQuery = query(
        messagesRef,
        orderBy("createdAt", "desc"),
        limit(20)
    );

    // READ: useEffect to ensure read requests are sent only when the chat is open
    useEffect(() => {
        const unsubscribe = onSnapshot(messagesQuery, snapshot => {
            console.log(
                "Received new data from Firestore:",
                snapshot.docs.length,
                "documents."
            );
            setMessages(
                snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .reverse()
            );
        });

        return () => {
            console.log("Cleaning up Firestore listener...");
            unsubscribe();
        };
    }, []);

    // WRITE: sends message to firestore
    const sendMessage = async e => {
        e.preventDefault();

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

    return (
        <>
            <main>
                {messages &&
                    messages.map(message => (
                        <ChatMessage key={message.id} message={message} />
                    ))}

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
                    disabled={!formValue}
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
                <img
                    className={styles["user-photo"]}
                    src={photoURL || "/profile.png"}
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
