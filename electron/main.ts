import { app, BrowserWindow, Tray, Menu, nativeImage, Notification, globalShortcut, ipcMain, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

// Development mode check
const isDev = !app.isPackaged;

// Window instance
let mainWindow: BrowserWindow | null = null;
// Tray instance
let tray: Tray | null = null;
// Store window bounds for persistence
let windowBounds: Electron.Rectangle = { x: undefined, y: undefined, width: 1024, height: 720 };
// Always on top state
let isAlwaysOnTop = false;
// Login item settings
let loginItemSettings = { openAtLogin: false };

// Paths
const preloadPath = path.join(__dirname, 'preload.js');
const DIST_PATH = path.join(__dirname, '../renderer');
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

// ============ Window Management ============

function createWindow(): void {
  // Restore bounds if saved
  const boundsPath = path.join(app.getPath('userData'), 'window-bounds.json');
  if (fs.existsSync(boundsPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(boundsPath, 'utf-8'));
      windowBounds = { ...windowBounds, ...saved };
    } catch (e) {
      console.error('Failed to restore window bounds:', e);
    }
  }

  mainWindow = new BrowserWindow({
    width: windowBounds.width,
    height: windowBounds.height,
    x: windowBounds.x,
    y: windowBounds.y,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../renderer/icon.png'),
  });

  // Restore always on top state
  if (isAlwaysOnTop) {
    mainWindow.setAlwaysOnTop(true);
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Save bounds on resize/move
  mainWindow.on('resize', saveBounds);
  mainWindow.on('move', saveBounds);

  // Handle close to tray (minimize instead of close)
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Load content
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(DIST_PATH, 'index.html'));
  }
}

function saveBounds(): void {
  if (!mainWindow) return;
  const bounds = mainWindow.getBounds();
  windowBounds = bounds;
  const boundsPath = path.join(app.getPath('userData'), 'window-bounds.json');
  try {
    fs.writeFileSync(boundsPath, JSON.stringify(bounds));
  } catch (e) {
    console.error('Failed to save window bounds:', e);
  }
}

function restoreWindow(): void {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
}

// ============ Tray System ============

function createTray(): void {
  // Create tray icon (use a simple 16x16 icon)
  const iconPath = path.join(__dirname, '../renderer/icon.png');
  let trayIcon: nativeImage;

  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  } else {
    // Fallback: create a simple empty icon
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show PixelPal',
      click: restoreWindow,
    },
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: isAlwaysOnTop,
      click: (menuItem) => {
        isAlwaysOnTop = menuItem.checked;
        mainWindow?.setAlwaysOnTop(isAlwaysOnTop);
        mainWindow?.webContents.send('always-on-top-changed', isAlwaysOnTop);
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('PixelPal');
  tray.setContextMenu(contextMenu);

  // Double-click to restore
  tray.on('double-click', restoreWindow);
}

// ============ Notifications ============

function showNotification(title: string, body: string): void {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      icon: path.join(__dirname, '../renderer/icon.png'),
    });

    notification.on('click', () => {
      restoreWindow();
    });

    notification.show();
  }
}

// ============ Global Shortcuts ============

function registerGlobalShortcuts(): void {
  // Ctrl+Shift+P: Show/focus window
  globalShortcut.register('CommandOrControl+Shift+P', () => {
    restoreWindow();
  });
}

// ============ Login Item Settings ============

function updateLoginItemSettings(openAtLogin: boolean): void {
  loginItemSettings.openAtLogin = openAtLogin;
  app.setLoginItemSettings({
    openAtLogin,
    path: app.getPath('exe'),
  });
}

// ============ IPC Handlers ============

function setupIpcHandlers(): void {
  // Window controls
  ipcMain.handle('window:minimize', () => mainWindow?.minimize());
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.handle('window:close', () => mainWindow?.hide());
  ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized());
  ipcMain.handle('window:setAlwaysOnTop', (_, value: boolean) => {
    isAlwaysOnTop = value;
    mainWindow?.setAlwaysOnTop(value);
    return value;
  });
  ipcMain.handle('window:getAlwaysOnTop', () => isAlwaysOnTop);

  // Tray
  ipcMain.handle('tray:showNotification', (_, title: string, body: string) => {
    showNotification(title, body);
  });

  // Login item
  ipcMain.handle('app:getLoginItemSettings', () => loginItemSettings);
  ipcMain.handle('app:setLoginItemSettings', (_, openAtLogin: boolean) => {
    updateLoginItemSettings(openAtLogin);
    return loginItemSettings;
  });

  // App info
  ipcMain.handle('app:getVersion', () => app.getVersion());
  ipcMain.handle('app:getName', () => app.getName());
  ipcMain.handle('app:getPath', (_, name: 'userData' | 'appData' | 'home' | 'desktop' | 'documents' | 'downloads') => {
    return app.getPath(name);
  });

  // Open external links
  ipcMain.handle('shell:openExternal', (_, url: string) => {
    shell.openExternal(url);
  });
}

// ============ App Lifecycle ============

// Extend app type to include isQuitting
declare module 'electron' {
  interface App {
    isQuitting?: boolean;
  }
}

app.whenReady().then(() => {
  // Setup IPC handlers first
  setupIpcHandlers();

  // Create window
  createWindow();

  // Create tray
  createTray();

  // Register global shortcuts
  registerGlobalShortcuts();

  // Load saved login item settings
  const savedLoginSettings = app.getLoginItemSettings();
  if (savedLoginSettings.openAtLogin !== undefined) {
    loginItemSettings.openAtLogin = savedLoginSettings.openAtLogin;
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      restoreWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
