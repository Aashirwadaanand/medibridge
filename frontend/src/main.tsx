import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DEMO_MODE } from './config/appMode';
import { seedDemoDb } from './services/_demoDb';

// Seed the demo database from JSON files on first load (only in demo mode).
// This is a no-op if already seeded (idempotent STORAGE.DEMO_DB.SEEDED guard).
if (DEMO_MODE) {
  seedDemoDb();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
