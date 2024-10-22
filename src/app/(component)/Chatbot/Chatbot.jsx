"use client";

import React from "react";
import ChatBot from "react-simple-chatbot";
import { ThemeProvider } from "styled-components";
import styles from "@/app/(component)/Chatbot/Chatbot.module.css";

const theme = {
    background: "white",
    headerBgColor: "#4B3621", // the top of the chatbot
    headerFontSize: "16px",
    headerFontColor: "white",
    botBubbleColor: "#83C2F8",
    botFontColor: "white",
    userBubbleColor: "#ED7E99",
    userFontColor: "white"
};

const config = {
    floating: true,
    floatingStyle: {
        right: "30px", // Adjust the right position
        bottom: "20px" // Adjust the bottom position
    }
};

// Function to generate responses based on user input
function generateResponse(userQuestion) {
    console.log("Response: ", userQuestion);
    const userInput = userQuestion.previousValue; // Extract user's input

    // Check if user input is a valid string
    if (typeof userInput !== "string") {
        return "I'm sorry, I don't have a specific answer to that question. Please ask something else.";
    }

    // Responding based on specific keywords or phrases in the user's question
    const input = userInput.toLowerCase();

    // BlankWeb-related responses
    if (input.includes("what is blankweb")) {
        return "BlankWeb is a platform that helps users track mental well-being through journaling, games, and mood tracking.";
    } else if (input.includes("how does blankweb support mental health")) {
        return "BlankWeb supports mental health by providing features like journaling, mood tracking, and relaxation games.";
    }
    // Default response if no match is found
    else {
        return "I'm sorry, I don't have a specific answer to that question. Please ask something else or check the FAQs.";
    }
}

const Chat = () => {
    const steps = [
        {
            // First question bot asks user
            id: "0",
            message: "What is your name?",
            trigger: "1"
        },
        {
            id: "1",
            user: true,
            trigger: "2"
        },
        {
            id: "2",
            message: "Hi {previousValue}, nice to meet you!",
            trigger: "3"
        },
        {
            id: "3",
            options: [
                // Options for user to choose for FAQs
                {
                    value: 1,
                    label: "FAQs About BlankWeb",
                    trigger: "faqQueBlaWeb"
                },
                {
                    value: 2,
                    label: "FAQs About Mental Health",
                    trigger: "faqMenHealth"
                },
                {
                    value: 3,
                    label: "Ask A Question",
                    trigger: "userInput"
                },
                {
                    value: 4,
                    label: "End Conversation",
                    trigger: "end"
                }
            ]
        },

        // FAQs for BlankWeb
        {
            id: "faqQueBlaWeb",
            message: "Here are some frequently asked questions:",
            trigger: "faqOptionsBlank"
        },
        {
            id: "faqOptionsBlank",
            options: [
                {
                    value: "faq1Blank",
                    label: "What is BlankWeb?",
                    trigger: "faq1AnswerBlank"
                },
                {
                    value: "faq2Blank",
                    label: "How does BlankWeb support mental health?",
                    trigger: "faq2AnswerBlank"
                },
                {
                    value: "faq3Blank",
                    label: "How do I set up my account on BlankWeb?",
                    trigger: "faq3AnswerBlank"
                },
                {
                    value: "faq4Blank",
                    label: "How many games are on BlankWeb?",
                    trigger: "faq4AnswerBlank"
                },
                {
                    value: "faq5Blank",
                    label: "Can I change my email or password?",
                    trigger: "faq5AnswerBlank"
                },
                {
                    value: "exitfaq",
                    label: "Exit FAQ",
                    trigger: 3
                }
            ]
        },

        // Answers for FAQs for BlankWeb
        {
            id: "faq1AnswerBlank",
            message:
                "BlankWeb is an online platform designed to help users manage and improve their mental well-being through journaling, games, and mood tracking.",
            trigger: "faqOptionsBlank"
        },
        {
            id: "faq2AnswerBlank",
            message:
                "BlankWeb provides features like journals to track thoughts or games for relaxation.",
            trigger: "faqOptionsBlank"
        },
        {
            id: "faq3AnswerBlank",
            message:
                "Sign up with your email, create a username, and password or use your Google email.",
            trigger: "faqOptionsBlank"
        },
        {
            id: "faq4AnswerBlank",
            message: "At the moment, BlankWeb only has 1 game.",
            trigger: "faqOptionsBlank"
        },
        {
            id: "faq5AnswerBlank",
            message: "Yes, you can edit your email and password in settings.",
            trigger: "faqOptionsBlank"
        },

        // FAQs for Mental Health
        {
            id: "faqMenHealth",
            message: "Here are some frequently asked questions:",
            trigger: "faqOptionsMental"
        },
        {
            id: "faqOptionsMental",
            options: [
                {
                    value: "faq1Mental",
                    label: "What is mental health?",
                    trigger: "faq1AnswerMental"
                },
                {
                    value: "faq2Mental",
                    label: "How to know if I need help with my mental health?",
                    trigger: "faq2AnswerMental"
                },
                {
                    value: "faq3Mental",
                    label: "What are some common mental health issues?",
                    trigger: "faq3AnswerMental"
                },
                {
                    value: "faq4Mental",
                    label: "How can I reduce stress?",
                    trigger: "faq4AnswerMental"
                },
                {
                    value: "faq5Mental",
                    label:
                        "What are the warning signs of mental health problems?",
                    trigger: "faq5AnswerMental"
                },
                {
                    value: "faq6Mental",
                    label:
                        "How can I support a friend with mental health issues?",
                    trigger: "faq6AnswerMental"
                },
                {
                    value: "faq7Mental",
                    label: "Where can I find help for mental health problems?",
                    trigger: "faq7AnswerMental"
                },
                {
                    value: "exitfaq",
                    label: "Exit FAQ",
                    trigger: 3
                }
            ]
        },

        // Answers for FAQs for Mental Health
        {
            id: "faq1AnswerMental",
            message:
                "Mental health refers to emotional, psychological, and social well-being. It affects how we think, feel, and act.",
            trigger: "faqOptionsMental"
        },
        {
            id: "faq2AnswerMental",
            message:
                "If you are feeling overwhelmed, anxious, depressed, or notice changes in your mood, sleep, or behavior that last more than a few weeks, it might be a good idea to seek help.",
            trigger: "faqOptionsMental"
        },
        {
            id: "faq3AnswerMental",
            message:
                "Common issues include anxiety, depression, stress, PTSD, bipolar disorder, and OCD.",
            trigger: "faqOptionsMental"
        },
        {
            id: "faq4AnswerMental",
            message:
                "Techniques like mindfulness, deep breathing, regular exercise, and talking to someone can help manage stress.",
            trigger: "faqOptionsMental"
        },
        {
            id: "faq5AnswerMental",
            message:
                "Signs include feeling sad or withdrawn for long periods, extreme mood swings, changes in eating or sleeping habits, and thoughts of self-harm.",
            trigger: "faqOptionsMental"
        },
        {
            id: "faq6AnswerMental",
            message:
                "Listen without judgment, encourage them to seek professional help, and be there for them emotionally.",
            trigger: "faqOptionsMental"
        },
        {
            id: "faq7AnswerMental",
            message:
                "You can seek help from a mental health professional, local counseling services, or online resources.",
            trigger: "faqOptionsMental"
        },

        // Allow user to input questions
        {
            id: "userInput",
            message: "Please ask your question:",
            trigger: "getUserInput"
        },
        {
            id: "getUserInput",
            user: true,
            trigger: "generateResponse"
        },
        {
            id: "generateResponse",
            message: ({ previousValue }) => generateResponse({ previousValue }), // Get the response from the function
            trigger: "3" // Loop back to the main options
        },
        {
            id: "end",
            message: "Thank you for using our chatbot!",
            end: true
        }
    ];

    return (
        <ThemeProvider theme={theme}>
            <div className={styles.chatbot}>
                <ChatBot
                    headerTitle="BlankWeb Bot (๑>◡<๑)"
                    steps={steps}
                    {...config}
                />
            </div>
        </ThemeProvider>
    );
};

export default Chat;
