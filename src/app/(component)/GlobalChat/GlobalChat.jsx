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
    addDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";

const GlobalChat = () => {
    const [user] = useAuthState(auth);
    return (
        <>
            <div className={styles["background"]}>
                <section>
                    <ChatRoom />
                </section>
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

    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL } = auth.currentUser;

        await addDoc(messagesRef, {
            text: formValue,
            createdAt: serverTimestamp(),
            uid,
            photoURL,
        });

        setFormValue("");
        dummy.current.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <>
            <main>
                {messages &&
                    messages.docs.map((doc) => (
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
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="say something nice"
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
    const { text, uid, photoURL } = props.message;

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
                    src={photoURL || "https://picsum.photos/50/50"}
                />
                <p className={styles["chat-messages"]}>{text}</p>
            </div>
        </>
    );
}

export default GlobalChat;
