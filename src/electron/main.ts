import { app, BrowserWindow, Menu, Notification, Tray, ipcMain } from 'electron';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { DatabaseService } from '../backend/services/DatabaseService.js';
import { SettingsService } from '../backend/services/SettingsService.js';
import { SSHConnectionManager } from '../backend/services/SSHConnectionManager.js';
import { SessionManager } from '../backend/services/SessionManager.js';
import type { AppSettings, ConnectionHost } from '../shared/types.js';

const isDevelopment = !app.isPackaged;
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const databaseService = new DatabaseService();
const settingsService = new SettingsService(databaseService);
const sshManager = new SSHConnectionManager();
const sessionManager = new SessionManager(databaseService);

async function initializeApplication() {
  await databaseService.initialize();
  await settingsService.ensureDefaults();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1520,
    height: 980,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: '#020817',
    titleBarStyle: 'hiddenInset',
    title: 'MegaBbook Xterminal',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDevelopment) {
    void mainWindow.loadURL('http://localhost:5173');
  } else {
    void mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createTray();
}

function createTray() {
  if (tray) {
    return;
  }

  const trayIconPath = path.join(process.cwd(), 'assets', 'tray-icon.png');
  if (existsSync(trayIconPath)) {
    tray = new Tray(trayIconPath);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show app', click: () => mainWindow?.show() },
      { label: 'Hide app', click: () => mainWindow?.hide() },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() }
    ]);

    tray.setToolTip('MegaBbook Xterminal');
    tray.setContextMenu(contextMenu);
  }
}

function registerIpcHandlers() {
  ipcMain.handle('settings:get', async () => settingsService.getSettings());
  ipcMain.handle('settings:save', async (_event, patch: Partial<AppSettings>) => settingsService.update(patch));
  ipcMain.handle('hosts:list', async () => databaseService.listHosts());
  ipcMain.handle('hosts:save', async (_event, host: ConnectionHost) => databaseService.upsertHost(host));
  ipcMain.handle('hosts:delete', async (_event, hostId: string) => databaseService.deleteHost(hostId));
  ipcMain.handle('sessions:list', async () => sessionManager.listSessions());
  ipcMain.handle('sessions:create', async (_event, payload: { id: string; title: string; hostId?: string; status?: string }) =>
    sessionManager.createSession({
      id: payload.id,
      title: payload.title,
      hostId: payload.hostId,
      status: (payload.status as 'connected' | 'disconnected' | 'connecting' | 'error') ?? 'connected',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  );

  ipcMain.handle('ssh:connect', async (event, host: ConnectionHost) => {
    const status = await sshManager.connect(host, event.sender);
    if (status.status === 'connected') {
      await sessionManager.createSession({
        id: host.id,
        title: host.name,
        hostId: host.id,
        status: 'connected',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    return status;
  });

  ipcMain.handle('ssh:disconnect', async (_event, hostId: string) => sshManager.disconnect(hostId));
  ipcMain.on('terminal:data', (_event, data: string) => sshManager.writeToActiveSession(data));
}

app.whenReady().then(async () => {
  await initializeApplication();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  new Notification({
    title: 'MegaBbook Xterminal',
    body: 'Application initialized.'
  }).show();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
