import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cencerro.arpegas',
  appName: 'ARPE Gas',
  webDir: 'www',
  plugins: {
    // Enruta fetch/XHR por el HTTP nativo para evitar problemas de CORS con el backend.
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      // No se auto-oculta: la app la cierra cuando ya enrutó a la primera pantalla,
      // así solo se ve UNA splash antes del registro/teléfono.
      launchAutoHide: false,
      backgroundColor: '#1a3fa6',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1a3fa6',
    },
  },
};

export default config;
