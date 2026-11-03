import 'loui-ds/styles.css';
import { DSProvider, ToastRegion } from 'loui-ds';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DSProvider locale="en-US">
      <App />
      <ToastRegion />
    </DSProvider>
  </StrictMode>,
);
