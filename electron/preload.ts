import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  setAlwaysOnTop: (value: boolean) => ipcRenderer.invoke('window:setAlwaysOnTop', value),
  getAlwaysOnTop: () => ipcRenderer.invoke('window:getAlwaysOnTop'),

  // Tray notifications
  showNotification: (title: string, body: string) => ipcRenderer.invoke('tray:showNotification', title, body),

  // Login item (auto-start)
  getLoginItemSettings: () => ipcRenderer.invoke('app:getLoginItemSettings'),
  setLoginItemSettings: (openAtLogin: boolean) => ipcRenderer.invoke('app:setLoginItemSettings', openAtLogin),

  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getName: () => ipcRenderer.invoke('app:getName'),
  getPath: (name: 'userData' | 'appData' | 'home' | 'desktop' | 'documents' | 'downloads') =>
    ipcRenderer.invoke('app:getPath', name),

  // External links
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),

  // Event listeners
  onAlwaysOnTopChanged: (callback: (value: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, value: boolean) => callback(value);
    ipcRenderer.on('always-on-top-changed', handler);
    return () => ipcRenderer.removeListener('always-on-top-changed', handler);
  },
});

// Type declaration for the exposed API
declare global {
  interface Window {
    electronAPI: {
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      close: () => Promise<void>;
      isMaximized: () => Promise<boolean>;
      setAlwaysOnTop: (value: boolean) => Promise<boolean>;
      getAlwaysOnTop: () => Promise<boolean>;
      showNotification: (title: string, body: string) => Promise<void>;
      getLoginItemSettings: () => Promise<{ openAtLogin: boolean }>;
      setLoginItemSettings: (openAtLogin: boolean) => Promise<{ openAtLogin: boolean }>;
      getVersion: () => Promise<string>;
      getName: () => Promise<string>;
      getPath: (name: 'userData' | 'appData' | 'home' | 'desktop' | 'documents' | 'downloads') => Promise<string>;
      openExternal: (url: string) => Promise<void>;
      onAlwaysOnTopChanged: (callback: (value: boolean) => void) => () => void;
    };
  }
}
