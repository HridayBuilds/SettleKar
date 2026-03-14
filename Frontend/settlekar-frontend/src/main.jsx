import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A2235',
              color: '#F1F5F9',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22C55E', secondary: '#F1F5F9' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#F1F5F9' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
