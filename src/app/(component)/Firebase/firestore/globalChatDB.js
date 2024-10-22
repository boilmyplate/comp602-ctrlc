import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export const fetchChats = async () => {
    try {
        const messagesRef = collection(db, "chats");
        const messagesQuery = query(
            messagesRef,
            orderBy("createdAt", "desc"),
            limit(20)
        );
        const snapshot = await getDocs(messagesQuery);
        const docs = snapshot.docs;
        return docs;
    } catch (error) {
        console.error("Error fetching chats: ", error);
        return [];
    }
}

export const addChatMessage = async (formValue) => {
    try {
        const { uid, photoURL, displayName } = auth.currentUser;
        const messagesRef = collection(db, "chats");
    
        await addDoc(messagesRef, {
            text: formValue,
            createdAt: serverTimestamp(),
            uid,
            displayName,
            photoURL
        });
    } catch (error) {
        console.error("Error sending chat message: ", error);
    }
}

