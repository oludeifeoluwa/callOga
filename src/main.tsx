import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './LiveApp.tsx';
import './index.css';
import './experience.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

