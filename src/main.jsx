import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
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
  } catch {}

  msalInstance.handleRedirectPromise().then(async (response) => {
    if (response !== null && response.idToken) {
      try {
        const authService = (await import('./features/auth/authService')).default;
        const authData = await authService.loginWithMicrosoft(response.idToken);
        authService.saveSession(authData);
        // Recargar para que AuthContext detecte la sesión
        window.location.assign('/');
      } catch (backendErr) {}
    }
  }).catch(() => {});

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <GoogleOAuthProvider clientId={googleClientId}>
        <MsalProvider instance={msalInstance}>
          <ThemeProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ThemeProvider>
        </MsalProvider>
      </GoogleOAuthProvider>
    </StrictMode>
  );
}

initApp();
