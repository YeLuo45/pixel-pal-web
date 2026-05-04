import { Tray, Menu, nativeImage, Notification, app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

// Tray instance
let tray: Tray | null = null;

// Always on top state reference (set by main)
let isAlwaysOnTop = false;
let mainWindowRef: Electron.BrowserWindow | null = null;

/**
 * Create system tray with right-click menu
 */
export function createTray(window: Electron.BrowserWindow): Tray {
  mainWindowRef = window;

  // Create tray icon
  const iconPath = path.join(__dirname, '../renderer/icon.png');
  let trayIcon: nativeImage;

  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  } else {
    // Fallback: create empty icon
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show PixelPal',
      click: () => restoreWindow(),
    },
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: isAlwaysOnTop,
      click: (menuItem) => {
        isAlwaysOnTop = menuItem.checked;
        mainWindowRef?.setAlwaysOnTop(isAlwaysOnTop);
        mainWindowRef?.webContents.send('always-on-top-changed', isAlwaysOnTop);
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

  // Double-click to restore window
  tray.on('double-click', restoreWindow);

  return tray;
}

/**
 * Restore and focus the main window
 */
export function restoreWindow(): void {
  if (mainWindowRef) {
    if (mainWindowRef.isMinimized()) mainWindowRef.restore();
    mainWindowRef.show();
    mainWindowRef.focus();
  }
}

/**
 * Show a native notification
 */
export function showNotification(title: string, body: string): void {
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

/**
 * Update tray icon
 */
export function setTrayIcon(iconPath: string): void {
  if (tray && fs.existsSync(iconPath)) {
    const newIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
    tray.setImage(newIcon);
  }
}

/**
 * Update always-on-top checkbox state
 */
export function setAlwaysOnTopState(value: boolean): void {
  isAlwaysOnTop = value;
  if (tray) {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show PixelPal',
        click: restoreWindow,
      },
      {
        label: 'Always on Top',
        type: 'checkbox',
        checked: value,
        click: (menuItem) => {
          isAlwaysOnTop = menuItem.checked;
          mainWindowRef?.setAlwaysOnTop(isAlwaysOnTop);
          mainWindowRef?.webContents.send('always-on-top-changed', isAlwaysOnTop);
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
    tray.setContextMenu(contextMenu);
  }
}

/**
 * Destroy tray
 */
export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
