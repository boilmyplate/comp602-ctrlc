// Home.js
'use client';

import React from 'react';
import Login from './(component)/Login/login';
import Navbar from './(component)/NavBar/navbar';
import HomePage from './(component)/Home/home';
import Chat from './(component)/Chatbot/chatbot';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './(component)/Firebase/firebase';
import GlobalChat from './(component)/GlobalChat/GlobalChat';

export default function Home() {
  const [user] = useAuthState(auth);

  if (!user) {
    return <Login />;
  } else {
    return (
      <>
        <Navbar />
        <HomePage />
        <Chat />
        <GlobalChat />
      </>
    );
  }
}
