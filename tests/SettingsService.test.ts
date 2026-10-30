import { describe, expect, it } from 'vitest';
import { DatabaseService } from '../src/backend/services/DatabaseService.js';
import { SettingsService } from '../src/backend/services/SettingsService.js';

describe('SettingsService', () => {
  it('creates default settings and applies updates', async () => {
    const database = new DatabaseService();
    const settingsService = new SettingsService(database);

    await database.initialize();
    await settingsService.ensureDefaults();

    const settings = await settingsService.getSettings();
    expect(settings.theme).toBe('dark');
    expect(settings.autoReconnect).toBe(true);

    const updated = await settingsService.update({ theme: 'light', autoReconnect: false });
    expect(updated.theme).toBe('light');
    expect(updated.autoReconnect).toBe(false);
  });
});
