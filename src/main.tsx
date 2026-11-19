import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { initStorageSync } from './app/storage-sync';
import { browserStoragePort } from './shared';
import './index.css';

/** Mounts the React application root into the DOM. */
export function initApp(): void {
  initStorageSync(browserStoragePort);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

initApp();
