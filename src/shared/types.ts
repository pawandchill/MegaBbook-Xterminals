export type ThemeMode = 'dark' | 'light';

export interface AppSettings {
  theme: ThemeMode;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  terminalScrollback: number;
  autoReconnect: boolean;
  enableNotifications: boolean;
  savePasswords: boolean;
}

export interface ConnectionHost {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  description?: string;
  group?: string;
  tags: string[];
  favorite: boolean;
  recent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionStatus {
  id: string;
  host: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  startedAt: string;
  errorMessage?: string;
}

export interface SftpEntry {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modifiedAt: string;
  permissions: string;
}

export interface SessionLog {
  id: string;
  sessionId: string;
  timestamp: string;
  type: 'input' | 'output';
  content: string;
}

export interface SessionRecord {
  id: string;
  title: string;
  hostId?: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: '#3b82f6',
  fontFamily: 'Cascadia Code, Consolas, monospace',
  fontSize: 13,
  terminalScrollback: 20000,
  autoReconnect: true,
  enableNotifications: true,
  savePasswords: true
};
