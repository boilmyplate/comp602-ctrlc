"use client";

import { useContext, useEffect } from "react";
import { ThemeContext } from "./themeProvider";

const BodyClassManager = () => {
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        document.body.classList.remove("light", "dark");
        document.body.classList.add(theme);
    }, [theme]);

    return null;
};

export default BodyClassManager;
