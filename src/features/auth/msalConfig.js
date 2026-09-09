import { PublicClientApplication, LogLevel } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '467af7d5-3833-4dac-8597-dc0822e39baa';

export const msalConfig = {
  auth: {
    clientId: clientId,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : (import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'),
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : (import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'),
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error('[MSAL]', message);
            break;
          case LogLevel.Warning:
            console.warn('[MSAL]', message);
            break;
          default:
            break;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};

export const msalInstance = new PublicClientApplication(msalConfig);
