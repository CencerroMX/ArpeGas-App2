import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.arpe.gas',
  appName: 'ARPE Gas',
  webDir: 'www',
  plugins: {
    // Enruta fetch/XHR por el HTTP nativo para evitar problemas de CORS con el backend.
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#1e3a8a',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1e3a8a',
    },
  },
};

export default config;
