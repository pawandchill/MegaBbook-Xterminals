import { contextBridge, ipcRenderer } from 'electron';
import type { AppSettings, ConnectionHost, ConnectionStatus } from '../shared/types.js';

const api = {
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
    save: (patch: Partial<AppSettings>): Promise<AppSettings> => ipcRenderer.invoke('settings:save', patch)
  },
  hosts: {
    list: (): Promise<ConnectionHost[]> => ipcRenderer.invoke('hosts:list'),
    save: (host: ConnectionHost): Promise<ConnectionHost> => ipcRenderer.invoke('hosts:save', host),
    delete: (hostId: string): Promise<boolean> => ipcRenderer.invoke('hosts:delete', hostId)
  },
  ssh: {
    connect: (host: ConnectionHost): Promise<ConnectionStatus> => ipcRenderer.invoke('ssh:connect', host),
    disconnect: (hostId: string): Promise<boolean> => ipcRenderer.invoke('ssh:disconnect', hostId),
    onOutput: (callback: (data: string) => void) => ipcRenderer.on('ssh:output', (_event, output: string) => callback(output)),
    removeOutput: (callback: (data: string) => void) => ipcRenderer.removeListener('ssh:output', (_event, output: string) => callback(output))
  },
  terminal: {
    sendData: (data: string) => ipcRenderer.send('terminal:data', data)
  }
};

contextBridge.exposeInMainWorld('xtermApp', api);

declare global {
  interface Window {
    xtermApp: typeof api;
  }
}
