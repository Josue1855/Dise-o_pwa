import React from 'react';
import { createRoot } from 'react-dom/client';
import LegacyDemoApp from './LegacyDemoApp.jsx';

createRoot(document.getElementById('root')).render(<React.StrictMode><LegacyDemoApp /></React.StrictMode>);
