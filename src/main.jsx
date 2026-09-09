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
    // 1. Inicializar instancia de MSAL
    await msalInstance.initialize();
  } catch (err) {
    console.error('[MSAL] Error durante la inicialización de MSAL:', err);
  }

  // 2. Manejar la redirección (vuelta de Microsoft)
  msalInstance.handleRedirectPromise().then(async (response) => {
    if (response !== null && response.idToken) {
      console.log('¡Token obtenido por redirección!', response.idToken);
      try {
        // Hacemos el POST a nuestro backend en ASP.NET Core
        const authService = (await import('./features/auth/authService')).default;
        const authData = await authService.loginWithMicrosoft(response.idToken);
        authService.saveSession(authData);
        // Forzamos que la app cargue de nuevo para que el AuthContext tome la sesión
        window.location.assign('/');
      } catch (backendErr) {
        console.error('Error al autenticar en el backend después de MSAL:', backendErr);
      }
    }
  }).catch((error) => {
    console.error('Error procesando la redirección de MSAL:', error);
  });

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
