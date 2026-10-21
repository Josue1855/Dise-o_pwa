import React from 'react';
import { createRoot } from 'react-dom/client';
import LabApp from './LabApp.jsx';
import './lab.css';
createRoot(document.getElementById('root')).render(<LabApp />);
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').then(() => console.info('event=pwa_registered')).catch(() => console.error('event=pwa_registration_failed'));
}
