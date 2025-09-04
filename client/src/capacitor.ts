// Capacitor iOS Integration
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';

export const initializeCapacitor = async () => {
  // Only run on native platforms
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  console.log('Initializing Capacitor for native platform...');

  try {
    // Configure status bar for iOS
    if (Capacitor.getPlatform() === 'ios') {
      await StatusBar.setStyle({ style: Style.Default });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    }

    // Hide splash screen after app loads
    await SplashScreen.hide();

    // Set up keyboard event listeners
    Keyboard.addListener('keyboardWillShow', (info) => {
      document.body.style.transform = `translateY(-${info.keyboardHeight / 4}px)`;
    });

    Keyboard.addListener('keyboardWillHide', () => {
      document.body.style.transform = 'translateY(0)';
    });

    // Handle app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active?', isActive);
    });

    // Handle deep links
    App.addListener('appUrlOpen', (data) => {
      console.log('App opened with URL: ', data.url);
      // Handle deep linking here
      const slug = data.url.split('.app').pop();
      if (slug) {
        window.location.href = slug;
      }
    });

    console.log('Capacitor initialization complete');
  } catch (error) {
    console.error('Error initializing Capacitor:', error);
  }
};

// Export platform detection utilities
export const isNative = () => Capacitor.isNativePlatform();
export const isIOS = () => Capacitor.getPlatform() === 'ios';
export const isAndroid = () => Capacitor.getPlatform() === 'android';
export const isWeb = () => Capacitor.getPlatform() === 'web';