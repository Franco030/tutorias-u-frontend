import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './features/auth/msalConfig';
import { ThemeProvider } from './context/ThemeContext';
import { FluentThemeBridge } from './theme/FluentThemeBridge';
import { AuthProvider } from './context/AuthContext';
import App from './App.jsx';
import { ignorarModificadorasSolas } from './lib/teclasModificadoras';
import './index.css';

ignorarModificadorasSolas();

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'TU_GOOGLE_CLIENT_ID';

// Router de datos (las rutas siguen en App): permite avisar de cambios sin
// guardar antes de salir de una página con useBlocker.
const router = createBrowserRouter([{ path: '*', element: <App /> }]);

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
            <FluentThemeBridge>
              <AuthProvider>
                <RouterProvider router={router} />
              </AuthProvider>
            </FluentThemeBridge>
          </ThemeProvider>
        </MsalProvider>
      </GoogleOAuthProvider>
    </StrictMode>
  );
}

initApp();
