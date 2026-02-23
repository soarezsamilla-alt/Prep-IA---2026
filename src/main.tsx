import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { UserProvider } from './context/UserContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { ActivityProvider } from './context/ActivityContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="prep-ia-theme">
      <UserProvider>
        <LanguageProvider>
          <ActivityProvider>
            <App />
          </ActivityProvider>
        </LanguageProvider>
      </UserProvider>
    </ThemeProvider>
  </StrictMode>,
);
