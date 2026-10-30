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
  sessions: {
    list: (): Promise<Array<{ id: string; title: string; hostId?: string; status: string; createdAt: string; updatedAt: string }>> => ipcRenderer.invoke('sessions:list'),
    create: (payload: { id: string; title: string; hostId?: string; status?: string }): Promise<{ id: string; title: string; hostId?: string; status: string }> => ipcRenderer.invoke('sessions:create', payload)
  },
  ssh: {
    connect: (host: ConnectionHost): Promise<ConnectionStatus> => ipcRenderer.invoke('ssh:connect', host),
    disconnect: (hostId: string): Promise<boolean> => ipcRenderer.invoke('ssh:disconnect', hostId),
    onOutput: (callback: (output: string) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, output: string) => callback(output);
      ipcRenderer.on('ssh:output', listener);
      return () => ipcRenderer.removeListener('ssh:output', listener);
    }
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
