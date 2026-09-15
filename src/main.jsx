import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './features/auth/msalConfig';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import App from './App.jsx';
import './index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'TU_GOOGLE_CLIENT_ID';

async function initApp() {
  try {
    await msalInstance.initialize();
  } catch (err) {
    console.error('[MSAL] Error initializing:', err);
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <GoogleOAuthProvider clientId={googleClientId}>
        <MsalProvider instance={msalInstance}>
          <ThemeProvider>
            <AuthProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </AuthProvider>
          </ThemeProvider>
        </MsalProvider>
      </GoogleOAuthProvider>
    </StrictMode>
  );
}

initApp();
