import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Prevent uncaught ZodError rejections from crashing the console/runtime
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (event.reason.name === 'ZodError' || event.reason.issues)) {
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
