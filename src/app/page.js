"use client";

import React from "react";
import Login from "./(component)/Login/login";
import Navbar from "./(component)/NavBar/navbar";
import HomePage from "./(component)/Home/home";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./(component)/Firebase/firebase";

export default function Home() {
    const [user] = useAuthState(auth);

    if (!user) {
        return <Login />;
    } else {
        return (
            <>
                <Navbar />
                <HomePage />
            </>
        );
    }
}
