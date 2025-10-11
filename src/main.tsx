import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import './index.css';

import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Failed to find root element');
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: system-ui; color: #721c24; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; margin: 20px;">
      <h1>Application Failed to Load</h1>
      <p>Root element not found. Please ensure there is an element with id="root" in your HTML.</p>
    </div>
  `;
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
