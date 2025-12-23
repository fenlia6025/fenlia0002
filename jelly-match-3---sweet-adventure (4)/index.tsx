
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/**
 * Initializes the React application.
 * Ensures the root element is available before mounting.
 */
function initializeApp() {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error("Critical Error: Could not find the 'root' element in the document.");
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to render the React application:", error);
  }
}

// Ensure the browser has finished parsing the HTML before running our code
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
