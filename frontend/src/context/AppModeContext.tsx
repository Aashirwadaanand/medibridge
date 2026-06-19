/**
 * AppModeContext.tsx — Read-only mode indicator.
 *
 * Mode is derived entirely from the build-time DEMO_MODE constant.
 * There is NO setMode function — the mode cannot be changed at runtime.
 * UI components use `isDemoMode` to show/hide demo-specific UI elements.
 */
import React, { createContext, useContext } from 'react';
import { DEMO_MODE } from '../config/appMode';

export type AppMode = 'demo' | 'live';

interface AppModeContextType {
  mode: AppMode;
  isDemoMode: boolean;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

const MODE_VALUE: AppModeContextType = {
  mode: DEMO_MODE ? 'demo' : 'live',
  isDemoMode: DEMO_MODE,
};

export const AppModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppModeContext.Provider value={MODE_VALUE}>
    {children}
  </AppModeContext.Provider>
);

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
};
