import { create } from 'zustand';
import type { AppSettings, ConnectionHost } from '../../shared/types.js';

interface AppState {
  settings: AppSettings;
  hosts: ConnectionHost[];
  activeTabId: string | null;
  setSettings: (patch: Partial<AppSettings>) => void;
  loadSettings: (settings: AppSettings) => void;
  setHosts: (hosts: ConnectionHost[]) => void;
  addHost: (host: ConnectionHost) => void;
  setActiveTab: (tabId: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  settings: {
    theme: 'dark',
    accentColor: '#3b82f6',
    fontFamily: 'Cascadia Code, Consolas, monospace',
    fontSize: 13,
    terminalScrollback: 20000,
    autoReconnect: true,
    enableNotifications: true,
    savePasswords: true
  },
  hosts: [],
  activeTabId: null,
  setSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
  loadSettings: (settings) => set({ settings }),
  setHosts: (hosts) => set({ hosts }),
  addHost: (host) => set((state) => ({ hosts: [...state.hosts, host] })),
  setActiveTab: (tabId) => set({ activeTabId: tabId })
}));
