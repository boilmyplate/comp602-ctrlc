import React from 'react';
import ThemeProvider from './(component)/ThemeProvider/themeProvider';
import BodyClassManager from "./(component)/ThemeProvider/BodyClassManager";

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <BodyClassManager />
      {children}
    </ThemeProvider>
  );
}
