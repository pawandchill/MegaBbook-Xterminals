import fs from 'node:fs';
import path from 'node:path';
import sqlite3 from 'sqlite3';
import type { AppSettings, ConnectionHost } from '../../shared/types.js';

export class DatabaseService {
  private db: sqlite3.Database | null = null;

  private resolveDatabasePath(): string {
    const electronApp = (() => {
      try {
        return require('electron').app;
      } catch {
        return null;
      }
    })();

    if (electronApp) {
      return path.join(electronApp.getPath('userData'), 'megabbook-xterminal.db');
    }

    return path.join(process.cwd(), '.megabbook-xterminal', 'megabbook-xterminal.db');
  }

  private async ensureDatabase(): Promise<void> {
    if (this.db) {
      return;
    }

    const dbPath = this.resolveDatabasePath();
    const directory = path.dirname(dbPath);
    fs.mkdirSync(directory, { recursive: true });

    this.db = new sqlite3.Database(dbPath);
  }

  private async run(sql: string, params: unknown[] = []): Promise<void> {
    await this.ensureDatabase();
    return new Promise<void>((resolve, reject) => {
      this.db!.run(sql, params, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private async all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    await this.ensureDatabase();
    return new Promise<T[]>((resolve, reject) => {
      this.db!.all(sql, params, (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  private async get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    await this.ensureDatabase();
    return new Promise<T | undefined>((resolve, reject) => {
      this.db!.get(sql, params, (error, row) => {
        if (error) {
          reject(error);
        } else {
          resolve((row as T | undefined) ?? undefined);
        }
      });
    });
  }

  async initialize(): Promise<void> {
    await this.ensureDatabase();
    const schema = `
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS connection_hosts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        host TEXT NOT NULL,
        port INTEGER NOT NULL DEFAULT 22,
        username TEXT NOT NULL,
        password TEXT,
        private_key TEXT,
        passphrase TEXT,
        description TEXT,
        group_name TEXT,
        tags TEXT,
        favorite INTEGER NOT NULL DEFAULT 0,
        recent INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        host_id TEXT,
        status TEXT NOT NULL DEFAULT 'connected',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS terminal_logs (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        direction TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS host_groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        created_at TEXT NOT NULL
      );
    `;

    await this.run(schema);
  }

  async setSetting(key: string, value: unknown): Promise<void> {
    await this.ensureDatabase();
    await this.run('INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [
      key,
      JSON.stringify(value)
    ]);
  }

  async getSetting<T>(key: string, fallback: T): Promise<T> {
    const row = await this.get<{ value: string }>('SELECT value FROM app_settings WHERE key = ?', [key]);
    if (!row) {
      return fallback;
    }

    try {
      return JSON.parse(row.value) as T;
    } catch {
      return fallback;
    }
  }

  async getAllSettings(): Promise<Record<string, unknown>> {
    const rows = await this.all<{ key: string; value: string }>('SELECT key, value FROM app_settings ORDER BY key');
    const record: Record<string, unknown> = {};
    for (const row of rows) {
      try {
        record[row.key] = JSON.parse(row.value);
      } catch {
        record[row.key] = row.value;
      }
    }
    return record;
  }

  async upsertHost(host: ConnectionHost): Promise<ConnectionHost> {
    const tagsJson = JSON.stringify(host.tags ?? []);
    await this.run(
      `
        INSERT INTO connection_hosts (
          id, name, host, port, username, password, private_key, passphrase,
          description, group_name, tags, favorite, recent, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          host = excluded.host,
          port = excluded.port,
          username = excluded.username,
          password = excluded.password,
          private_key = excluded.private_key,
          passphrase = excluded.passphrase,
          description = excluded.description,
          group_name = excluded.group_name,
          tags = excluded.tags,
          favorite = excluded.favorite,
          recent = excluded.recent,
          updated_at = excluded.updated_at
      `,
      [
        host.id,
        host.name,
        host.host,
        host.port,
        host.username,
        host.password ?? null,
        host.privateKey ?? null,
        host.passphrase ?? null,
        host.description ?? null,
        host.group ?? null,
        tagsJson,
        host.favorite ? 1 : 0,
        host.recent ? 1 : 0,
        host.createdAt,
        host.updatedAt
      ]
    );

    return host;
  }

  async listHosts(): Promise<ConnectionHost[]> {
    const rows = await this.all<{
      id: string;
      name: string;
      host: string;
      port: number;
      username: string;
      password: string | null;
      private_key: string | null;
      passphrase: string | null;
      description: string | null;
      group_name: string | null;
      tags: string;
      favorite: number;
      recent: number;
      created_at: string;
      updated_at: string;
    }>('SELECT * FROM connection_hosts ORDER BY updated_at DESC');

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      host: row.host,
      port: row.port,
      username: row.username,
      password: row.password ?? undefined,
      privateKey: row.private_key ?? undefined,
      passphrase: row.passphrase ?? undefined,
      description: row.description ?? undefined,
      group: row.group_name ?? undefined,
      tags: JSON.parse(row.tags || '[]'),
      favorite: Boolean(row.favorite),
      recent: Boolean(row.recent),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async deleteHost(hostId: string): Promise<boolean> {
    await this.run('DELETE FROM connection_hosts WHERE id = ?', [hostId]);
    return true;
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await this.setSetting(key, value);
    }
  }
}
