"use client";

import React, { useState, createContext, useEffect } from "react";

export const ThemeContext = createContext(null);

const ThemeProvider = ({ children }) => {
    // Retrieve theme from localStorage if available, otherwise default to 'dark'
    const [theme, setTheme] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("theme") || "light";
        }
        return "light";
    });

    const toggleTheme = () => {
        setTheme(curr => {
            const newTheme = curr === "light" ? "dark" : "light";
            localStorage.setItem("theme", newTheme); // Store the updated theme in localStorage
            return newTheme;
        });
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("theme", theme); // Store the theme in localStorage when it changes
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
