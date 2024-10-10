"use client";

import React, { useRef, useState, useEffect } from "react";
import styles from "./GlobalChat.module.css";
import { db, auth } from "../Firebase/firebase";
import {
    collection,
    orderBy,
    limit,
    query,
    serverTimestamp,
    addDoc
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faXmark } from "@fortawesome/free-solid-svg-icons";

const GlobalChat = () => {
    const [user] = useAuthState(auth);
    return (
        <>
            <div className="background">
                <input type="checkbox" name="click" className={styles.click} id="click" />
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
                        <h1 className={styles.headText}>Global Chat Room</h1>
                        <ChatRoom />
                    </section>
                </div>
            </div>
        </>
    );
};

function ChatRoom() {
    const dummy = useRef();
    const messagesRef = collection(db, "chats");
    const messagesQuery = query(messagesRef, orderBy("createdAt"), limit(25));

    const [messages] = useCollection(messagesQuery);

    const [formValue, setFormValue] = useState("");

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
                    messages.docs.map(doc => (
                        <ChatMessage
                            key={doc.id}
                            message={{ id: doc.id, ...doc.data() }}
                        />
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
                    Send
                </button>
            </form>
        </>
    );
}

function ChatMessage(props) {
    const { text, uid, displayName, photoURL } = props.message;

    const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
    const messageRef = useRef();
    console.log(auth.currentUser);

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
                <p className={styles.displayname}>{displayName}</p>
                <p className={styles["chat-messages"]}>{text}</p>
            </div>
        </>
    );
}

export default GlobalChat;
