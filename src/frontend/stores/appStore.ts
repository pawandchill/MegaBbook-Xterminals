import { create } from 'zustand';

export type AppTheme = 'dark' | 'light';

interface AppStoreState {
  theme: AppTheme;
  selectedHostId: string | null;
  terminalSearch: string;
  setTheme: (theme: AppTheme) => void;
  setSelectedHostId: (hostId: string | null) => void;
  setTerminalSearch: (query: string) => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  theme: 'dark',
  selectedHostId: null,
  terminalSearch: '',
  setTheme: (theme) => set({ theme }),
  setSelectedHostId: (selectedHostId) => set({ selectedHostId }),
  setTerminalSearch: (terminalSearch) => set({ terminalSearch })
}));
