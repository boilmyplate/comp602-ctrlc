import React from "react";
import NavBar from "../(component)/NavBar/navbar";
import GameLibrary from "../(component)/GameLibrary/games";
import Chatbot from "../(component)/Chatbot/chatbot";

export default function Page() {
	return (
		<>
			<NavBar />
			<GameLibrary/>
			<Chatbot/>
		</>
	);
}
