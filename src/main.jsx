import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/baloo-bhaijaan-2/arabic-500.css';
import '@fontsource/baloo-bhaijaan-2/arabic-700.css';
import '@fontsource/baloo-bhaijaan-2/arabic-800.css';
import '@fontsource/baloo-bhaijaan-2/latin-700.css';
import '@fontsource/amiri/arabic-400.css';
import './styles.css';
import App from './App';
createRoot(document.getElementById('root')).render(<App />);

// زرار الرجوع في أندرويد بيرجع خطوة، ومن الجزيرة بيقفل التطبيق
import { Capacitor } from '@capacitor/core';
if (Capacitor.isNativePlatform()) {
  import('@capacitor/app').then(({ App }) => App.addListener('backButton', () => {
    const h = location.hash;
    if (!h || h === '#/' || h.startsWith('#/island') || h.startsWith('#/splash')) App.exitApp(); else history.back();
  }));
  import('@capacitor/status-bar').then(({ StatusBar, Style }) => { StatusBar.setBackgroundColor({ color: '#7FD3FF' }).catch(() => {}); StatusBar.setStyle({ style: Style.Light }).catch(() => {}); });
}
