import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App.jsx'
import { startKeepAlive } from './utils/keepAlive.js';
import './index.css';

// In Vite dev / production, BrowserRouter is fine.
// In the preview shim (static file served from a sandbox URL with no fallback),
// HashRouter avoids deep-link 404s.
const Router = import.meta.env?.PROD === undefined && window.__VERIFYAI_SHIM__
  ? HashRouter
  : BrowserRouter;

startKeepAlive();
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
