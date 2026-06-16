import React, { createContext, useContext, useState } from 'react';

export type AppMode = 'demo' | 'live';

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export const AppModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<AppMode>(() => {
    return (localStorage.getItem('medibridge_app_mode') as AppMode) || 'demo';
  });

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem('medibridge_app_mode', newMode);
    // Dispatch custom event to notify services if needed, and trigger re-render
    window.dispatchEvent(new Event('medibridge-mode-change'));
  };

  return (
    <AppModeContext.Provider value={{ mode, setMode }}>
      {children}
    </AppModeContext.Provider>
  );
};

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
};
