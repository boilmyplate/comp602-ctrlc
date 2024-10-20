'use client';

import React from 'react';
import ThemeProvider from './(component)/ThemeProvider/themeProvider';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}