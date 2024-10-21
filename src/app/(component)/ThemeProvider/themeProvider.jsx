'use client';

import React, { useState, useEffect, createContext } from 'react';

export const ThemeContext = createContext(null);

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem('theme') || 'light'; 
    }
    return 'light';
  });

  useEffect(() => {
   
    if (typeof window !== "undefined") {
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]); 

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
