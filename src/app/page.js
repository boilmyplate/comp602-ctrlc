"use client";

import React from "react";
import Login from "./(component)/Login/Login";
import Navbar from "./(component)/NavBar/Navbar";
import HomePage from "./(component)/Home/Home";
import Chat from "./(component)/Chatbot/Chatbot";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./(component)/Firebase/firebase";
import GlobalChat from "./(component)/GlobalChat/GlobalChat";
import ThemeProvider from "./(component)/ThemeProvider/themeProvider"; 
import BodyClassManager from "./(component)/ThemeProvider/BodyClassManager"; 

export default function Home() {
    const [user] = useAuthState(auth);

    if (!user) {
        return <Login />;
    } else {
        return (
            <ThemeProvider>
                <BodyClassManager />
                <Navbar />
                <HomePage />
                <Chat />
                <GlobalChat />
            </ThemeProvider>
        );
    }
}
