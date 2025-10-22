import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '@pages/main/App';
import '@pages/main/app_style.css';
import '@assets/styles/tailwind.css';

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Newtab root element");
  const root = createRoot(rootContainer);
  root.render(<App />);
}

init();
