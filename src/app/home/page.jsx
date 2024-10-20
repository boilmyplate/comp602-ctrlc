import React from "react";
import NavBar from "../(component)/NavBar/Navbar";
import GameLibrary from "../(component)/GameLibrary/Games";
import Chatbot from "../(component)/Chatbot/Chatbot";

export default function Page() {
	return (
		<>
			<NavBar />
			<GameLibrary/>
			<Chatbot/>
		</>
	);
}
