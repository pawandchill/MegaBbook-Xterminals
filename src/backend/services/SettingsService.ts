import { DEFAULT_SETTINGS } from '../../shared/types.js';
import type { AppSettings } from '../../shared/types.js';
import { DatabaseService } from './DatabaseService.js';

export class SettingsService {
  constructor(private readonly database: DatabaseService) {}

  async ensureDefaults(): Promise<void> {
    const settings = await this.database.getAllSettings();
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      if (!(key in settings)) {
        await this.database.setSetting(key, value);
      }
    }
  }

  async getSettings(): Promise<AppSettings> {
    const persisted = await this.database.getAllSettings();
    const merged = { ...DEFAULT_SETTINGS, ...persisted } as AppSettings;
    return merged;
  }

  async update(patch: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const next = { ...current, ...patch };

    for (const [key, value] of Object.entries(next)) {
      await this.database.setSetting(key, value);
    }

    return next;
  }
}
