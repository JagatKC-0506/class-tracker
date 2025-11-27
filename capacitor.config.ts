import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.classtrack.app',
  appName: 'Class Tracker',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#667eea",
      sound: "beep.wav"
    }
  }
};

export default config;
