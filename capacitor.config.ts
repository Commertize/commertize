import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.commertize.app',
  appName: 'Commertize',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  ios: {
    scheme: 'Commertize',
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#ffffff'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#be8d00",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true
    },
    StatusBar: {
      style: 'DARK'
    }
  }
};

export default config;
